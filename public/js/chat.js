app
	.factory('ChatImage', function(FireBaseStorageService, $firebaseObject,File, ngAudio, $filter, $q) {
		var _this = {};
		var chatRef = {};

		_this.get = function(key, path, fileName) {
			var d = $q.defer();
			chatsRef = FireBaseStorageService.setObjRef(key, path, fileName);
			chatsRef.getDownloadURL().then(function(url) {
				d.resolve(url);
			}).catch(function(error) {
				d.resolve('error');
			});
			return d.promise;
		};

		_this.upload = function(key, path, file) {
			if(!file) return;
			var d = $q.defer();
			chatsRef = FireBaseStorageService.setObjRef(key, path , file.name);
			var uploadTask = chatsRef.put(file);
			uploadTask.on('state_changed', function(snapshot) {
				//d.resolve(snapshot);
				}, function(error) {
					d.resolve(error);
				}, function(snapshot) {
					d.resolve(uploadTask.snapshot.downloadURL);
			});
			return d.promise;
		};

		_this.getUploadFile = function(file) {
			if(!file) return;
			var d = $q.defer();
			File.readURL(file, d);
			return d.promise;
		};

		_this.getFileType = function(name){
			var fileType = name.split('.').pop().split('?')[0];
			if($filter('inArray')(['png','jpg', 'gif', 'bmp'], fileType)){
				return 'image';
			}else if($filter('inArray')(['mp3','wav', 'm4a'], fileType)){
				return 'sound';
			}else if($filter('inArray')(['wmv','mp4', 'mpeg', 'mov', 'avi'], fileType)){
				return 'movie';
			}
		};

		return _this;
	})
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
	.controller('ChatsHeaderCtrl', function($scope, $rootScope, $localStorage, $state, $mdDialog, Loading, Header, Share) {
		Header.set();
		$scope.loading = Loading;
		$scope.header = Header;

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

	})
	.controller('ChatShareCtrl', function($scope, Share) {
		$scope.share = Share;
	})
	.controller('ChatListCtrl', function($scope, $localStorage, Chats, Loading) {
		$scope.chats = Chats.get();
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

		$scope.chats.$watch(function() {
			Loading.finish();
		});
	})
	.controller('ChatCtrl', function($scope, $rootScope, $filter, $stateParams, $localStorage, $sessionStorage, ngAudio, Chat, ChatImage, Speech, Share, Loading, Vibration, Header) {
		$scope.chat = {};
		$scope.file = "";
		$scope.uploadFileUrl = "";
		$scope.chatImageUrl = '';
		$scope.comment = '';
		$scope.share = Share;
		$scope.chatUpdateDisable = true;

		var isInited = false;
		var isUpdatingChatInfo = false;

		if ($stateParams.value || $sessionStorage.toParams.value.$id) {
			Loading.start();
			var id = $stateParams.value ? $stateParams.value.$id : $sessionStorage.toParams.value.$id;
			$scope.chat = Chat.get(id);
			if($localStorage.user.uid == $scope.chat.uid){
				$scope.chatUpdateDisable = false;
			}
			$scope.chat.$watch(function() {
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
							if(el.imageUrl && !el.fileType) el.fileType = ChatImage.getFileType(el.imageUrl);
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
				$scope.chat.images = $filter('find')($scope.chat.comments,{imageUrl : true}, false);
				$scope.imageDataset._refresh($scope.chat.images);

				Vibration.play(500);
				Loading.finish();
				angular.element('.md-virtual-repeat-scroller').scrollTop(0);
				if(!isInited){
					isInited = true;
				} else if(isUpdatingChatInfo == false){
					var newMessage = $scope.chat.comments[0];
					var text = '';
					switch (newMessage.fileType) {
						case ('image'):
							text = '画像がアップされました。' + newMessage.detail;
							break;
						case ('sound'):
							text = 'サウンドがアップされました。'+ newMessage.detail;
							break;
						case ('movie'):
							text = 'イメージがアップされました。'+ newMessage.detail;
							break;
						case ('link'):
							text = 'リンクがシェアされました。'+ newMessage.detail;
							break;
						default :
							text = newMessage.detail;
							break;
					}
					Speech.play(text);
				}
				isUpdatingChatInfo = false;
			});

			$scope.addComment = function(imageUrl, shareUrl) {
				if (!$scope.comment && !imageUrl && !shareUrl) return;
				Loading.start();
				var record = {
					date: Math.round( new Date().getTime() / 1000 ),
					name: $localStorage.user.displayName ? $localStorage.user.displayName : 'Mika_' + $filter('rand')(10),
					uid: $localStorage.user.uid ? $localStorage.user.uid : 0
				};
				if(imageUrl){
					record.imageUrl = imageUrl;
					record.fileType = ChatImage.getFileType(imageUrl);
				}else if(shareUrl){
					record.shareUrl = shareUrl;
					record.fileType = 'link';
				}else{
					record.detail = $scope.comment;
				}
				var id = $stateParams.value ? $stateParams.value.$id : $sessionStorage.toParams.value.$id;
				$scope.comments = Chat.getComment(id, $scope.comment);
				$scope.comments.$add(record).then(function(ref) {
					var id = ref.key;
					$scope.comments.$indexFor(id); // returns location in the array
					$scope.comment = '';
					$scope.file = '';
					Loading.finish();
				});
			};

			$scope.$watch('file', function(newVal, oldVal) {
				$scope.upload();
			});

			$scope.$watch('share.url', function(newVal, oldVal) {
				if(!newVal) return;
				$scope.addComment(false, newVal)
				Share.reset();
			});

			$scope.upload = function(){
				if(!$scope.file) return;
				Loading.start();
				$scope.uploadFileType = ChatImage.getFileType($scope.file.name);
				ChatImage.upload('chats', 'chats', $scope.file).then(function(updateImageUrl){
					if(typeof updateImageUrl === 'string' || updateImageUrl instanceof String){
						$scope.updateImageUrl = updateImageUrl;
						$scope.addComment(updateImageUrl);
					}
				});
				if($scope.uploadFileType == 'image'){
					ChatImage.getUploadFile($scope.file).then(function(uploadFileUrl){
						$scope.uploadFileUrl = uploadFileUrl;
					});
					return;
				}
			};

			$scope.updateChat = function(){
				isUpdatingChatInfo = true;
				$scope.chat.$save().then(function(ref) {
					console.log(ref)
				});
			}
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

	});




	// .factory('ChatService', function($window, $filter, $localStorage, FireBaseService) {
	//     var ChatService = {
	//         user: {},
	//     };

	//     var init = function() {
	//         ChatService.user = FireBaseService.getCurrentUser();

	//         FireBaseService.ref('chats', 'chats', true);
	//     };

	//     ChatService.addChat = function(name) {
	//         var record = {
	//             key: 'chats',
	//             path: 'chats',
	//             value: [{
	//                 author: FireBaseService.getCurrentUserKey(),
	//                 name: name ? name + rand : 'Untitle ' + $filter('rand')(10),
	//                 comments: [],
	//                 date: Math.round( new Date().getTime() / 1000 )
	//             }],
	//             isDisconnectRemove: false,
	//             isPush: false
	//         };
	//         FireBaseService.pushValue(record);
	//     };

	//     ChatService.addComment = function() {
	//         if (!this.comment) return;
	//         var record = {
	//             key: 'chatCommentsts',
	//             path: 'chats/' + FireBaseService.getPushedKey('chats') + '/comments',
	//             value: [{
	//                 detail: this.comment,
	//                 date: Math.round( new Date().getTime() / 1000 ),
	//                 name: $localStorage.user.firstName ? $localStorage.user.firstName : 'Mika_' + $filter('rand')(10),
	//                 key: FireBaseService.getCurrentUserKey(),
	//             }],
	//             isDisconnectRemove: false,
	//             isPush: true
	//         };
	//         FireBaseService
	//             .ref('chatCommentsts', 'chats/' + FireBaseService.getPushedKey('chats') + '/comments')
	//             .pushValue(record);
	//         return this;
	//     };

	//     init();
	//     return ChatService;
	// })
