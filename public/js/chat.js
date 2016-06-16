app
    .factory('ChatService', function($window, $filter, $localStorage, AjaxService) {
        var ChatService = {
            user: {},
        };
        var rand = Math.floor(Math.random() * 11);
        var init = function() {
            ChatService.user = AjaxService.getCurrentUser();

            AjaxService
                .ref('chats', 'chats', true);
        };

        ChatService.addChat = function(name){
            var record = {
                key : 'chats',
                path: 'chats',
                value : [{
                    author: AjaxService.getCurrentUserKey(),
                    name: name  ? name + rand : 'Untitle ' + rand,
                    comments: [],
                    date: new Date().toISOString()
                }],
                isDisconnectRemove : false,
                isPush : false
            };
            AjaxService
                .pushValue( record );
        }

        ChatService.addComment = function() {
            if (!this.comment) return;
            var record = {
                key : 'chatCommentsts',
                path: 'chats/' + AjaxService.getPushedKey('chats') + '/comments',
                value : [{
                  detail: this.comment,
                  date: new Date().toISOString(),
                  name: $localStorage.user.firstName ? $localStorage.user.firstName : 'Mika_' + rand,
                  key: AjaxService.getCurrentUserKey(),
                }],
                isDisconnectRemove : false,
                isPush : true
            };
            AjaxService
                .ref('chatCommentsts', 'chats/' + AjaxService.getPushedKey('chats') + '/comments')
                .pushValue( record );
            return this;
        };

        init();
        return ChatService;
    })
    .controller('ChatCtrl', function($scope, $rootScope, $timeout, $mdDialog, $filter, $state, $stateParams, GameService, AjaxService, ChatService, StorageService) {
        $scope.auth = AjaxService;
        $scope.storage = StorageService;
        $scope.chat = ChatService;
        $scope.myChat = {};
        $scope.newChat = {};

        var chatPushedKey = '';

        if($stateParams.key && $stateParams.value){
          AjaxService.setPushedKey('chats', $stateParams.key)
          $scope.myChat = AjaxService.getPushedResult('chats', AjaxService.getPushedKey('chats'));
        }

        $scope.addChat = function() {
            ChatService.addChat($scope.newChat.title);
        };

        $scope.addComment = function() {
            ChatService.addComment();
        };

        $rootScope.$on('updated', function() {
          if(!chatPushedKey){
            chatPushedKey = AjaxService.getPushedKey('chats');
          }

            $scope.myChat = AjaxService.getPushedResult('chats', chatPushedKey);
            if(!$scope.$root) return;
            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                $scope.$apply();
            }
        });
    });
