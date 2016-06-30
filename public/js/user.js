app
	.factory('User', function(FireBaseService, $firebaseObject, $firebaseArray, $localStorage) {
		var _this = {};
		if (!FireBaseService.arrayRef.users) FireBaseService.setArrayRef('users', 'users');
		_this.get = function(uid) {
			var userRef = FireBaseService.arrayRef.users.orderByChild('uid').equalTo(uid);
			return $firebaseObject(userRef);
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
	.controller('UsersHeaderCtrl', function($scope, $rootScope, $localStorage, $state, $mdDialog, Speech, Loading, Header, Share) {
		Header.set();
		$scope.loading = Loading;
		$scope.header = Header;
		$scope.speech = Speech;

	})
	.controller('UserCtrl', function($scope, $rootScope, $localStorage, $mdToast, $sessionStorage, User, Users, File, Loading) {
		$scope.users = User.get($localStorage.user.uid);
		$scope.disableEdit = false;
		$scope.title = null;
		$scope.file = "";
		Loading.start();

		$scope.users.$watch(function() {
			Loading.finish();
		});

		$scope.updateUser = function(){
			$scope.users.$save().then(function(ref) {
				$mdToast.show($mdToast.simple().content('Saved').position('bottom'));
			});
		};


		$scope.$watch('file', function(newVal, oldVal) {
			if(newVal) $scope.upload();
		});

		$scope.upload = function(){
			if(!$scope.file) return;
			Loading.start();
			var id = false;
			angular.forEach($scope.users, function(user, userKey) {
				if( typeof user == 'object'){
					if(user.uid) id = userKey;
				}
			});
			$scope.uploadFileType = File.getFileType($scope.file.name);
			if($scope.uploadFileType == 'image'){
				File.getUploadFile($scope.file).then(function(uploadFileUrl){
					$scope.uploadFileUrl = uploadFileUrl;
					File.resizeFile(uploadFileUrl).then(function(resized){
						File.getUploadFile(resized.file).then(function(resizedUploadFileUrl){
							File.upload('users', 'users', resizedUploadFileUrl).then(function(uploadedImageUrl){
								if(!$scope.users[id].photos) $scope.users[id].photos = [];
								$scope.users[id].photos.push(uploadedImageUrl);
								$scope.users[id].photoURL = uploadedImageUrl;
								$scope.users.$save().then(function(ref) {
									$mdToast.show($mdToast.simple().content('Saved').position('bottom'));
									$scope.file = "";
								});
							});
						});
					});
				});
				return;
			}else{

			}
		};
	})
	.controller('FriendCtrl', function($scope, $localStorage, $mdToast, $sessionStorage, $stateParams, User, Users, Loading) {
		var id = $stateParams.value ? $stateParams.value.uid : $sessionStorage.toParams.value.uid;
		$scope.users = User.get(id);
		$scope.disableEdit = true;
		$scope.title = null;
		Loading.start();

		$scope.users.$watch(function() {
			Loading.finish();
		});

		$scope.updateUser = function(){
			$scope.users.$save().then(function(ref) {
				$mdToast.show($mdToast.simple().content('Saved').position('bottom'));
			});
		};
	})
	.controller('UserListCtrl', function($scope, $localStorage, $sessionStorage, User, Users, Loading) {
		$scope.users = Users.get();
		$scope.title = null;
		$scope.currentUser = User.get($localStorage.user.uid);

		$scope.currentUser.$watch(function(ref) {
			Loading.finish();
		});

		$scope.currentUser.$loaded()
		    .then(function(users) {
		    		var isExist = false;
				angular.forEach(users, function(user, userKey) {
					if( typeof user == 'object'){
						if(user.uid) isExist = true;
					}
				});
				if(!isExist){
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
