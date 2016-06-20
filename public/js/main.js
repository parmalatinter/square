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
    .controller('MainCtrl', function($scope, $rootScope,  $timeout, $mdDialog, $filter, $state, $firebaseAuth, $localStorage, $sessionStorage, GameService, FireBaseService, FireBaseStorageService, LoginService) {


        $scope.session = $sessionStorage;
        $rootScope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams){

            if(toState.name == 'login') return;
            if(!LoginService.checkUser()){
                event.preventDefault();
                $state.go('login');
            }
        });

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
