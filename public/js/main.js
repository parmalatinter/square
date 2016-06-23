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
    .controller('HeaderCtrl', function($scope, $rootScope, $localStorage, $state, Loading, Header) {
        Header.set();
        $scope.header = Header;
        $scope.loading = Loading;
    })
    .controller('MainCtrl', function($scope, $rootScope,  $timeout, $mdDialog, $filter, $state, $firebaseAuth, $localStorage, $sessionStorage, GameService, FireBaseService, FireBaseStorageService, LoginService, Setting) {
        $scope.session = $sessionStorage;
        $scope.siteSetting = Setting.get();
        $scope.setting = {};
        $scope.mainBgColor = 'inherit';

        $scope.siteSetting.$watch(function() {
            if($localStorage.setting){
                if(typeof $localStorage.setting !== "object") $localStorage.setting　= {};
            }else{
                $localStorage.setting　= {};
            }
            $localStorage.setting.cache = $scope.siteSetting.cache;
            $scope.setting = $localStorage.setting;
        });
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            if(toParams.value && toParams.key){
                $sessionStorage.toParams = {
                    value : toParams.value,
                    key : toParams.key
                };
            }

            if(toState.name == 'login') return;
            if(!LoginService.checkUser()){
                event.preventDefault();
                $state.go('login');
            }
            if(toState.name == 'chat'){
                $scope.mainBgColor = 'black';
            }else{
                $scope.mainBgColor = 'inherit';
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

var worker = new Worker('js/worker/task.js');
worker.postMessage({file:'test.png'});

worker.addEventListener('message', function(e) {
    console.log(e.data);
}, false);