app
  .factory('User', function($filter, FireBaseService, $firebaseObject, $firebaseArray, $localStorage) {
    var _this = {};
    if (!FireBaseService.arrayRef.users) FireBaseService.setArrayRef('users', 'users');
    _this.get = function(uid) {
      var userRef = FireBaseService.arrayRef.users.orderByChild('uid').equalTo(uid);
      return $firebaseObject(userRef);
    };
    _this.getById = function(uid) {
      var userRef = FireBaseService.arrayRef.users.child(uid);
      return $firebaseObject(userRef);
    };
    _this.formatFirst = function(users) {
      var user = {};
      var count = 0;
      angular.forEach(users, function(userDetail, userDetailKey) {
        if (!$filter('inArray')(['$$conf', '$id', '$priority'], userDetailKey) && !count) {
          user = userDetail;
          user.Key = userDetailKey;
        }
      });
      return user;
    };
    return _this;
  })
  .factory('Users', function(FireBaseService, $firebaseObject, $firebaseArray) {
    var _this = {};
    if (!FireBaseService.arrayRef.users) FireBaseService.setArrayRef('users', 'users');
    var usersRef = FireBaseService.arrayRef.users;
    _this.get = function(key) {
      return $firebaseArray(usersRef);
    };
    return _this;
  })
  .factory('Request', function(FireBaseService, $firebaseObject, $firebaseArray) {
    var _this = {};
    if (!FireBaseService.arrayRef.requests) FireBaseService.setArrayRef('requests', 'requests');
    var resuestRef = FireBaseService.arrayRef.requests;

    _this.getById = function(uid) {
      var resuestRef = FireBaseService.arrayRef.requests.child(uid);
      return $firebaseObject(resuestRef);
    };

    return _this;
  })
  .factory('Requests', function(FireBaseService, $firebaseObject, $firebaseArray) {
    var _this = {};
    if (!FireBaseService.arrayRef.requests) FireBaseService.setArrayRef('requests', 'requests');
    var requestsRef = FireBaseService.arrayRef.requests;
    _this.get = function() {
      return $firebaseArray(requestsRef);
    };
    return _this;
  })
  .factory('Friends', function(FireBaseService, $firebaseObject, $firebaseArray) {
    var _this = {};
    if (!FireBaseService.arrayRef.friends) FireBaseService.setArrayRef('friends', 'friends');
    var friendsRef = FireBaseService.arrayRef.friends;
    _this.get = function() {
      return $firebaseArray(friendsRef);
    };

    _this.getById = function(uid) {
      var friendsRef = FireBaseService.arrayRef.friends.child(uid);
      return $firebaseObject(friendsRef);
    };

    _this.getChat = function(key) {
      FireBaseService.setObjRef('friends', 'friends/' + key);
      chatRef = FireBaseService.objRef.chat;
      return $firebaseObject(chatRef);
    };
    return _this;
  })
  .factory('FriendsChat', function(FireBaseService, $firebaseObject, $firebaseArray) {
    var _this = {};
    if (!FireBaseService.arrayRef.friendsChat) FireBaseService.setArrayRef('friends', 'friends');
    _this.get = function(key) {
      var friendsRef = FireBaseService.arrayRef.friends.child(key).child('chats/comment');
      return $firebaseArray(friendsRef);
    };
    return _this;
  })
  .controller('UsersHeaderCtrl', function($scope, $rootScope, $localStorage, $state, $mdDialog, Speech, Loading, Header, Share) {
    Header.set();
    $scope.loading = Loading;
    $scope.header = Header;
    $scope.speech = Speech;

  })
  .controller('UserCtrl', function($scope, $rootScope, $localStorage, $mdToast, $sessionStorage, User, Users, File, Loading) {
    $scope.user = User.getById($localStorage.user.uid);
    $scope.disableEdit = false;
    $scope.title = null;
    $scope.file = "";
    Loading.start();

    $scope.user.$loaded()
      .then(function(user) {
        if (user.uid !== $localStorage.user.uid) {
          Loading.start();
          $scope.user.name = $localStorage.user.displayName;
          $scope.user.age = 0;
          //1:men, 2 :women, 3   = other
          $scope.user.sexType = 1;
          $scope.user.message = 'よろしくね';
          $scope.user.date = Math.round(new Date().getTime() / 1000);
          $scope.user.uid = $localStorage.user.uid;
          $scope.user.photoURL = $sessionStorage.user.photoURL;
          $scope.user.imageUrl = null;
          $scope.user.$save().then(function(ref) {
            Loading.finish();
          });
        } else {
          Loading.finish();
        }
      });

    $scope.updateUser = function() {
      $scope.user.$save().then(function(ref) {
        $sessionStorage.user = {
          name: $scope.user.name,
          email: $scope.user.email,
          isLogedIn: true,
        };
        $localStorage.user = {
          name: $scope.user.name,
          email: $scope.user.email,
          uid: $scope.user.uid
        };
        $mdToast.show($mdToast.simple().content('Saved').position('bottom'));
      });
    };


    $scope.$watch('file', function(newVal, oldVal) {
      if (newVal) $scope.upload();
    });

    $scope.upload = function() {
      if (!$scope.file) return;
      Loading.start();
      $scope.uploadFileType = File.getFileType($scope.file.name);
      if ($scope.uploadFileType == 'image') {
        File.getUploadFile($scope.file).then(function(uploadFileUrl) {
          $scope.uploadFileUrl = uploadFileUrl;
          File.resizeFile(uploadFileUrl).then(function(resized) {
            File.getUploadFile(resized.file).then(function(resizedUploadFileUrl) {
              File.upload('users', 'users', resizedUploadFileUrl).then(function(uploadedImageUrl) {
                if (!$scope.user.photos) $scope.user.photos = [];
                $scope.user.photos.push(uploadedImageUrl);
                $scope.user.photoURL = uploadedImageUrl;
                $scope.user.$save().then(function(ref) {
                  $mdToast.show($mdToast.simple().content('Saved').position('bottom'));
                  $scope.file = "";
                });
              });
            });
          });
        });
        return;
      } else {

      }
    };
  })
  .controller('FriendCtrl', function($scope, $localStorage, $mdToast, $sessionStorage, $stateParams, User, Users, Loading) {
    var id = $stateParams.value ? $stateParams.value.uid : $sessionStorage.toParams.value.uid;
    $scope.user = User.getById(id);
    $scope.disableEdit = true;
    $scope.title = null;
    Loading.start();

    $scope.user.$watch(function() {
      Loading.finish();
    });

  })
  .controller('UserListCtrl', function($scope, $state, $localStorage, $sessionStorage, $filter, $mdToast, User, Users, Requests, Request, Friends, FriendsChat, Loading) {
    $scope.users = Users.get();
    $scope.title = null;

    $scope.friends = Friends.getById($localStorage.user.uid);
    var _requests = Request.getById($localStorage.user.uid);
    $scope.requests = {};

    _requests.$loaded()
      .then(function(request) {
        $scope.requests.users = {};
        angular.forEach(request.friends, function(isApplyed, friendKey) {
          if ($localStorage.user.uid != friendKey && !isApplyed) {
            $scope.requests.users[friendKey] = User.getById(friendKey);
          }
        });
        console.log($scope.requests.users)
      })
      .catch(function(error) {
        console.log("Error:", error);
      });

    $scope.friends.$loaded()
      .then(function(friends) {
        angular.forEach(friends.users, function(isApplyed, userKey) {
          if ($localStorage.user.uid != userKey) {
            $scope.friends.users[userKey] = User.getById(userKey);

            $scope.friends.users[userKey].$loaded()
              .then(function(friend) {
                console.log("friend:", friend);
              });
          }
        });
      })
      .catch(function(error) {
        console.log("Error:", error);
      });

    $scope.sendApply = function(uid) {
      if (!$scope.friends.users) $scope.friends.users = {}
      $scope.friends.users[uid] = true;
      $scope.friends.$save().then(function(ref) {

      	 _requests.friends[uid] = true;

      	 _requests.$save().then(function(ref) {
      	 	delete $scope.requests.users[uid]
      	 	$mdToast.show($mdToast.simple().content('Applyed').position('bottom'));
      	 });

        angular.forEach($scope.friends.users, function(isApplyed, userKey) {
          if ($localStorage.user.uid != userKey && isApplyed) {
            $scope.friends.users[userKey] = User.getById(userKey);

            $scope.friends.users[userKey].$loaded()
              .then(function(friend) {
                console.log("friend:", friend);
              });
          }
        });
      });


    };


    $scope.sendRequest = function(uid) {
      var friendRequest = Request.getById(uid);
      friendRequest.$loaded()
        .then(function(requests) {
          if (!friendRequest.friends) friendRequest.friends = {}
          friendRequest.friends[$localStorage.user.uid] = false
          friendRequest.$save().then(function(ref) {
            $mdToast.show($mdToast.simple().content('Requested').position('bottom'));
          })
        })
        .catch(function(error) {
          console.log("Error:", error);
        });
    };

    $scope.users.$watch(function() {
      Loading.finish();
    });

    $scope.goFriend = function(userId, user) {
      $state.go('friend', { key: userId, value: { uid: user.uid, name: user.name} });
    };

    $scope.goChat = function(userId, user) {
      $state.go('privateChat', { key: userId,  value: { uid: user.uid, name: user.name} });
    };

     $scope.goChatList = function(userId, user) {
      $state.go('privateChatList', { key: userId,  value: { uid: user.uid, name: user.name} });
    };
  });
