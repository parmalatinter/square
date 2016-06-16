app
  .factory('GameService', function($window, $filter, AjaxService) {
    var itemCount = 25;
    var themes = {
      'you': {
        'bgClass': 'md-accent',
        'bgColor': '#FFFFFF',
        'color': '#37474F'
      },
      'cpu': {
        'bgClass': 'md-primary',
        'bgColor': '#37474F',
        'color': '#FFFFFF'
      }
    };
    var teams = [{
      name: 'YOU',
      teamId: 1,
      icon: '&#9822;',
      theme: themes.you,
      friends: [],
      count: itemCount,
      key: 0
    }, {
      name: 'CPU',
      teamId: 2,
      icon: '&#9763;',
      theme: themes.cpu,
      friends: [],
      count: itemCount,
      key: 1
    }];
    var modeTypes = {
      start: 1,
      select: 2,
      battle: 3,
      result: 4,
      end: 5
    };

    var getIsSide = function(index) {
      var result = false;
      if (index == 1) {
        result = 'left';
      } else if (index % 5 === 0) {
        result = 'right';
      } else if ((index - 1) % 5 === 0) {
        result = 'left';
      }
      return result;
    };

    var shuffle = function(array, isInit) {
      var n = array.length,
        t, i;


      while (n) {
        i = Math.floor(Math.random() * n--);
        t = array[n];
        array[n] = array[i];
        array[i] = t;
        isFirst = false;
      }

      var isFirst = true;
      if (isInit) {
        for (var j = 0; j < array.length; j++) {
          array[j].position = j + 1;
          array[j].teamId = (array[j].key - 1) % 2 ? 1 : 2;
          array[j].side = getIsSide(j + 1);
          if (isFirst && array[j].teamId == 2) {
            array[j].teamId = 99;
            isFirst = false;
          }
        }

      } else {
        for (var k = 0; k < array.length; k++) {
          array[k].position = k + 1;
          array[k].side = getIsSide(k + 1);
        }
      }

      return array;
    };

    var update = function(item, isBattle) {
      var counts = [];
      for (var i = 0; i < Object.keys(GameService.teams).length; i++) {
        counts.push(0);
      }
      for (var j = 0; j < GameService.items.length; j++) {
        var teamId = GameService.items[j].teamId - 1;
        if (teamId == 'undefind') continue;
        GameService.items[j].isAround = GameService.getSituation(item, GameService.items[j]);
        if (GameService.items[j].teamId) {
          counts[teamId] = counts[GameService.items[j].teamId - 1] + 1;
        }
        if (GameService.items[j].key == item.key && !isBattle) {
          GameService.items[j].isSelected = true;
        }
      }

      for (var k = 0; k < Object.keys(GameService.teams).length; k++) {
        GameService.teams[k].count = counts[k];
        if (!counts[k]) {
          GameService.teams[k].isLose = true;
          GameService.isFinished = true;
        }
      }

      var loseTeams = $filter('find')(GameService.teams, {
        count: 0
      }, true);

      if (GameService.isFinished) {
        for (var l = 0; l < GameService.teams.length; l++) {
          if (!GameService.teams[l].isLose) {
            GameService.teams[l].isWin = true;
          }
        }
      }
    };

    var switchItem = function() {
      GameService.items[GameService.selectedItem.squareIndex].teamId = null;
      GameService.items[GameService.selectedItem.squareIndex].teamId = null;
      GameService.items[GameService.selectedTargetItem.squareIndex].teamId = GameService.selectedTeam.teamId;
      GameService.items[GameService.selectedTargetItem.squareIndex].power = GameService.items[GameService.selectedItem.squareIndex].power;
    };

    var changeMode = function(item, index) {

      if (GameService.isFinished) return;
      item.squareIndex = index;

      if (!item.teamId) {
        GameService
          .selectTarget(item)
          .switchItem(item)
          .switchTeam()
          .update(item)
          .reset()
          .setMode(GameService.modeTypes.result);
      } else if (item.teamId == GameService.selectedTeam.teamId) {
        //nowteam
        GameService
          .setMode(GameService.modeTypes.slect)
          .selectTarget(item)
          .select(item)
          .reset()
          .update(item);
      } else {
        //other team
        GameService
          .setMode(GameService.modeTypes.battle)
          .selectTarget(item)
          .judge(item)
          .update(item, true)
          .reset()
          .setMode(GameService.modeTypes.result);
      }
      if (item.teamId == 99) GameService.shuffle();
      if (GameService.isFinished) GameService.switchTeam();

      var _teams = angular.toJson(GameService.teams);
      _teams = JSON.parse(_teams);
      var _selectedTeam = angular.toJson(GameService.selectedTeam);
      _selectedTeam = JSON.parse(_selectedTeam);

      var stagePushedKey = AjaxService.getPushedKey('stage');
      var stage = AjaxService.getPushedResult('stage', stagePushedKey);
      var userPushedKey = AjaxService.getPushedKey('users');


      if(!$filter('inArray')(stage.users, userPushedKey) && stage.users){
        stage.users.push(userPushedKey);
      }
      var record = {
          key : 'stage',
          path: 'stage',
          value : [{
              item: item,
              items: GameService.items,
              teams: _teams,
              selectedItem: GameService.selectedItem,
              selectedTeam: _selectedTeam,
              users: [AjaxService.arrayRefKeys.users.pushedKey]
          }],
          isDisconnectRemove : true,
          isPush : false
      };

      AjaxService
        .pushValue( record );
    };

    var switchTeam = function() {
      GameService.selectedTeam = GameService.selectedTeam.teamId == 1 ? GameService.teams[1] : GameService.teams[0];
    };

    var select = function(item) {
      GameService.selectedItem = item;
    };

    var selectTarget = function(item) {
      GameService.selectedTargetItem = item;
    };

    var reset = function() {
      for (var i = 0; i < GameService.items.length; i++) {
        GameService.items[i].isSelected = false;
        GameService.items[i].isAround = false;
      }
    };

    var judge = function(item) {
      //oher team
      if (item.isAround) {
        //around
        if (item.power <= GameService.selectedItem.power) {
          //destory
          item.teamId = null;
          //GameService.teams[GameService.selectedTeam.key].friends.push(item);

        } else {
          //atack
          item.power = item.power - GameService.selectedItem.power;
        }
        GameService.selectedTeam = GameService.selectedTeam.teamId == 1 ? GameService.teams[1] : GameService.teams[0];
      } else {
        //not around
      }
    };

    var GameService = {
      isFinished: false,
      myTeam: {},
      selectedTeam: {},
      selectedItem: {},
      modeTypes: modeTypes,
      modeType: modeTypes.start,
      teamSituation: false
    };

    GameService.getSituation = function(tergrtItem, item) {
      if (!tergrtItem) return false;
      var result = false;
      if (item.side == 'right' && tergrtItem.side == 'left') {
        return false;
      } else if (item.side == 'left' && tergrtItem.side == 'right') {
        return false;
      }
      switch (item.position) {
        case (tergrtItem.position + 1):
          return true;
        case (tergrtItem.position - 1):
          return true;
        case (tergrtItem.position + 5):
          return true;
        case (tergrtItem.position - 5):
          return true;
      }
      return false;
    };

    GameService.getTeams = function() {
      GameService.teams = teams;
      angular.forEach(GameService.teams, function(value, key) {
        //value.friends = [];
      });
      this.selectedTeam = GameService.teams[0];
      return this;
    };

    GameService.getItems = function() {
      this.items = new Array(itemCount);
      for (var j = 0; j < this.items.length; j++) {
        this.items[j] = {
          key: j + 1,
          power: j + 1,
          isSelected: false
        };
      }
      return this;
    };

    GameService.select = function(item) {
      select(item);
      return this;
    };

    GameService.selectTarget = function(item) {
      selectTarget(item);
      return this;
    };

    GameService.reset = function() {
      reset();
      return this;
    };

    GameService.judge = function(item) {
      judge(item);
      return this;
    };

    GameService.judge = function(item) {
      judge(item);
      return this;
    };

    GameService.changeMode = function(item, index) {
      changeMode(item, index);
      return this;
    };

    GameService.switchTeam = function() {
      switchTeam();
      return this;
    };

    GameService.update = function(item) {
      update(item);
      return this;
    };

    GameService.shuffle = function(isInit) {
      this.items = shuffle(this.items, isInit);
      return this;
    };

    GameService.setMode = function(modeType) {
      this.modeType = modeType;
      return this;
    };

    GameService.setTeam = function(teamKey) {
      this.myTeam = this.teams[teamKey];
      this.selectedItem = {};
      return this;
    };

    GameService.selectStage = function(stage) {
      this.myTeam = this.teams[teamKey];
      this.selectedItem = {};
      return this;
    };

    GameService.switchItem = function() {
      switchItem();
      return this;
    };

    return GameService;
  })
  .controller('GameSubCtrl', function($scope, $timeout, $mdDialog, $filter, GameService, AjaxService, StorageService) {
    $scope.game = GameService;
    $scope.auth = AjaxService;
    $scope.storage = StorageService;
    $scope.closeDialog = function() {
      $mdDialog.hide();
    };
    $scope.selectStage = function(stageKey, stage) {
      AjaxService.updateArrayRefKey('stage', 'stage', stageKey, stage);
      $mdDialog.hide();
    };
  })
  .controller('GameCtrl', function($scope, $timeout, $mdDialog, $state, $rootScope, $filter, $localStorage, GameService, AjaxService, StorageService) {

    var init = function() {
      $state.go('index');
      $scope.game = GameService.getTeams().getItems().shuffle(true).update({}, true);
      $scope.auth = AjaxService;
      $scope.storage = StorageService;
      GameService.teamSituation = false;
      GameService.isFinished = false;
      GameService.setTeam(0);

      var rand = Math.floor( Math.random() * 11 ) ;

      var record = {
          key : 'users',
          path: 'users',
          value : [{
            inBattle: false,
            enemyId : false,
            key: AjaxService.getCurrentUserKey(),
            name : $localStorage.user.firstName ? $localStorage.user.firstName : 'Mika_' + rand
          }],
          isDisconnectRemove : true,
          isPush : false
      };
      //key, path, isArray, isDisconnectRemove, condition
      AjaxService
        .ref('stage', 'stage', true)
        .ref('users', 'users', true)
        .pushValue( record );
    };

    $rootScope.$on('updated', function() {
      if (!AjaxService.arrayRef.stage) return;
      var stagePushedKey = AjaxService.getPushedKey('stage');
      var stage = AjaxService.getPushedResult('stage', stagePushedKey);
      var userPushedKey = AjaxService.getPushedKey('users');

      if (stage) {
        var teamId = stage.selectedTeam.teamId;
        if (userPushedKey != stage.user) {
          GameService.teamSituation = 'you';
        } else {
          GameService.teamSituation = 'other';
        }
        GameService.items = stage.items;

        GameService.stage = stage;

        if(!$filter('inArray')(GameService.stage.users, userPushedKey) && stage.users){
          GameService.stage.users.push(userPushedKey);
        }
      }

      if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
        $scope.$apply();
      }
    });

    $scope.init = function() {
      init();
    };

    $scope.shuffle = function() {
      GameService.shuffle();
    };

    $scope.attacable = function(item) {
      return item.isAround && item.teamId != GameService.selectedTeam.teamId && item.teamId && GameService.modeType != GameService.modeTypes.result;
    };

    $scope.isMytaem = function(item) {
      return GameService.teams[GameService.selectedTeam.key].teamId == item.teamId;
    };

    $scope.changeMode = function(item, index) {
      GameService.changeMode(item, index);
    };

    $scope.getUser = function(){
      return AjaxService.getCurrentUser();
    };

    $scope.start = function(){
      $state.go('battle');
    };

  });
