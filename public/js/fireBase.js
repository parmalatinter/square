app
    .factory('FireBaseService', function($window, $filter, $rootScope) {

        var _this = {
            user: {},
            app: {},
            objRef: {},
            arrayRef: {},
            arrayRefKeys: {},
        };

        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyCkVwS95pg9wxHBFFWIn00BCnwDL0ifJT8",
            authDomain: "project-3597707734440258770.firebaseapp.com",
            databaseURL: "https://project-3597707734440258770.firebaseio.com",
            storageBucket: "project-3597707734440258770.appspot.com",
        };

        var init = function() {
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {

                    // User is signed in.
                    var isAnonymous = user.isAnonymous;
                    var uid = user.uid;

                    var _user = firebase.auth().currentUser;
                    if (_user) {
                        this.user.name = user.name;
                        this.user.email = user.email;
                        this.user.photoURL = user.photoURL;
                        this.user.uid = user.uid; // The user's ID, unique to the Firebase project. Do NOT use
                        // this value to authenticate with your backend server, if
                        // you have one. Use User.getToken() instead.
                        $rootScope.$broadcast('updated');
                    }
                } else {
                    // User is signed out.
                    // ...
                }
                // ...
            });
        };

        var  setArrayRef = function(key, path){
            _this.arrayRef[key] = firebase.database().ref(path);
        };

        var  setObjRef = function(key, path){
            _this.objRef[key] = firebase.database().ref(path);
        };
        var  setValue = function( record ){
            _this.objRef[record.key] = firebase.database().ref(record.path);
            _this.objRef[record.key].set(record.value);
            //if (record.isDisconnectRemove) _this.objRef[record.key].onDisconnect().remove();
        };

       var  pushValue = function( record ){
            if (!_this.arrayRefKeys[record.key]) _this.arrayRefKeys[record.key] = {};
            if (_this.arrayRefKeys[record.key].pushedKey && !record.isPush) {
                _this.arrayRef[record.key] = firebase.database().ref(record.path + '/' + _this.arrayRefKeys[record.key].pushedKey);
                _this.arrayRef[record.key].update(record.value[0]);
            } else {
                _this.arrayRef[record.key] = firebase.database().ref(record.path);
                angular.forEach(record.value, function(_value) {
                    var newRef = _this.arrayRef[record.key].push(_value);
                    _this.arrayRefKeys[record.key].pushedKey = newRef.key;
                });
            }
            //if (record.isDisconnectRemove) _this.arrayRef[record.key].onDisconnect().remove();
        };

        var refForObj = function(key, path) {
            if (!_this.objRef[key]) _this.objRef[key] = {};
            firebase.database().ref(path).on('value', function(data) {
                if (data.val()) {
                    _this.objRef[key].result = data.val();
                    $rootScope.$broadcast('updated');
                }
            });
        };

        var refForArray = function(key, path) {
            if (!_this.arrayRef[key]) _this.arrayRef[key] = {};
            firebase.database().ref(path).orderByChild('date').on('value', function(data) {
                if (data.val()) {
                    _this.arrayRef[key].result = data.val();
                    $rootScope.$broadcast('updated');
                }
            });
        };

        var refForArrayFind = function(key, path, condition) {
            if (!_this.arrayRef[key]) _this.arrayRef[key] = {};
            firebase.database().ref(path).child(condition.key).equalTo(condition.value).on("value", function(data) {
                if (data.val()) {
                    _this.arrayRef[key].result = data.val();
                    $rootScope.$broadcast('updated');
                }
            });
        };

        // condition = {key : 'test', value : 1}
        var ref = function(key, path, isArray, condition) {
            if (!isArray) {
                refForObj(key, path);
            } else if (condition) {
                refForArrayFind(key, path, condition);
            } else {
                refForArray(key, path);
            }
        };

        _this.app = firebase.initializeApp(config);

        _this.pushValue = function(record) {
            pushValue(record);
            return this;
        };

        _this.setValue = function(record) {
            setValue(record);
            return this;
        };

        _this.updateArrayRefKey = function(path, key, newKey, data) {
            this.arrayRefKeys[key].pushedKey = newKey;
            data.isRequested = true;
            firebase.database().ref(path + '/' + newKey).update(data);
            return this;
        };

        _this.ref = function(key, path, isArray, condition) {
            ref(key, path, isArray, condition);
            return this;
        };

        _this.init = function() {
            init();
            return this;
        };

        _this.getCurrentUserKey = function() {
            if (!this.arrayRefKeys.users) return false;
            return this.arrayRefKeys.users.pushedKey;
        };

        _this.getCurrentUser = function() {
            if (!this.arrayRef.users.result) return false;
            if (!this.getCurrentUserKey()) return false;
            return this.arrayRef.users.result[this.getCurrentUserKey()];
        };

        _this.setPushedKey = function(key, value) {
            if (!this.arrayRefKeys[key]) this.arrayRefKeys[key] = {};
            this.arrayRefKeys[key].pushedKey = value;
            return this;
        };

        _this.getPushedKey = function(key) {
            if (!this.arrayRefKeys[key]) return 0;
            return this.arrayRefKeys[key].pushedKey;
        };

        _this.getObjResult = function(key, pushedKey) {
            if (!this.objRef[key]) return 0;
            if (!this.objRef[key].result) return 0;
            return this.objRef[key].result;
        };

        _this.getPushedResult = function(key, pushedKey) {
            if (!this.arrayRef[key]) return 0;
            if (!this.arrayRef[key].result) return 0;
            if (!this.arrayRef[key].result[pushedKey]) return 0;
            return this.arrayRef[key].result[pushedKey];
        };

        _this.setArrayRef = function(key, path){
            setArrayRef(key, path);
        };

       _this.setObjRef = function(key, path){
            setObjRef(key, path);
        };

        init();

        return _this;
    })
    .factory('FireBaseStorageService', function($window, $filter, $rootScope) {
        var objRef = {};
        var _this = {
            objRef: {},
            urls:{}
        };

        var init = function() {
            objRef = firebase.storage().ref();
        };

        var setObjRef = function(key, path, fileName){
            _this.objRef[key] = objRef.child(path).child(fileName);
            return _this.objRef[key];
        };

        _this.getImageObjRef = function(fileName, key ){
            objRef.child(fileName).getDownloadURL().then(function(url) {
                _this.urls[key] = url;
                $rootScope.$broadcast('updated');
            }).catch(function(error) {
              // Handle any errors
            });
        };

       _this.setObjRef = function(key, path, fileName){
            return setObjRef(key, path, fileName);
        };

        init();
        return _this;
    })
    .factory('Main', function(FireBaseService, $firebaseArray) {
        var _this = {};
        if (!FireBaseService.arrayRef.chats) FireBaseService.setArrayRef('chats', 'chats');
        var chatsRef = FireBaseService.arrayRef.chats;
        _this.get = function(key) {
            return $firebaseArray(chatsRef);
        };
        return _this;
    })