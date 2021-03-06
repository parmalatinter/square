app
	.factory('LoginService', function($localStorage, $sessionStorage, $firebaseAuth, $state, User) {
		var auth = $firebaseAuth();
		var _this = { isLoding: false };

		auth.$onAuthStateChanged(function(firebaseUser) {
			if (firebaseUser) {
				$sessionStorage.user = {
					displayName: firebaseUser.displayName,
					email: firebaseUser.email,
					emailVerified: firebaseUser.emailVerified,
					isAnonymous: firebaseUser.isAnonymous,
					isLogedIn: true,
				};
				$localStorage.user = {
					displayName: firebaseUser.displayName,
					email: firebaseUser.email,
					uid: firebaseUser.uid
				};

				var users = User.get($localStorage.user.uid);
				var userKey = '';

				users.$loaded().then(function(users) {
			    	var photoURL = false;
					angular.forEach(users, function(user, key) {
						if( typeof user == 'object'){
							if(user.photoURL){
								photoURL = user.photoURL;
								userKey = userKey;
								name = user.name;
							}
						}
					});
					$sessionStorage.user.userKey = userKey;
					$sessionStorage.user.photoURL = photoURL;
					$localStorage.user.name = name;
				});
			}
		});

		_this.start = function() {
			_this.isLoding = true;
		};
		_this.login = function(type) {
			auth.$signInWithRedirect(type).then(function() {
			  // Never called because of page redirect
			}).catch(function(error) {
			  console.error("Authentication failed:", error);
			});
		};
		_this.logout = function() {
			auth.$signOut();
			$sessionStorage.user.isLogedIn = false;
		};

		_this.checkUser = function() {
			if (!$sessionStorage.user) {
				return false;
			} else if (!$sessionStorage.user.isLogedIn) {
				return false;
			}
			return true;
		};
		return _this;
	})
	.controller('LoginCtrl', function($scope, $timeout, $mdDialog, $filter, $state, $firebaseAuth, $localStorage, $sessionStorage, GameService, FireBaseService, FireBaseStorageService, LoginService) {
		$scope.login = LoginService;

		$scope.login = function(type) {
			LoginService.login(type);
		};
		$scope.logout = function(type) {
			LoginService.logout(type);
		};
		$scope.selectStage = function(stageKey, stage) {
			FireBaseService.updateArrayRefKey('stage', 'stage', stageKey, stage);
			$state.go('game');
			$mdDialog.hide();
		};
	});
