var app = angular
    .module('MyApp', ['ngRoute', 'ngMaterial', 'ui.router', 'ngStorage'])
    .run(function($http, $templateCache, $localStorage) {
        $http.get('templates/header.html', {
            cache: $templateCache
        });

        if(!$localStorage.user) $localStorage.user = {};
    })
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('pink', {
                'default': '400', // by default use shade 400 from the pink palette for primary intentions
                'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
                'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
                'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
            })
            // If you specify less than all of the keys, it will inherit from the
            // default shades
            .accentPalette('purple', {
                'default': '200' // use shade 200 for default, and keep all other shades the same
            });
    })
    .config(function($stateProvider, $urlRouterProvider) {
        var dir = 'templates/';
        $stateProvider
            .state('index', {
                url: "/",
                views: {
                    "header": {
                        templateUrl: dir + 'header.html',
                    },
                    "main": {
                        templateUrl: dir + "start.html"
                    },
                    "link": {
                        templateUrl: dir + "link.html"
                    },
                    "footer": {
                        templateUrl: dir + 'footer.html',
                    },
                }
            })
            .state('debug', {
                url: "/debug",
                views: {
                    "header": {
                        templateUrl: dir + "header.html"
                    },
                    "main": {
                        templateUrl: dir + "game.html"
                    },
                    "link": {
                        templateUrl: dir + "link.html"
                    },
                    "debug": {
                        templateUrl: dir + "debug.html"
                    },
                    "footer": {
                        templateUrl: dir + 'footer.html',
                    },
                }
            })
            .state('battle', {
                url: "/battle",
                views: {
                    "header": {
                        templateUrl: dir + "header.html"
                    },
                    "main": {
                        templateUrl: dir + "game.html"
                    },
                    "link": {
                        templateUrl: dir + "link.html"
                    },
                    "footer": {
                        templateUrl: dir + 'footer.html',
                    },
                }
            })
            .state('help', {
                url: "/help",
                views: {
                    "header": {
                        templateUrl: dir + "header.html"
                    },
                    "main": {
                        templateUrl: dir + "help.html"
                    },
                    "link": {
                        templateUrl: dir + "link.html"
                    },
                    "footer": {
                        templateUrl: dir + 'footer.html',
                    },
                }
            })
            .state('chat', {
                url: "/chat",
                views: {
                    "header": {
                        templateUrl: dir + "header.html"
                    },
                    "main": {
                        templateUrl: dir + "chat.html"
                    },
                    "link": {
                        templateUrl: dir + "link.html"
                    },
                    "footer": {
                        templateUrl: dir + 'footer.html',
                    },
                }
            })
            .state('chatList', {
                url: "/chatList",
                views: {
                    "header": {
                        templateUrl: dir + "header.html"
                    },
                    "main": {
                        templateUrl: dir + "chatList.html"
                    },
                    "link": {
                        templateUrl: dir + "link.html"
                    },
                    "footer": {
                        templateUrl: dir + 'footer.html',
                    },
                }
            })
            .state('setting', {
                url: "/setting",
                views: {
                    "header": {
                        templateUrl: dir + "header.html"
                    },
                    "main": {
                        templateUrl: dir + "setting.html"
                    },
                    "link": {
                        templateUrl: dir + "link.html"
                    },
                    "footer": {
                        templateUrl: dir + 'footer.html',
                    },
                }
            });
        $urlRouterProvider.otherwise('/index');
        $urlRouterProvider.when('', '/');
    })
    .factory('AjaxService', function($window, $filter, $rootScope) {

        var AjaxService = {
            user: {},
            app: {},
            objRef: {},
            arrayRef: {},
            arrayRefKeys: {},
            storageRef: {}
        };

        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyCkVwS95pg9wxHBFFWIn00BCnwDL0ifJT8",
            authDomain: "project-3597707734440258770.firebaseapp.com",
            databaseURL: "https://project-3597707734440258770.firebaseio.com",
            storageBucket: "project-3597707734440258770.appspot.com",
        };

        var init = function() {
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {

                    // User is signed in.
                    var isAnonymous = user.isAnonymous;
                    var uid = user.uid;

                    var _user = firebase.auth().currentUser;
                    if (_user) {
                        this.user.name = user.name;
                        this.user.email = user.email;
                        this.user.photoURL = user.photoURL;
                        this.user.uid = user.uid; // The user's ID, unique to the Firebase project. Do NOT use
                        // this value to authenticate with your backend server, if
                        // you have one. Use User.getToken() instead.
                        $rootScope.$broadcast('updated');
                    }
                } else {
                    // User is signed out.
                    // ...
                }
                // ...
            });
        };

        var add = function(key, path, value, isDisconnectRemove) {
            if (!AjaxService.arrayRefKeys[key]) AjaxService.arrayRefKeys[key] = {};
            if (Array.isArray(value)) {
                if (AjaxService.arrayRefKeys[key].pushedKey) {
                    AjaxService.arrayRef[key] = firebase.database().ref(path + '/' + AjaxService.arrayRefKeys[key].pushedKey);
                    AjaxService.arrayRef[key].update(value[0]);
                } else {
                    AjaxService.arrayRef[key] = firebase.database().ref(path);
                    angular.forEach(value, function(_value) {
                        var newRef = AjaxService.arrayRef[key].push(_value);
                        AjaxService.arrayRefKeys[key].pushedKey = newRef.key;
                    });
                }
                if (isDisconnectRemove) AjaxService.arrayRef[key].onDisconnect().remove();
            } else {
                AjaxService.objRef[key] = firebase.database().ref(path);
                AjaxService.objRef[key].update(value);
                if (isDisconnectRemove) AjaxService.objRef[key].onDisconnect().remove();
            }
        };

        var refForObj = function(key, path) {
            if (!AjaxService.objRef[key]) AjaxService.objRef[key] = {};
            firebase.database().objRef(path).on('value', function(data) {
                if (data.val()) {
                    AjaxService.objRef[key].result = data.val();
                    $rootScope.$broadcast('updated');
                }
            });
        };

        var refForArray = function(key, path) {
            if (!AjaxService.arrayRef[key]) AjaxService.arrayRef[key] = {};
            firebase.database().ref(path).on('value', function(data) {
                if (data.val()) {
                    AjaxService.arrayRef[key].result = data.val();
                    $rootScope.$broadcast('updated');
                }
            });
        };

        var refForArrayFind = function(key, path, condition) {
            if (!AjaxService.arrayRef[key]) AjaxService.arrayRef[key] = {};
            firebase.database().ref(path).child(condition.key).equalTo(condition.value).on("value", function(data) {
                if (data.val()) {
                    AjaxService.arrayRef[key].result = data.val();
                    $rootScope.$broadcast('updated');
                }
            });
        };

        // condition = {key : 'test', value : 1}
        var ref = function(key, path, isArray, condition) {
            if (!isArray) {
                refForObj(key, path);
            } else if (condition) {
                refForArrayFind(key, path, condition);
            } else {
                refForArray(key, path);
            }
        };

        AjaxService.app = firebase.initializeApp(config);

        AjaxService.add = function(key, path, value, isDisconnectRemove) {
            add(key, path, value, isDisconnectRemove);
            return this;
        };

        AjaxService.updateArrayRefKey = function(path, key, newKey, data) {
            this.arrayRefKeys[key].pushedKey = newKey;
            data.isRequested = true;
            firebase.database().ref(path + '/' + newKey).update(data);
            return this;
        };

        AjaxService.ref = function(key, path, isArray, condition) {
            ref(key, path, isArray, condition);
            return this;
        };

        AjaxService.init = function() {
            init();
            return this;
        };

        AjaxService.getCurrentUser = function() {
            if (!this.arrayRef.users.result) return false;
            return this.arrayRef.users.result[this.arrayRefKeys.users.pushedKey];
        };

        AjaxService.getPushedKey = function(key) {
            if (!this.arrayRefKeys[key]) return 0;
            return this.arrayRefKeys[key].pushedKey;
        };

        AjaxService.getPushedResult = function(key, pushedKey) {
            if (!this.arrayRef[key]) return 0;
            if (!this.arrayRef[key].result) return 0;
            if (!this.arrayRef[key].result[pushedKey]) return 0;
            return this.arrayRef[key].result[pushedKey];
        };

        init();

        return AjaxService;
    })
    .factory('StorageService', function($window, $filter, $rootScope) {

        var StorageService = {
            storageRef: {},
            urls:{}
        };

        var init = function() {
            StorageService.storageRef = firebase.storage().ref();
        };

        init();

        StorageService.getImageRef = function(fileName, key ){
            this.storageRef.child(fileName).getDownloadURL().then(function(url) {
                StorageService.urls[key] = url;
                $rootScope.$broadcast('updated');
            }).catch(function(error) {
              // Handle any errors
            });
        };

        return StorageService;
    })
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
