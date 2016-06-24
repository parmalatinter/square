app
	.factory('File', function() {
		var _this = { isLoding: false };
		var chatRef = {};

		_this.readURL = function(file, d) {
			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function (e) {
				return d.resolve(e.target.result);
			};
		};

		_this.get = function(key, path, fileName) {
			var d = $q.defer();
			chatsRef = FireBaseStorageService.setObjRef(key, path, fileName);
			chatsRef.getDownloadURL().then(function(url) {
				d.resolve(url);
			}).catch(function(error) {
				d.resolve('error');
			});
			return d.promise;
		};

		_this.upload = function(key, path, file) {
			if(!file) return;
			var d = $q.defer();
			chatsRef = FireBaseStorageService.setObjRef(key, path , file.name);
			var uploadTask = chatsRef.put(file);
			uploadTask.on('state_changed', function(snapshot) {
				//d.resolve(snapshot);
				}, function(error) {
					d.resolve(error);
				}, function(snapshot) {
					d.resolve(uploadTask.snapshot.downloadURL);
			});
			return d.promise;
		};

		_this.getUploadFile = function(file) {
			if(!file) return;
			var d = $q.defer();
			File.readURL(file, d);
			return d.promise;
		};

		_this.getFileType = function(name){
			var fileType = name.split('.').pop().split('?')[0];
			if($filter('inArray')(['png','jpg', 'gif', 'bmp'], fileType)){
				return 'image';
			}else if($filter('inArray')(['mp3','wav', 'm4a'], fileType)){
				return 'sound';
			}else if($filter('inArray')(['wmv','mp4', 'mpeg', 'mov', 'avi'], fileType)){
				return 'movie';
			}
		};
		return _this;
	})
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
	.factory('Header', function($state) {
		var _this = { title: false };
		_this.set = function( title ) {
			if(title){
				_this.title = title;
				return;
			}
			_this.title = $state.current.name;
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
	.factory('Speech', function($localStorage) {
		var _this = {};
		var settingRef = {
			isPlaying : false
		};
		var msg = {};
		var msgs = [];

		_this.play = function(text) {
			if(!$localStorage.setting) return;
			if(!$localStorage.setting.enableSound) return;
			var msg = new SpeechSynthesisUtterance(text);
			window.speechSynthesis.speak(msg);
		};

		var count =  0;
		var countMax = 0;
		var addSpeechEvent = function(records){
			msgs[count] = new SpeechSynthesisUtterance(records[count].detail);
			window.speechSynthesis.speak(msgs[count]);
			msgs[count].onend = function (event) {
				if(count == countMax || !_this.isPlaying){
					_this.isPlaying = false;
					count =  0;
					countMax =  0;
					return;
				}
				count++;
				addSpeechEvent(records);
			};
		};

		_this.playContinuity = function(records) {
			if(!$localStorage.setting) return;
			if(!$localStorage.setting.enableSound) return;
			_this.isPlaying = true;
			count =  0;
			countMax =  records.length;
			addSpeechEvent(records);
		};

		_this.pause = function(){
			for (var i = 0; i < msgs.length; i++) {
				window.speechSynthesis.pause(msgs[i]);
			}

			_this.isPlaying = false;
		}

		_this.cancel = function(){
			for (var i = 0; i < msgs.length; i++) {
				window.speechSynthesis.cancel(msgs[i]);
			}
			count =  0;
			countMax =  0;
			_this.isPlaying = false;
		}

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
