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
                        templateUrl: dir + "chat.html",
                        controller: 'ChatCtrl'
                    },
                    "link": {
                        templateUrl: dir + "link.html"
                    },
                    "footer": {
                        templateUrl: dir + 'footer.html',
                    },
                },
               params: {
                  key: null,
                  value: null
                }
            })
            .state('chatList', {
                url: "/chatList",
                views: {
                    "header": {
                        templateUrl: dir + "header.html"
                    },
                    "main": {
                        templateUrl: dir + "chatList.html",
                        controller: 'ChatCtrl',
                    },
                    "link": {
                        templateUrl: dir + "link.html"
                    },
                    "footer": {
                        templateUrl: dir + 'footer.html',
                    },
                },
               params: {
                  key: null,
                  value: null
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
    });