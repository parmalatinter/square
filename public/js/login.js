app.factory('LoginService', function($localStorage, $sessionStorage, $firebaseAuth, $state) {
        var auth = $firebaseAuth();
        var _this = { isLoding: false };
        _this.start = function() {
            _this.isLoding = true;
        };
        _this.login = function(type) {
            auth.$signInWithPopup(type).then(function(firebaseUser) {
                $sessionStorage.user = {
                    displayName: firebaseUser.user.displayName,
                    email: firebaseUser.user.email,
                    emailVerified: firebaseUser.user.emailVerified,
                    isAnonymous: firebaseUser.user.isAnonymous,
                    isLogedIn: true,
                };
                $localStorage.user = {
                    displayName: firebaseUser.user.displayName,
                    email: firebaseUser.user.email,
                }
            }).catch(function(error) {
                console.log("Authentication failed:", error);
            });
        };
        _this.logout = function() {
            auth.$signOut();
            $sessionStorage.user.isLogedIn = false;
        }

        _this.checkUser = function() {
            if (!$sessionStorage.user) {
                return false;
            } else if (!$sessionStorage.user.isLogedIn) {
                return false;
            }
            return true;
        }
        return _this;
    })
    .controller('LoginCtrl', function($scope, $timeout, $mdDialog, $filter, $state, $firebaseAuth, $localStorage, $sessionStorage, GameService, FireBaseService, FireBaseStorageService, LoginService) {
        $scope.login = LoginService;
        $scope.session = $sessionStorage;
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
    })
