app
	.factory('User', function(FireBaseService, $firebaseObject, $firebaseArray, $localStorage) {
		var _this = {};
		if (!FireBaseService.arrayRef.users) FireBaseService.setArrayRef('users', 'users');
		_this.getCurrent = function() {
			var userRef = FireBaseService.arrayRef.users.orderByChild('uid').equalTo($localStorage.user.uid);
			return $firebaseArray(userRef);
		};
		_this.get = function(uid) {
			var userRef = FireBaseService.arrayRef.users.orderByChild('uid').equalTo(uid);
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
		$scope.user = User.getCurrent();
		$scope.title = null;
		Loading.start();

		$scope.user.$watch(function() {
			Loading.finish();
		});

		$scope.updateUser = function(){
			$scope.user.$save().then(function(ref) {
				console.log(ref);
			});
		};
	})
	.controller('FriendCtrl', function($scope, $localStorage, $sessionStorage, $stateParams, User, Users, Loading) {
		var id = $stateParams.value ? $stateParams.value.uid : $sessionStorage.toParams.value.uid;
		$scope.friend = User.get(id);
		$scope.title = null;
		Loading.start();

		$scope.friend.$watch(function() {
			Loading.finish();
		});

		$scope.updateUser = function(){
			$scope.user.$save().then(function(ref) {
				console.log(ref);
			});
		};
	})
	.controller('UserListCtrl', function($scope, $localStorage, $sessionStorage, User, Users, Loading) {
		$scope.users = Users.get();
		$scope.title = null;
		$scope.currentUser = User.getCurrent();

		$scope.currentUser.$watch(function(ref) {
			Loading.finish();
		});

		$scope.currentUser.$loaded()
		    .then(function(user) {
				if(!user.length){
					Loading.start();
					var record = {
						name: $localStorage.user.displayName,
						age: 19,
						//1:men, 2 :women, 3  : other
						email: $localStorage.user.email,
						sexType: 1,
						message: 'よろしくね',
						date: Math.round(new Date().getTime() / 1000),
						uid: $localStorage.user.uid,
						photoURL: $sessionStorage.user.photoURL,
						imageUrl:null
					};
					$scope.users.$add(record).then(function(ref) {
						Loading.finish();
					});
				}
		    })
		    .catch(function(error) {
		        console.log("Error:", error);
		    });


		$scope.users.$watch(function() {
			Loading.finish();
		});
	});
