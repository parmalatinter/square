app
	.factory('Share', function() {
		var _this = {url : false};
		_this.setUrl = function(url) {
			_this.url = url;
			return _this;
		};
		_this.reset = function() {
			_this.url = '';
			return _this;
		};
		return _this;
	})
	.factory('Chats', function(FireBaseService, $firebaseArray) {
		var _this = {};
		if (!FireBaseService.arrayRef.chats) FireBaseService.setArrayRef('chats', 'chats');
		var chatsRef = FireBaseService.arrayRef.chats;
		_this.get = function(key) {
			return $firebaseArray(chatsRef);
		};
		return _this;
	})
	.factory('Chat', function(FireBaseService, $firebaseObject, $firebaseArray) {
		var _this = {};
		var chatRef = {};

		_this.get = function(key) {
			FireBaseService.setObjRef('chat', 'chats/' + key);
			chatRef = FireBaseService.objRef.chat;
			return $firebaseObject(chatRef);
		};

		_this.getComment = function(key, comment) {
			FireBaseService.setArrayRef('chatCommentsts', 'chats/' + key + '/comments');
			return $firebaseArray(FireBaseService.arrayRef.chatCommentsts);
		};

		return _this;
	})
	.factory('Comment', function(FireBaseService, $firebaseObject, $firebaseArray, $localStorage) {
		var _this = {};

		_this.get = function(chatKey,  commentKey) {
			FireBaseService.setObjRef('comment', 'chats/' + chatKey + '/comments/' + commentKey );
			commentRef = FireBaseService.objRef.comment;
			return $firebaseObject(commentRef);
		};
		return _this;
	})
	.controller('ChatsHeaderCtrl', function($scope, $rootScope, $localStorage, $state, $mdDialog, Speech, Loading, Header, Share) {
		Header.set();
		$scope.loading = Loading;
		$scope.header = Header;
		$scope.speech = Speech;

		$scope.showShareDialog = function(ev) {
			var confirm = $mdDialog.prompt()
				.title('シェアしたいURLを入力してください。')
				.textContent('リンク先としてコメント欄に表示されます。')
				.placeholder('URL')
				.ariaLabel('URL')
				.targetEvent(ev)
				.ok('Okay!')
				.cancel('Cancel.');
			$mdDialog.show(confirm).then(function(result) {
				if(!result) return;
				Share.setUrl(result) ;
			}, function() {
				//nothing todo
			});
		};

		$scope.playContinuity = function(){
			$rootScope.$broadcast('playContinuity');
		};

		$scope.pause = function(){
			$rootScope.$broadcast('pause');
		};

		$scope.cancel = function(){
			$rootScope.$broadcast('cancel');
		};

	})
	.controller('ChatShareCtrl', function($scope, Share) {
		$scope.share = Share;
	})
	.controller('ChatListCtrl', function($scope, $localStorage, $mdToast, Chats, Chat, Loading) {
		$scope.chats = Chats.get();
		$scope.chat = {};
		$scope.title = null;
		Loading.start();

		$scope.addChat = function() {
			if(!$scope.title) return;
			var record = {
				name: $localStorage.user.displayName ? $localStorage.user.displayName : 'Mika_' + rand,
				title:$scope.title,
				subTitle:$scope.subTitle ? $scope.subTitle : 'UNKNOWN',
				category:$scope.category ? $scope.category : 'UNKNOWN',
				comments: [],
				date: Math.round( new Date().getTime() / 1000 ),
				uid: $localStorage.user.uid ? $localStorage.user.uid : 0
			};
			$scope.chats.$add(record).then(function(ref) {
				var id = ref.key;
				$scope.chats.$indexFor(id); // returns location in the array
				$scope.title = null;
			});
		};

		$scope.delete = function(chat){
			$scope.chat = Chat.get( chat.$id);

			$scope.chat.$loaded().then(function(chat) {
				var title = chat.title;
				$scope.chat.$remove().then(function(ref) {
					var message = '[ ' + title + ' ]を削除しました。';
					$mdToast.show($mdToast.simple().content(message).position('bottom'));
				});
			})
			.catch(function(error) {
				console.log("Error:", error);
			});
		};

		$scope.chats.$watch(function() {
			Loading.finish();
		});
	})
	.controller('ChatCtrl', function($scope, $rootScope, $filter, $stateParams, $localStorage, $sessionStorage, $mdToast, ngAudio, Chat, Comment, File, Speech, Share, Loading, Vibration, Header) {
		$scope.chat = {};
		$scope.file = "";
		$scope.uploadFileUrl = "";
		$scope.commentText = '';
		$scope.share = Share;
		$scope.chatUpdateDisable = true;

		var _commentsCount = 0;

		var isInited = false;
		var isUpdatingChatInfo = false;

		if ($stateParams.value || $sessionStorage.toParams.value.$id) {
			Loading.start();
			var id = $stateParams.value ? $stateParams.value.$id : $sessionStorage.toParams.value.$id;
			$scope.chat = Chat.get(id);
			$scope.chat.$watch(function() {
				if($localStorage.user.uid == $scope.chat.uid){
					$scope.chatUpdateDisable = false;
				}
				Header.set($scope.chat.title);
				$scope.onDemand = true;
				$scope.dataset = {
					_comments: [],
					_refresh: function(data) {
						this._comments = data.filter(function(el) {
							return !angular.isDefined(el._excluded) || el._excluded === false;
						});
					},
					getItemAtIndex: function(index) {
						return this._comments[index];
					},
					getLength: function() {
							return this._comments.length;
						}
				};
				$scope.imageDataset = {
					_comments: [],
					_refresh: function(data) {
						this._comments = data.filter(function(el) {
							if(el.imageUrl && !el.fileType) el.fileType = File.getFileType(el.imageUrl);
							return !angular.isDefined(el._excluded) || el._excluded === false;
						});
					},
					getItemAtIndex: function(index) {
						return this._comments[index];
					},
					getLength: function() {
							return this._comments.length;
						}
				};
				$scope.chat.comments = $filter('orderObjectBy')($scope.chat.comments,'date', true);
				$scope.dataset._refresh($scope.chat.comments);
				$scope.chat.images = $filter('find')($scope.chat.comments,{imageUrl : 'boolean'}, false);
				$scope.imageDataset._refresh($scope.chat.images);

				Vibration.play(500);
				Loading.finish();

				if(_commentsCount == $scope.chat.comments.length){
					$scope.audioPlay('sounds/Clap-sound.mp3');
				}else{
					if(!isInited){
						isInited = true;
					} else if(!isUpdatingChatInfo && !$scope.chat.comments[0].isSpeeched ){
						var text = '';
						switch ($scope.chat.comments[0].fileType) {
							case ('image'):
								text = '画像がアップされました。';
								break;
							case ('sound'):
								text = 'サウンドがアップされました。';
								break;
							case ('movie'):
								text = 'イメージがアップされました。';
								break;
							case ('link'):
								text = 'リンクがシェアされました。';
								break;
							default :
								text = $scope.chat.comments[0].detail;
								break;
						}
						Speech.play(text);
	                    		$scope.chat.comments[0].isSpeeched = true;
	                    		angular.element('.md-virtual-repeat-scroller').scrollTop(0);
					}
				}

				_commentsCount = $scope.chat.comments.length;
				isUpdatingChatInfo = false;
			});

			$scope.addComment = function(imageUrl, shareUrl) {
				if (!$scope.commentText && !imageUrl && !shareUrl) return;
				Loading.start();
				var record = {
					date: Math.round( new Date().getTime() / 1000 ),
					name: $localStorage.user.displayName ? $localStorage.user.displayName : 'Mika_' + $filter('rand')(10),
					uid: $localStorage.user.uid ? $localStorage.user.uid : 0
				};
				if(imageUrl){
					record.imageUrl = imageUrl;
					record.fileType = File.getFileType(imageUrl);
				}else if(shareUrl){
					record.shareUrl = shareUrl;
					record.fileType = 'link';
				}else{
					record.detail = $scope.commentText;
				}
				var id = $stateParams.value ? $stateParams.value.$id : $sessionStorage.toParams.value.$id;
				$scope.comments = Chat.getComment(id, $scope.comment);
				$scope.comments.$add(record).then(function(ref) {
					var id = ref.key;
					$scope.comments.$indexFor(id); // returns location in the array
					$scope.commentText = '';
					$scope.file = '';
					Loading.finish();
				});
			};

			$scope.$watch('file', function(newVal, oldVal) {
				$scope.upload();
			});

			$scope.$watch('share.url', function(newVal, oldVal) {
				if(!newVal) return;
				$scope.addComment(false, newVal);
				Share.reset();
			});

			$scope.upload = function(){
				if(!$scope.file) return;
				Loading.start();
				$scope.uploadFileType = File.getFileType($scope.file.name);
				if($scope.uploadFileType == 'image'){
					File.getUploadFile($scope.file).then(function(uploadFileUrl){
						$scope.uploadFileUrl = uploadFileUrl;
						File.resizeFile(uploadFileUrl).then(function(resized){
							File.getUploadFile(resized.file).then(function(resizedUploadFileUrl){
								File.upload('chats', 'chats', resizedUploadFileUrl).then(function(uploadedImageUrl){
									$scope.addComment(uploadedImageUrl);
								});
							});
						});
					});
					return;
				}else{
					File.upload('chats', 'chats', $scope.file).then(function(uploadedFileUrl){
						if(typeof uploadedFileUrl === 'string' || uploadedFileUrl instanceof String){
							$scope.addComment(uploadedFileUrl);
						}
					});
				}
			};

			$scope.updateChat = function(){
				isUpdatingChatInfo = true;
				$scope.chat.$save().then(function(ref) {
					console.log(ref);
				});
			};
		}

		$scope.getDateStr = function(unixTimestamp){
			return new Date( unixTimestamp * 1000 ).toLocaleString();
		};

		$scope.getContainarSize = function(plusValue){
			return {height: (angular.element('.main').height() - 62) + 'px'};
		};

		$scope.audioPlay = function(url){
			var audio = ngAudio.load(url);
			audio.play();
		};

		$scope.speechPlay = function(text){
			Speech.play(text);
		};

		$rootScope.$on('playContinuity', function() {
			$scope.playContinuity();
		});

		$rootScope.$on('pause', function() {
			$scope.pause();
		});

		$rootScope.$on('cancel', function() {
			$scope.cancel();
		});

		$scope.playContinuity = function(){
			var commnets = $filter('find')($scope.chat.comments,{detail : 'boolean'});
			Speech.playContinuity(commnets);
		};

		$scope.pause = function(){
			Speech.pause();
		};

		$scope.cancel = function(){
			Speech.cancel();
		};

		$scope.thumbUp = function(commentKey){
			$scope.comment = Comment.get( this.chat.$id , commentKey);

			$scope.comment.$loaded().then(function(user) {
				if($scope.comment.goodCount){
					$scope.comment.goodCount += 1;
				}else{
					$scope.comment.goodCount = 1;
				}
				$scope.comment.updateText =  'いいね';
				$scope.comment.updateDate =  Math.round( new Date().getTime() / 1000 );
				isUpdatingChatInfo = true;
				$scope.comment.$save().then(function(ref) {
					Speech.play('いいね');
					$mdToast.show($mdToast.simple().content('いいね').position('bottom'));
				});
			})
			.catch(function(error) {
				console.log("Error:", error);
			});

		};

		$scope.thumbDown = function(commentKey){
			$scope.comment = Comment.get( this.chat.$id , commentKey);

			$scope.comment.$loaded().then(function(user) {
				if($scope.comment.badCount){
					$scope.comment.badCount += 1;
				}else{
					$scope.comment.badCount = 1;
				}
				$scope.comment.updateText =  '糞だね';
				$scope.comment.updateDate =  Math.round( new Date().getTime() / 1000 );
				isUpdatingChatInfo = true;
				$scope.comment.$save().then(function(ref) {
					Speech.play('クソだね');
					$mdToast.show($mdToast.simple().content('糞だね').position('bottom'));
				});
			})
			.catch(function(error) {
				console.log("Error:", error);
			});
		};


	});
