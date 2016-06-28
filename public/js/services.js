app
	.factory('File', function(resizeService, FireBaseStorageService, $filter, $q, $log) {
		var _this = { isLoding: false };
		var chatRef = {};

		function toBlob(base64) {
		    var bin = atob(base64.replace(/^.*,/, ''));
		    var buffer = new Uint8Array(bin.length);
		    for (var i = 0; i < bin.length; i++) {
		        buffer[i] = bin.charCodeAt(i);
		    }
		    // Blobを作成
		    try{
		        var blob = new Blob([buffer.buffer], {
		            type: 'image/png'
		        });
		    }catch (e){
		        return false;
		    }
		    return blob;
		}

		_this.readURL = function(file, d) {
			var reader = new FileReader();
			if(file.isBlob){
				d.resolve( toBlob(file.src) );
			}else{
				reader.readAsDataURL(file);
			}

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
			var fileName = '';
			if(!file.name){
				fileName = Math.round( new Date().getTime() / 1000 ) + '.jpeg'
			}
			chatsRef = FireBaseStorageService.setObjRef(key, path , fileName);

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
			_this.readURL(file, d);
			return d.promise;
		};

		_this.resizeFile = function(url){
			if(!url) return;
			var d = $q.defer();
			resizeService
			.resizeImage(url, {
				size: 2,
				sizeScale: 'ko',
				width : 320
				// Other options ...
			})
			.then(function(image){
				// Add the resized image into the body
				// Add the resized image into the body
				var file = document.createElement('img');
				file.src = image;
				file.isBlob = true;
				d.resolve({src : image, file :file} );
			})
			.catch($log.error); // Always catch a promise :)
			return d.promise;
		}

		_this.getFileType = function(name){
			var fileType = name.split('.').pop().split('?')[0];
			if($filter('inArray')(['png','jpg', 'gif', 'bmp', 'jpeg'], fileType)){
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
		var playTypes = {
			play : 'play',
			pause : 'pause',
			cancel : 'cancel'
		};
		var _this = {
			playSituation : playTypes.cancel,
			playTypes : playTypes
		};
		var msg = {};
		var msgs = [];

		_this.play = function(text) {
			if(!$localStorage.setting) return;
			if(!$localStorage.setting.enableSound) return;
			var msg = {};
			var msg = new SpeechSynthesisUtterance(text);
			window.speechSynthesis.speak(msg);
		};

		var count =  0;
		var countMax = 0;
		var addSpeechEvent = function(records){
			msgs[count] = new SpeechSynthesisUtterance(records[count].detail);
			window.speechSynthesis.speak(msgs[count]);
			msgs[count].onend = function (event) {
				if(count == countMax || !_this.playSituation){
					_this.playSituation = playTypes.cancel;
					count =  0;
					countMax =  0;
					msgs = [];
					return;
				}
				count++;
				addSpeechEvent(records);
			};

		};

		_this.playContinuity = function(records) {
			if(!$localStorage.setting) return;
			if(!$localStorage.setting.enableSound) return;
			msgs = [];
			_this.playSituation = playTypes.play;
			count =  0;
			countMax =  records.length;
			addSpeechEvent(records);
		};

		_this.pause = function(){
			for (var i = 0; i < msgs.length; i++) {
				window.speechSynthesis.pause(msgs[i]);
			}

			_this.playSituation = playTypes.pause;
		};

		_this.cancel = function(){
			for (var i = 0; i < msgs.length; i++) {
				window.speechSynthesis.cancel(msgs[i]);
			}
			count =  0;
			countMax =  0;
			_this.playSituation = playTypes.cancel;
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
