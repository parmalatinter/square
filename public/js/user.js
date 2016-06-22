app
    .factory('User', function(FireBaseService, $firebaseObject, $firebaseArray) {
        var _this = {};
        var userRef = {};

        _this.get = function(key) {
            FireBaseService.setObjRef('user', 'users/' + key);
            userRef = FireBaseService.objRef.user;
            return $firebaseObject(userRef);
        };

        return _this;
    })
    .factory('Users', function(FireBaseService, $firebaseObject, $firebaseArray) {
        var _this = {};
        if (!FireBaseService.objRef.users) FireBaseService.setObjRef('users', 'users');
        var usersRef = FireBaseService.objRef.users;
        _this.get = function(key) {
            return $firebaseObject(usersRef);
        };
        return _this;
    })
    .controller('UserListCtrl', function($scope, $localStorage, $sessionStorage, User, Users, Loading) {
        $scope.users = Users.get();
        $scope.currentUser = User.get($localStorage.user.uid);
        $scope.title = null;
        Loading.start();

        $scope.addUser = function() {
            //if (!$scope.title) return;
            this.currentUser.name = $localStorage.user.displayName,
            this.currentUser.age = 19,
            //1:men, 2 :women, 3  = other
            this.currentUser.sexType = 1,
            this.currentUser.message = [],
            this.currentUser.date = Math.round(new Date().getTime() / 1000),
            this.currentUser.uid = $localStorage.user.uid,
            this.currentUser.photoURL = $sessionStorage.user.photoURL,
            this.currentUser.$save().then(function(ref) {
                ///
            });
        };

        $scope.users.$watch(function() {
            Loading.finish();
        });
    });
