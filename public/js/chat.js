app
    .factory('ChatService', function($window, $filter, $localStorage, FireBaseService) {
        var ChatService = {
            user: {},
        };
        var rand = Math.floor(Math.random() * 11);
        var init = function() {
            ChatService.user = FireBaseService.getCurrentUser();

            FireBaseService.ref('chats', 'chats', true);
        };

        ChatService.addChat = function(name){
            var record = {
                key : 'chats',
                path: 'chats',
                value : [{
                    author: FireBaseService.getCurrentUserKey(),
                    name: name  ? name + rand : 'Untitle ' + rand,
                    comments: [],
                    date: new Date().toISOString()
                }],
                isDisconnectRemove : false,
                isPush : false
            };
            FireBaseService.pushValue( record );
        }

        ChatService.addComment = function() {
            if (!this.comment) return;
            var record = {
                key : 'chatCommentsts',
                path: 'chats/' + FireBaseService.getPushedKey('chats') + '/comments',
                value : [{
                  detail: this.comment,
                  date: new Date().toISOString(),
                  name: $localStorage.user.firstName ? $localStorage.user.firstName : 'Mika_' + rand,
                  key: FireBaseService.getCurrentUserKey(),
                }],
                isDisconnectRemove : false,
                isPush : true
            };
            FireBaseService
                .ref('chatCommentsts', 'chats/' + FireBaseService.getPushedKey('chats') + '/comments')
                .pushValue( record );
            return this;
        };

        init();
        return ChatService;
    })
    .controller('ChatCtrl', function($scope, $rootScope, $timeout, $mdDialog, $filter, $state, $stateParams, GameService, FireBaseService, ChatService, FireBaseStorageService) {
        $scope.auth = FireBaseService;
        $scope.storage = FireBaseStorageService;
        $scope.chat = ChatService;
        $scope.myChat = {};
        $scope.newChat = {};

        var chatPushedKey = '';

        if($stateParams.key && $stateParams.value){
          FireBaseService.setPushedKey('chats', $stateParams.key)
          $scope.myChat = FireBaseService.getPushedResult('chats', FireBaseService.getPushedKey('chats'));
        }

        $scope.addChat = function() {
            ChatService.addChat($scope.newChat.title);
            $scope.newChat.title = null;
        };

        $scope.addComment = function() {
            ChatService.addComment();
        };

        $rootScope.$on('updated', function() {
          if(!chatPushedKey){
            chatPushedKey = FireBaseService.getPushedKey('chats');
          }

            $scope.myChat = FireBaseService.getPushedResult('chats', chatPushedKey);
            if(!$scope.$root) return;
            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                $scope.$apply();
            }
        });
    });
