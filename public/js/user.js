app
    .factory('User', function(FireBaseService, $firebaseObject, $firebaseArray, $localStorage) {
        var _this = {};
        if (!FireBaseService.arrayRef.users) FireBaseService.setArrayRef('users', 'users');
        _this.get = function() {
            var userRef = FireBaseService.arrayRef.users.orderByChild('uid').equalTo($localStorage.user.uid);
            return $firebaseArray(userRef);
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
    .controller('UserCtrl', function($scope, $localStorage, $sessionStorage, User, Users, Loading) {
        $scope.user = User.get();
        $scope.title = null;
        Loading.start();

        $scope.user.$watch(function() {
            Loading.finish();
        });
    })
    .controller('UserListCtrl', function($scope, $localStorage, $sessionStorage, User, Users, Loading) {
        $scope.users = Users.get();
        $scope.currentUser = User.get($localStorage.user.uid);
        $scope.title = null;
        Loading.start();

        $scope.addUser = function() {
            var record = {
                    name : $localStorage.user.displayName,
                    age : 19,
                    //1:men, 2 :women, 3  : other
                    sexType : 1,
                    message : 'よろしくね',
                    date : Math.round(new Date().getTime() / 1000),
                    uid : $localStorage.user.uid,
                    photoURL : $sessionStorage.user.photoURL,
                };
            this.users.$add(record).then(function(ref) {
                ///
            });
        };

        $scope.users.$watch(function() {
            Loading.finish();
        });
    });
