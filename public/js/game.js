app
	.factory('GameService', function($window, $filter, FireBaseService) {
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
			for (var i = 0; i < Object.keys(_this.teams).length; i++) {
				counts.push(0);
			}
			for (var j = 0; j < _this.items.length; j++) {
				var teamId = _this.items[j].teamId - 1;
				if (teamId == 'undefind') continue;
				_this.items[j].isAround = _this.getSituation(item, _this.items[j]);
				if (_this.items[j].teamId) {
					counts[teamId] = counts[_this.items[j].teamId - 1] + 1;
				}
				if (_this.items[j].key == item.key && !isBattle) {
					_this.items[j].isSelected = true;
				}
			}

			for (var k = 0; k < Object.keys(_this.teams).length; k++) {
				_this.teams[k].count = counts[k];
				if (!counts[k]) {
					_this.teams[k].isLose = true;
					_this.isFinished = true;
				}
			}

			var loseTeams = $filter('find')(_this.teams, {
				count: 0
			}, true);

			if (_this.isFinished) {
				for (var l = 0; l < _this.teams.length; l++) {
					if (!_this.teams[l].isLose) {
						_this.teams[l].isWin = true;
					}
				}
			}
		};

		var switchItem = function() {
			_this.items[_this.selectedItem.squareIndex].teamId = null;
			_this.items[_this.selectedItem.squareIndex].teamId = null;
			_this.items[_this.selectedTargetItem.squareIndex].teamId = _this.selectedTeam.teamId;
			_this.items[_this.selectedTargetItem.squareIndex].power = _this.items[_this.selectedItem.squareIndex].power;
		};

		var changeMode = function(item, index) {

			if (_this.isFinished) return;
			item.squareIndex = index;

			if (!item.teamId) {
				_this
					.selectTarget(item)
					.switchItem(item)
					.switchTeam()
					.update(item)
					.reset()
					.setMode(_this.modeTypes.result);
			} else if (item.teamId == _this.selectedTeam.teamId) {
				//nowteam
				_this
					.setMode(_this.modeTypes.slect)
					.selectTarget(item)
					.select(item)
					.reset()
					.update(item);
			} else {
				//other team
				_this
					.setMode(_this.modeTypes.battle)
					.selectTarget(item)
					.judge(item)
					.update(item, true)
					.reset()
					.setMode(_this.modeTypes.result);
			}
			if (item.teamId == 99) _this.shuffle();
			if (_this.isFinished) _this.switchTeam();

			//remove scope data
			var _teams = angular.toJson(_this.teams);
			_teams = JSON.parse(_teams);
			var _selectedTeam = angular.toJson(_this.selectedTeam);
			_selectedTeam = JSON.parse(_selectedTeam);

			var stagePushedKey = FireBaseService.getPushedKey('stage');
			var stage = FireBaseService.getPushedResult('stage', stagePushedKey);
			var userPushedKey = FireBaseService.getPushedKey('users');


			if(!$filter('inArray')(stage.users, userPushedKey) && stage.users){
				stage.users.push(userPushedKey);
			}
			var record = {
					key : 'stage',
					path: 'stage',
					value : [{
							item: item,
							items: _this.items,
							teams: _teams,
							selectedItem: _this.selectedItem,
							selectedTeam: _selectedTeam,
							users: [FireBaseService.arrayRefKeys.users.pushedKey]
					}],
					isDisconnectRemove : true,
					isPush : false
			};

			FireBaseService
				.pushValue( record );
		};

		var switchTeam = function() {
			_this.selectedTeam = _this.selectedTeam.teamId == 1 ? _this.teams[1] : _this.teams[0];
		};

		var select = function(item) {
			_this.selectedItem = item;
		};

		var selectTarget = function(item) {
			_this.selectedTargetItem = item;
		};

		var reset = function() {
			for (var i = 0; i < _this.items.length; i++) {
				_this.items[i].isSelected = false;
				_this.items[i].isAround = false;
			}
		};

		var judge = function(item) {
			//oher team
			if (item.isAround) {
				//around
				if (item.power <= _this.selectedItem.power) {
					//destory
					item.teamId = null;
					//_this.teams[_this.selectedTeam.key].friends.push(item);
				} else {
					//atack
					item.power = item.power - _this.selectedItem.power;
				}
				_this.selectedTeam = _this.selectedTeam.teamId == 1 ? _this.teams[1] : _this.teams[0];
			} else {
				//not around
			}
		};

		var _this = {
			isFinished: false,
			myTeam: {},
			selectedTeam: {},
			selectedItem: {},
			modeTypes: modeTypes,
			modeType: modeTypes.start,
			teamSituation: false
		};

		_this.getSituation = function(tergrtItem, item) {
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

		_this.setTeams = function() {
			_this.teams = teams;
			this.selectedTeam = _this.teams[0];
			return this;
		};

		_this.setItems = function() {
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

		_this.select = function(item) {
			select(item);
			return this;
		};

		_this.selectTarget = function(item) {
			selectTarget(item);
			return this;
		};

		_this.reset = function() {
			reset();
			return this;
		};

		_this.judge = function(item) {
			judge(item);
			return this;
		};

		_this.judge = function(item) {
			judge(item);
			return this;
		};

		_this.changeMode = function(item, index) {
			changeMode(item, index);
			return this;
		};

		_this.switchTeam = function() {
			switchTeam();
			return this;
		};

		_this.update = function(item) {
			update(item);
			return this;
		};

		_this.shuffle = function(isInit) {
			this.items = shuffle(this.items, isInit);
			return this;
		};

		_this.setMode = function(modeType) {
			this.modeType = modeType;
			return this;
		};

		_this.setTeam = function(teamKey) {
			this.myTeam = this.teams[teamKey];
			this.selectedItem = {};
			return this;
		};

		_this.selectStage = function(stage) {
			this.myTeam = this.teams[teamKey];
			this.selectedItem = {};
			return this;
		};

		_this.switchItem = function() {
			switchItem();
			return this;
		};

		return _this;
	})
	.controller('GameSubCtrl', function($scope, $timeout, $mdDialog, $filter, GameService, FireBaseService, FireBaseStorageService) {
		$scope.game = GameService;
		$scope.auth = FireBaseService;
		$scope.storage = FireBaseStorageService;
		$scope.closeDialog = function() {
			$mdDialog.hide();
		};
		$scope.selectStage = function(stageKey, stage) {
			FireBaseService.updateArrayRefKey('stage', 'stage', stageKey, stage);
			$mdDialog.hide();
		};
	})
	.controller('GameCtrl', function($scope, $timeout, $mdDialog, $state, $rootScope, $filter, $localStorage, GameService, FireBaseService, FireBaseStorageService) {

		var init = function() {
			$scope.game = GameService.setTeams().setItems().shuffle(true).update({}, true);
			$scope.auth = FireBaseService;
			$scope.storage = FireBaseStorageService;
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
						key: FireBaseService.getCurrentUserKey(),
						name : $localStorage.user.firstName ? $localStorage.user.firstName : 'Mika_' + rand
					}],
					isDisconnectRemove : true,
					isPush : false
			};
			//key, path, isArray, isDisconnectRemove, condition
			FireBaseService
				.ref('stage', 'stage', true)
				.ref('users', 'users', true)
				.pushValue( record );
		};

		$rootScope.$on('updated', function() {
			if (!FireBaseService.arrayRef.stage) return;
			var stagePushedKey = FireBaseService.getPushedKey('stage');
			var stage = FireBaseService.getPushedResult('stage', stagePushedKey);
			var userPushedKey = FireBaseService.getPushedKey('users');

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

			if(!$scope.$root) return;
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
			return FireBaseService.getCurrentUser();
		};

		$scope.start = function(){
			$state.go('battle');
		};

		init();

	});
