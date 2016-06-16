app.controller('ChatCtrl', function($scope, $timeout, $mdDialog, $filter, GameService, AjaxService, StorageService) {
  $scope.auth = AjaxService;
  console.log(AjaxService)
  $scope.storage = StorageService;
});