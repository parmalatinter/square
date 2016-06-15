app
  .directive('autoButton', function($compile) {
    var styles = {
      new: {
        multi: {
          color: '#FAFAFA',
          backgroundColor: '#3F51B5',
        },
        solo: {
          color: '#3F51B5',
          backgroundColor: 'transparent',
        }
      },
      update: {
        multi: {
          color: '#424242',
          backgroundColor: '#FFEB3B',
        },
        solo: {
          color: '#FFEB3B',
          backgroundColor: 'transparent',
        }
      },
      delete: {
        multi: {
          color: '#FAFAFA',
          backgroundColor: '#FF5722',
        },
        solo: {
          color: '#FF5722',
          backgroundColor: 'transparent',
        }
      },
      cancel: {
        multi: {
          color: '#424242',
          backgroundColor: '#FAFAFA',
        },
        solo: {
          color: '#FAFAFA',
          backgroundColor: 'transparent',
        }
      }
    };
    var getStyle = function(setting) {
      var result = {};
      switch (setting.type) {
        case 'new':
          result = styles.new;
          break;
        case 'update':
          result = styles.update;
          break;
        case 'delete':
          result = styles.delete;
          break;
        case 'cancel':
          result = styles.cancel;
          break;
        default:
          return;
      }

      if (setting.isBg) {
        return result.multi;
      } else {
        return result.solo;
      }

    };

    return {
      restrict: 'A',
      link: function(scope, ele, attrs) {

        var setting = eval('(' + attrs.autoButton + ')');

        ele.on('cut copy paste', function(event) {
          ele.preventDefault();
        });

        scope.$watch(attrs.autoButton, function() {
          var setting = eval('(' + attrs.autoButton + ')');
          ele.css(getStyle(setting));
        });

        if (!setting.tooltip) return;
        var html = '';
        if (setting.tooltip) {
          html = '<md-tooltip md-direction="' + setting.tooltip.direction + '">' + setting.tooltip.message + '</md-tooltip>';
        }

        ele.append(html);
        $compile(ele.contents())(scope);
      }
    };
  })
  .directive('openDialog', function($mdDialog) {
    var setDialog = function(ev, setting) {
      var title = setting.title ? setting.title : '';
      var controller = setting.controller ? setting.controller : 'DialogCtrl';
      var dir = 'templates/';
      var templateUrl = setting.templateUrl ? dir + setting.templateUrl : 'dialog.html';
      var message = setting.message ? setting.message : '';
      var ok = setting.ok ? setting.ok : 'OK';
      var parentEl = angular.element('#popupContainer');
      $mdDialog.show({
        controller: controller,
        controllerAs: 'ctrl',
        templateUrl: templateUrl,
        parent: parentEl,
        openFrom: parentEl,
        closeTo: parentEl,
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          title: title,
          message: message,
          ok: ok
        },
      });
    };
    return {
      restrict: 'A',
      link: function(scope, ele, attrs) {
        scope.$watch(attrs.openDialog, function(ev) {
          var setting = eval('(' + attrs.openDialog + ')');
          var isInit = setting.isInit ? setting.isInit : false;
          if (!isInit) return;
          setDialog(ev, setting);
        });

        ele.bind('click', function(ev) {
          var setting = eval('(' + attrs.openDialog + ')');
          var ok = setting.ok ? setting.ok : 'OK';
          setDialog(ev, setting);
        });
      }
    };
  })
  .directive('openToast', function($mdToast) {
    return {
      restrict: 'A',
      link: function(scope, ele, attrs) {
        scope.$watch(attrs.openToast, function() {
          var setting = eval('(' + attrs.openToast + ')');
          var isInit = setting.isInit ? setting.isInit : false;
          if (!isInit) return;
          $mdToast.show($mdToast.simple().content(setting.message).position(setting.pos ? setting.pos : 'bottom right'));
        });

        ele.bind('click', function() {
          var setting = eval('(' + attrs.openToast + ')');
          $mdToast.show($mdToast.simple().content(setting.message + ' form click').position(setting.pos ? setting.pos : 'bottom right'));
        });
      }
    };
  })
  .directive('openSidebar', function($mdSidenav) {
    return {
      restrict: 'A',
      link: function(scope, ele, attrs) {
        ele.bind('click', function() {
          $mdSidenav(attrs.openSidebar).toggle();
        });
      }
    };
  })
  .directive('showBottomSheet', function($mdBottomSheet) {
    return {
      restrict: 'A',
      link: function(scope, ele, attrs) {
        ele.bind('click', function($event) {
          $mdBottomSheet.show({
            template: '<md-bottom-sheet class="md-list md-has-header"><md-list> <md-item ng-repeat="item in items"><md-item-content md-ink-ripple flex class="inset"> <a flex aria-label="{{item.name}}" ng-click="listItemClick($index)"> <span class="md-inline-list-icon-label">{{ item.name }}</span> </a></md-item-content> </md-item> </md-list></md-bottom-sheet>',
            controller: 'ListBottomSheetCtrl',
            targetEvent: $event,
            disableBackdrop: true,
            disableParentScroll: false
          }).then(function(clickedItem) {
            if (!clickedItem) return;
            scope.alert = clickedItem.name + ' clicked!';
          });
        });
      }
    };
  })
  .directive('compile', ['$compile', function($compile) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.$watch(function() {
          return scope.$eval(attrs.compile);
        }, function(value) {
          element.html(value);
          $compile(element.contents())(scope);
        });
      }
    };
  }]);