app
.factory('ChatService', function($window, $filter, $localStorage, AjaxService){
  var ChatService = {
    user:{},
    chatPath:''
  };
  var init = function () {
    ChatService.user = AjaxService.getCurrentUser();
    ChatService.chatPath = 'chats/' + AjaxService.getCurrentUserKey();
    AjaxService
      .ref('chats', ChatService.chatPath)
      .add('chats', ChatService.chatPath , {
      name : $localStorage.user.firstName ? $localStorage.user.firstName : 'Mika_' + rand,
      comments :[],
      date: new Date().toISOString()
    });
  };

  ChatService.addComment = function(){
    if(!this.comment) return;
    AjaxService.add('chats', ChatService.chatPath + '/comments' , [{
      detail : this.comment,
      date: new Date().toISOString(),
      name : $localStorage.user.firstName ? $localStorage.user.firstName : 'Mika_' + rand,
      key : AjaxService.getCurrentUserKey(),
    }], false, true);
    return this;
  };

  init();
  return ChatService;
})
.controller('ChatCtrl', function($scope, $rootScope, $timeout, $mdDialog, $filter, GameService, AjaxService, ChatService, StorageService) {
  $scope.auth = AjaxService;
  $scope.storage = StorageService;
  $scope.chat = ChatService;
  $scope.myChat = {};

  $scope.addComment = function(){
    ChatService.addComment();
  };

  $rootScope.$on('updated', function() {
    $scope.myChat = AjaxService.getObjResult('chats');
    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
      $scope.$apply();
    }
  });
});