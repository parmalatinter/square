app
		.factory('User', function($filter, FireBaseService, $firebaseObject, $firebaseArray, $localStorage) {
				var _this = {};
				if (!FireBaseService.arrayRef.users) FireBaseService.setArrayRef('users', 'users');
				_this.get = function(uid) {
						var userRef = FireBaseService.arrayRef.users.orderByChild('uid').equalTo(uid);
						return $firebaseObject(userRef);
				};
				_this.gett = function(uid) {
						var userRef = FireBaseService.arrayRef.users.orderByChild('uid').equalTo(uid);
						return $firebaseObject(userRef);
				};

				_this.getById = function(uid) {
						var userRef = FireBaseService.arrayRef.users.child(uid);
						return $firebaseObject(userRef);
				};

				_this.formatFirst = function(users) {
					var user = {};
					var count = 0;
					angular.forEach(users, function(userDetail, userDetailKey) {
						if (!$filter('inArray')(['$$conf', '$id', '$priority'], userDetailKey) && !count) {
							user = userDetail;
							user.Key = userDetailKey;
						}
					});
					return user;
				};
				return _this;
		})
		.factory('Users', function(FireBaseService, $firebaseObject, $firebaseArray) {
				var _this = {};
				if (!FireBaseService.arrayRef.users) FireBaseService.setArrayRef('users', 'users');
				var usersRef = FireBaseService.arrayRef.users;
				_this.get = function(key) {
						return $firebaseArray(usersRef);
				};
				return _this;
		})
		.factory('Request', function(FireBaseService, $firebaseObject, $firebaseArray) {
				var _this = {};
				if (!FireBaseService.arrayRef.requests) FireBaseService.setArrayRef('requests', 'requests');
				var resuestRef = FireBaseService.arrayRef.requests;
				_this.get = function(uid) {
						var resuestRef = FireBaseService.arrayRef.requests.orderByChild('uid').equalTo(uid);
						return $firebaseObject(resuestRef);
				};
				return _this;
		})
		.factory('Requests', function(FireBaseService, $firebaseObject, $firebaseArray) {
				var _this = {};
				if (!FireBaseService.arrayRef.requests) FireBaseService.setArrayRef('requests', 'requests');
				var requestsRef = FireBaseService.arrayRef.requests;
				_this.get = function() {
						return $firebaseArray(requestsRef);
				};
				return _this;
		})
		.factory('Friends', function(FireBaseService, $firebaseObject, $firebaseArray) {
				var _this = {};
				if (!FireBaseService.arrayRef.friends) FireBaseService.setArrayRef('friends', 'friends');
				var friendsRef = FireBaseService.arrayRef.friends;
				_this.get = function() {
						return $firebaseArray(friendsRef);
				};

				_this.getChat = function(key) {
						FireBaseService.setObjRef('friends', 'friends/' + key);
						chatRef = FireBaseService.objRef.chat;
						return $firebaseObject(chatRef);
				};
				return _this;
		})
		.factory('FriendsChat', function(FireBaseService, $firebaseObject, $firebaseArray) {
				var _this = {};
				if (!FireBaseService.arrayRef.friendsChat) FireBaseService.setArrayRef('friends', 'friends');
				_this.get = function(key) {
						var friendsRef = FireBaseService.arrayRef.friends.child(key).child('chats/comment');
						return $firebaseArray(friendsRef);
				};
				return _this;
		})
		.controller('UsersHeaderCtrl', function($scope, $rootScope, $localStorage, $state, $mdDialog, Speech, Loading, Header, Share) {
				Header.set();
				$scope.loading = Loading;
				$scope.header = Header;
				$scope.speech = Speech;

		})
		.controller('UserCtrl', function($scope, $rootScope, $localStorage, $mdToast, $sessionStorage, User, Users, File, Loading) {
				$scope.user = User.getById($localStorage.user.uid);
				$scope.disableEdit = false;
				$scope.title = null;
				$scope.file = "";
				Loading.start();

				$scope.user.$watch(function() {
						Loading.finish();
				});

				$scope.updateUser = function() {
						$scope.user.$save().then(function(ref) {
								$sessionStorage.user = {
									displayName: $scope.user.name,
									email: $scope.user.email,
									isLogedIn: true,
								};
								$localStorage.user = {
									displayName: $scope.user.name,
									email: $scope.user.email,
									uid: $scope.user.uid
								};
								$mdToast.show($mdToast.simple().content('Saved').position('bottom'));
						});
				};


				$scope.$watch('file', function(newVal, oldVal) {
						if (newVal) $scope.upload();
				});

				$scope.upload = function() {
						if (!$scope.file) return;
						Loading.start();
						$scope.uploadFileType = File.getFileType($scope.file.name);
						if ($scope.uploadFileType == 'image') {
								File.getUploadFile($scope.file).then(function(uploadFileUrl) {
										$scope.uploadFileUrl = uploadFileUrl;
										File.resizeFile(uploadFileUrl).then(function(resized) {
												File.getUploadFile(resized.file).then(function(resizedUploadFileUrl) {
														File.upload('users', 'users', resizedUploadFileUrl).then(function(uploadedImageUrl) {
																if (!$scope.user.photos) $scope.user.photos = [];
																$scope.user.photos.push(uploadedImageUrl);
																$scope.user.photoURL = uploadedImageUrl;
																$scope.user.$save().then(function(ref) {
																		$mdToast.show($mdToast.simple().content('Saved').position('bottom'));
																		$scope.file = "";
																});
														});
												});
										});
								});
								return;
						} else {

						}
				};
		})
		.controller('FriendCtrl', function($scope, $localStorage, $mdToast, $sessionStorage, $stateParams, User, Users, Loading) {
				var id = $stateParams.value ? $stateParams.value.uid : $sessionStorage.toParams.value.uid;
				$scope.users = User.get(id);
				$scope.disableEdit = true;
				$scope.title = null;
				Loading.start();

				$scope.users.$watch(function() {
						Loading.finish();
				});

				$scope.updateUser = function() {
						$scope.users.$save().then(function(ref) {
								$mdToast.show($mdToast.simple().content('Saved').position('bottom'));
						});
				};
		})
		.controller('UserListCtrl', function($scope, $localStorage, $sessionStorage, $filter, $mdToast, User, Users, Requests, Request, Friends, FriendsChat, Loading) {
				$scope.users = Users.get();
				$scope.title = null;
				$scope.currentUser = User.getById($localStorage.user.uid);
				$scope.friends = Friends.get($localStorage.user.uid);
				var _requests = Request.get($localStorage.user.uid);
				$scope.requests = {};

				$scope.newRequests = Requests.get();

				$scope.currentUser.$watch(function(ref) {
						Loading.finish();
				});

				$scope.friends.$loaded()
						.then(function(friends) {
								console.log("friends:", friends);
						});

				$scope.currentUser.$loaded()
						.then(function(user) {
								if (user.$id !== $localStorage.user.uid) {
										Loading.start();
										$scope.currentUser.name = $localStorage.user.displayName;
										$scope.currentUser.age = 0;
										//1:men, 2 :women, 3   = other
										$scope.currentUser.sexType = 1;
										$scope.currentUser.message = 'よろしくね';
										$scope.currentUser.date = Math.round(new Date().getTime() / 1000);
										$scope.currentUser.uid = $localStorage.user.uid;
										$scope.currentUser.photoURL = $sessionStorage.user.photoURL;
										$scope.currentUser.imageUrl = null;
										$scope.currentUser.$save().then(function(ref) {
											Loading.finish();
										});
								}
						})
						.catch(function(error) {
								console.log("Error:", error);
						});


				_requests.$loaded()
						.then(function(request) {
								$scope.requests.users = {};
								angular.forEach(request, function(request, requestKey) {
										angular.forEach(request.friends, function(friend, friendKey) {
												if ($localStorage.user.uid != friendKey) {
														$scope.requests.users[friendKey] = User.gett(friendKey);
														$scope.requests.users[friendKey].$loaded()
																.then(function(user) {
																		angular.forEach(user, function(userDetail, userDetailKey) {
																				if (!$filter('inArray')(['$$conf', '$id', '$priority'], userDetailKey)) {
																						$scope.requests.users[friendKey] = userDetail;
																				}
																		});
																});
												}

										});
								});
						})
						.catch(function(error) {
								console.log("Error:", error);
						});

				$scope.friends.$loaded()
						.then(function(friends) {
								$scope.friends.users = {};
								angular.forEach(friends, function(friend, friendKey) {

										angular.forEach(friend.users, function(user, userKey) {
												if ($localStorage.user.uid != userKey) {
														$scope.friends.users[friendKey] = User.gett(userKey);
														$scope.friends.users[friendKey].$loaded()
																.then(function(user) {
																		angular.forEach(user, function(userDetail, userDetailKey) {
																				if (!$filter('inArray')(['$$conf', '$id', '$priority'], userDetailKey)) {
																						$scope.friends.users[friendKey] = userDetail;
																				}
																		});
																});
												}
										});
								});
						})
						.catch(function(error) {
								console.log("Error:", error);
						});

				$scope.sendApply = function(uid) {
						var record = { users: {} };
						record.users[uid] = true;
						record.users[$localStorage.user.uid] = true;
						$scope.friends.$add(record).then(function(ref) {
								$scope.friendsChat = FriendsChat.get(ref.key);

								$scope.friendsChat.$loaded().then(function(friendsChat) {
										console.log(friendsChat);
								});

								var record = {
										uid: $localStorage.user.uid,
								};
								$scope.friendsChat.$add(record).then(function(ref) {});
						});


				};


				$scope.setRequest = function(uid) {
						var record = {
								uid: uid,
						};
						$scope.newRequests.$add(record).then(function(ref) {
								$scope.sendRequest(uid);
						});
				};

				$scope.sendRequest = function(uid) {
						var friendRequest = Request.get(uid);
						friendRequest.$loaded()
								.then(function(requests) {
										var _isExist = false;
										var _requestKey = '';
										angular.forEach(requests, function(request, requestKey) {
												if (typeof request == 'object') {
														if (request.uid) {
																_isExist = true;
																_requestKey = requestKey;
														}
												}
										});
										if (_isExist) {
												if (!angular.isObject(requests[_requestKey].friends)) {
														requests[_requestKey].friends = {};
														requests[_requestKey].friends[$localStorage.user.uid] = false;
												} else {
														requests[_requestKey].friends[$localStorage.user.uid] = false;
												}
												requests.$save().then(function(ref) {
														$mdToast.show($mdToast.simple().content('Requested').position('bottom'));
												});
										} else {
												$scope.setRequest(uid);
										}
								})
								.catch(function(error) {
										console.log("Error:", error);
								});
				};

				$scope.users.$watch(function() {
						Loading.finish();
				});
		});
