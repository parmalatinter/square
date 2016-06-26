
self.addEventListener('message', function(e) {
if( 'function' === typeof importScripts){
	self.postMessage(e.data.file);
	//importScripts('../libs/firebase.js');
}
}, false);
