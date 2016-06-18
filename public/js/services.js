app
    .factory('Loading', function(FireBaseService, $firebaseArray) {
        var _this = { isLoding: false };
        _this.start = function() {
            _this.isLoding = true;
        };
        _this.finish = function() {
            _this.isLoding = false;
        };
        return _this;
    });
