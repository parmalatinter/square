var app = angular
	.module('MyApp', ['ngRoute', 'ngMaterial', 'ngMdIcons', 'ui.router', 'ngStorage', 'firebase', 'ngAudio', 'images-resizer'])
	.run(function($http, $templateCache, $localStorage) {
		$http.get('templates/header.html', {
			cache: $templateCache
		});

		if (!$localStorage.user) $localStorage.user = {};
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
		var states = {
			header: {
				templateUrl: dir + "header.html",
				controller: 'HeaderCtrl'
			},
			chatsHeader: {
				templateUrl: dir + "chats/header.html",
				controller: 'ChatsHeaderCtrl'
			},
			usersHeader: {
				templateUrl: dir + "users/header.html",
				controller: 'UsersHeaderCtrl'
			},
			footer: {
				templateUrl: dir + 'footer.html'
			},
			debug: {
				templateUrl: dir + 'debug.html',
				controller: 'GameCtrl'
			},
			game: {
				templateUrl: dir + 'game.html',
				controller: 'GameCtrl'
			},
			link: {
				templateUrl: dir + "link.html"
			},
			main: {
				templateUrl: dir + "main.html",
			},
			chat: {
				templateUrl: dir + "chat.html",
				controller: 'ChatCtrl'
			},
			chatList: {
				templateUrl: dir + "chatList.html",
				controller: 'ChatListCtrl'
			},
			privateChat: {
				templateUrl: dir + "chat.html",
				controller: 'PrivateChatCtrl'
			},
			privateChatList : {
				templateUrl: dir + "chatList.html",
				controller: 'PrivateChatListCtrl'
			},
			user: {
				templateUrl: dir + "user.html",
				controller: 'UserCtrl'
			},
			friend: {
				templateUrl: dir + "user.html",
				controller: 'FriendCtrl'
			},
			userList: {
				templateUrl: dir + "userList.html",
				controller: 'UserListCtrl'
			},
			login : {
				templateUrl: dir + "login.html",
				controller: 'LoginCtrl'
			},
			setting : {
				templateUrl: dir + "setting.html",
			}
		};
		$stateProvider
			.state('index', {
				url: "/",
				views: {
					"header": states.header,
					"main": states.main,
					"link": states.link,
					//"footer":states.footer
				}
			})
			.state('debug', {
				url: "/debug",
				views: {
					"header": states.header,
					"main": states.main,
					"link": states.link,
					"debug": states.debug,
					"footer": states.footer
				}
			})
			.state('game', {
				url: "/game",
				views: {
					"header": states.header,
					"main": states.game,
					"link": states.link,
					//"footer":states.footer
				}
			})
			.state('help', {
				url: "/help",
				views: {
					"header": states.header,
					"main": states.main,
					"link": states.link,
					//"footer":states.footer
				}
			})
			.state('friend', {
				url: "/friend",
				views: {
					"header": states.header,
					"main": states.friend,
					"link": states.link,
					//"footer":states.footer
				},
				params: {
					key: null,
					value: null
				}
			})
			.state('user', {
				url: "/user",
				views: {
					"header": states.usersHeader,
					"main": states.user,
					"link": states.link,
					//"footer":states.footer
				},
				params: {
					key: null,
					value: null
				}
			})
			.state('userList', {
				url: "/userList",
				views: {
					"header": states.header,
					"main": states.userList,
					"link": states.link,
					//"footer":states.footer
				}
			})
			.state('chat', {
				url: "/chat",
				views: {
					"header": states.chatsHeader,
					"main": states.chat,
					"link": states.link,
					//"footer":states.footer
				},
				params: {
					key: null,
					value: null
				}
			})
			.state('chatList', {
				url: "/chatList",
				views: {
					"header": states.chatsHeader,
					"main": states.chatList,
					"link": states.link,
					//"footer":states.footer
				},
				params: {
					key: null,
					value: null
				}
			})
			.state('privateChat', {
				url: "/privateChat",
				views: {
					"header": states.chatsHeader,
					"main": states.privateChat,
					"link": states.link,
					//"footer":states.footer
				},
				params: {
					key: null,
					value: null
				}
			})
			.state('privateChatList', {
				url: "/privateChatList",
				views: {
					"header": states.chatsHeader,
					"main": states.privateChatList,
					"link": states.link,
					//"footer":states.footer
				},
				params: {
					key: null,
					value: null
				}
			})
			.state('login', {
				url: "/login",
				views: {
					"header": states.header,
					"main": states.login,
					"link": states.link,
					//"footer":states.footer
				}
			})
			.state('setting', {
				url: "/setting",
				views: {
					"header": states.header,
					"main": states.setting,
					"link": states.link,
					//"footer":states.footer
				}
			});
		$urlRouterProvider.otherwise('/index');
		$urlRouterProvider.when('', '/');
	});
