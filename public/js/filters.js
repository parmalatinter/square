//$filter('find')($scope.List,{id : hogeId}, true);
app.filter('find', function() {
	return function(input, value, isFirst) {
		if (!Array.isArray(input)) return false;
		var existList = [];
		var keys = Object.keys(value);
		for (var i = 0; i < input.length; i++) {
			var isOk = false;
			for (var j = 0; j < keys.length; j++) {
				var inputVal = input[i][keys[j]];
				var judgeVal = value[keys[j]];
				if (inputVal != judgeVal) {
					if (judgeVal === "boolean") {
						if (inputVal) {
							isOk = true;
						} else {
							continue;
						}
					} else {
						continue;
					}
				} else {
					isOk = true;
				}
			}
			if (isOk) {
				input[i].index = i;
				existList.push(input[i]);
				if (isFirst) return existList[0];
			}
		}
		return existList;
		};
	})
	//ng-if="items | inArray : 'test'" あればtrue なければfalse
	//$filter('inArray')(items,'test');
	.filter('inArray', function() {
		return function(array, value) {
			if (!Array.isArray(array)) return false;
			return array.indexOf(value) !== -1;
		};
	})
	//<div ng-repeat="(date,text) in data | orderObjectBy:date:true">{{text}}</div>
	.filter('orderObjectBy', function() {
		return function(items, field, reverse) {
			var filtered = [];
			angular.forEach(items, function(item, primaryKey) {
				item.primaryKey = primaryKey;
				filtered.push(item);
			});
			filtered.sort(function(a, b) {
				return (a[field] > b[field] ? 1 : -1);
			});
			if (reverse) filtered.reverse();
			return filtered;
		};
	})
	//ng-repeat="friend in friends | reverse"
	.filter('reverse', function() {
		return function(items) {
			return items.slice().reverse();
		}
	})
	//$filter('rand')(10)
	.filter('rand', function() {
		return function(num) {
			return Math.floor(Math.random() * num + 1);;
		};
	});
