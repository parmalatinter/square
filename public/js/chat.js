app
    .factory('ChatImage', function(FireBaseStorageService, $firebaseObject, $q) {
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
    .factory('ChatService', function($window, $filter, $localStorage, FireBaseService) {
        var ChatService = {
            user: {},
        };

        var init = function() {
            ChatService.user = FireBaseService.getCurrentUser();

            FireBaseService.ref('chats', 'chats', true);
        };

        ChatService.addChat = function(name) {
            var record = {
                key: 'chats',
                path: 'chats',
                value: [{
                    author: FireBaseService.getCurrentUserKey(),
                    name: name ? name + rand : 'Untitle ' + $filter('rand')(10),
                    comments: [],
                    date: Math.round( new Date().getTime() / 1000 )
                }],
                isDisconnectRemove: false,
                isPush: false
            };
            FireBaseService.pushValue(record);
        };

        ChatService.addComment = function() {
            if (!this.comment) return;
            var record = {
                key: 'chatCommentsts',
                path: 'chats/' + FireBaseService.getPushedKey('chats') + '/comments',
                value: [{
                    detail: this.comment,
                    date: Math.round( new Date().getTime() / 1000 ),
                    name: $localStorage.user.firstName ? $localStorage.user.firstName : 'Mika_' + $filter('rand')(10),
                    key: FireBaseService.getCurrentUserKey(),
                }],
                isDisconnectRemove: false,
                isPush: true
            };
            FireBaseService
                .ref('chatCommentsts', 'chats/' + FireBaseService.getPushedKey('chats') + '/comments')
                .pushValue(record);
            return this;
        };

        init();
        return ChatService;
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
                comments: [],
                date: Math.round( new Date().getTime() / 1000 )
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
    .controller('ChatCtrl', function($scope, $rootScope, $filter, $stateParams, $localStorage, Chat, ChatImage, Loading, Vibration) {
        $scope.chat = {};
        $scope.file = "";
        $scope.chatImageUrl = '';

        $scope.$watch('file', function(newVal, oldVal) {
            console.log(newVal, oldVal)
        });


        $scope.comment = '';
        Loading.start();

        if ($stateParams.value) {
            $scope.chat = Chat.get($stateParams.value.$id);

            $scope.chat.$watch(function() {
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
                Loading.finish();
                Vibration.play(500);
            });

            $scope.addComment = function(imageUrl) {
                if (!$scope.comment && !imageUrl) return;
                Loading.start();
                var record = {
                    date: Math.round( new Date().getTime() / 1000 ),
                    name: $localStorage.user.displayName ? $localStorage.user.displayName : 'Mika_' + $filter('rand')(10),
                };
                if(imageUrl){
                    record.imageUrl = imageUrl;
                }else{
                    record.detail = $scope.comment;
                }
                $scope.comments = Chat.getComment($stateParams.value.$id, $scope.comment);
                $scope.comments.$add(record).then(function(ref) {
                    var id = ref.key;
                    $scope.comments.$indexFor(id); // returns location in the array
                    Loading.finish();
                });
            };

            $scope.upload = function(){
                Loading.start();
                ChatImage.upload('chats', 'chats', $scope.file).then(function(updateImageUrl){
                    if(typeof updateImageUrl === 'string' || updateImageUrl instanceof String){
                        $scope.updateImageUrl = updateImageUrl;
                        $scope.addComment(updateImageUrl);
                    }
                });
            };
        }

    });
