app
    .controller('LocalStrageCtrl', function($scope, $localStorage) {
        $scope.$storage = $localStorage.$default({
            name: 'Anonimas'
        });
    })
    .controller('SessionStrageCtrl', function($scope, $sessionStorage) {
        $scope.$storage = $sessionStorage.$default({
            name: 'Anonimas'
        });
    })
    .controller('HeaderCtrl', function($scope, $rootScope, $localStorage, $state, Loading) {
        $scope.title = $state.current.name;
        $scope.$storage = $localStorage;
        $scope.loading = Loading;
    })
    .controller('MainCtrl', function($scope, $timeout, $mdDialog, $filter, $state, $firebaseAuth, $localStorage, $sessionStorage, GameService, FireBaseService, FireBaseStorageService) {
        $scope.game = GameService;
        $scope.auth = FireBaseService;
        $scope.storage = FireBaseStorageService;
        $scope.closeDialog = function() {
            $mdDialog.hide();
        };
        $scope.selectStage = function(stageKey, stage) {
            FireBaseService.updateArrayRefKey('stage', 'stage', stageKey, stage);
            $state.go('game');
            $mdDialog.hide();
        };

        var auth = $firebaseAuth();
        try {
          if($sessionStorage.user.isLogedIn) return;
        }catch(e){
           return;
        }
        auth.$signInWithPopup("google").then(function(firebaseUser) {
            $localStorage.user = {
                displayName: firebaseUser.user.displayName,
                email: firebaseUser.user.email,
                emailVerified: firebaseUser.user.emailVerified,
                isAnonymous: firebaseUser.user.isAnonymous,
            };
            $sessionStorage.user.isLogedIn = true;
        }).catch(function(error) {
            console.log("Authentication failed:", error);
        });
    })
    .controller('DialogCtrl', function($scope, $mdDialog, locals) {
        $scope.locals = locals;
        $scope.closeDialog = function() {
            $mdDialog.hide();
        };
    })
    .controller('ListBottomSheetCtrl', function($scope, $mdBottomSheet, $mdToast) {
        $scope.items = [{
            name: 'Share',
            icon: 'share'
        }, {
            name: 'Upload',
            icon: 'upload'
        }, {
            name: 'Copy',
            icon: 'copy'
        }, {
            name: 'Print this page',
            icon: 'print'
        }, ];

        $scope.listItemClick = function($index) {
            var clickedItem = $scope.items[$index];
            $mdBottomSheet.hide(clickedItem);
            $mdToast.show({
                template: '<md-toolbar>' +
                    '  <div class="md-toolbar-tools">' +
                    '    <h2>' +
                    '       <p>' + clickedItem.name + '</p>' +
                    '    </h2>' +
                    '  </div>' +
                    '  </md-toolbar>',
                position: 'top',
            });
        };
    });
