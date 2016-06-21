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
    })
    .factory('Setting', function(FireBaseService, $firebaseObject, $firebaseArray) {
        var _this = {};
        var settingRef = {};

        _this.get = function() {
            FireBaseService.setObjRef('setting', 'setting');
            settingRef = FireBaseService.objRef.setting;
            return $firebaseObject(settingRef);
        };
        return _this;
    })
    .factory('Vibration', function($localStorage) {
        var _this = {};

        _this.play = function(secound) {
            if(!$localStorage.setting) return;
            if(!$localStorage.setting.enableViblate) return;
            var isVibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
            if(isVibrate){
                navigator.vibrate(secound);
            }
        };
        return _this;
    });