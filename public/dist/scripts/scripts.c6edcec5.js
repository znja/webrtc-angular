window.RTCPeerConnection=window.RTCPeerConnection||window.webkitRTCPeerConnection||window.mozRTCPeerConnection,window.RTCIceCandidate=window.RTCIceCandidate||window.mozRTCIceCandidate||window.webkitRTCIceCandidate,window.RTCSessionDescription=window.RTCSessionDescription||window.mozRTCSessionDescription||window.webkitRTCSessionDescription,window.URL=window.URL||window.mozURL||window.webkitURL,window.navigator.getUserMedia=window.navigator.getUserMedia||window.navigator.webkitGetUserMedia||window.navigator.mozGetUserMedia,angular.module("publicApp",["ngRoute"]).config(["$routeProvider",function(a){a.when("/room/:roomId",{templateUrl:"views/room.html",controller:"RoomCtrl"}).when("/room",{templateUrl:"views/room.html",controller:"RoomCtrl"}).otherwise({redirectTo:"/room"})}]),angular.module("publicApp").constant("config",{SIGNALIG_SERVER_URL:""}),Object.setPrototypeOf=Object.setPrototypeOf||function(a,b){return a.__proto__=b,a},angular.module("publicApp").controller("RoomCtrl",["$sce","VideoStream","$location","$routeParams","$scope","Room",function(a,b,c,d,e,f){if(!window.RTCPeerConnection||!navigator.getUserMedia)return void(e.error="WebRTC is not supported by your browser. You can try the app with Chrome and Firefox.");var g;b.get().then(function(a){g=a,f.init(g),g=URL.createObjectURL(g),d.roomId?f.joinRoom(d.roomId):f.createRoom().then(function(a){c.path("/room/"+a)})},function(){e.error="No audio/video permissions. Please refresh your browser and allow the audio/video capturing."}),e.peers=[],f.on("peer.stream",function(a){console.log("Client connected, adding new stream"),e.peers.push({id:a.id,stream:URL.createObjectURL(a.stream)})}),f.on("peer.disconnected",function(a){console.log("Client disconnected, removing stream"),e.peers=e.peers.filter(function(b){return b.id!==a.id})}),e.getLocalVideo=function(){return a.trustAsResourceUrl(g)}}]),angular.module("publicApp").factory("Room",["$rootScope","$q","Io","config",function(a,b,c,d){function e(b){if(m[b])return m[b];var c=new RTCPeerConnection(l);return m[b]=c,c.addStream(k),c.onicecandidate=function(a){n.emit("msg",{by:i,to:b,ice:a.candidate,type:"ice"})},c.onaddstream=function(c){console.log("Received new stream"),p.trigger("peer.stream",[{id:b,stream:c.stream}]),a.$$digest||a.$apply()},c}function f(a){var b=e(a);b.createOffer(function(c){b.setLocalDescription(c),console.log("Creating an offer for",a),n.emit("msg",{by:i,to:a,sdp:c,type:"sdp-offer"})},function(a){console.log(a)},{mandatory:{OfferToReceiveVideo:!0,OfferToReceiveAudio:!0}})}function g(a){var b=e(a.by);switch(a.type){case"sdp-offer":b.setRemoteDescription(new RTCSessionDescription(a.sdp),function(){console.log("Setting remote description by offer"),b.createAnswer(function(c){b.setLocalDescription(c),n.emit("msg",{by:i,to:a.by,sdp:c,type:"sdp-answer"})})});break;case"sdp-answer":b.setRemoteDescription(new RTCSessionDescription(a.sdp),function(){console.log("Setting remote description by answer")},function(a){console.error(a)});break;case"ice":a.ice&&(console.log("Adding ice candidates"),b.addIceCandidate(new RTCIceCandidate(a.ice)))}}function h(b){b.on("peer.connected",function(a){f(a.id)}),b.on("peer.disconnected",function(b){p.trigger("peer.disconnected",[b]),a.$$digest||a.$apply()}),b.on("msg",function(a){g(a)})}var i,j,k,l={iceServers:[{url:"stun:130.211.147.65:1352"},{url:"turn:130.211.147.65:1352?transport=udp"},{url:"turn:130.211.147.65:1352?transport=tcp"},{url:"turn:numb.viagenie.ca",username:"tim@cloud.com",credential:"3oRZgIwu3zpOGvjvv8NH"}],iceTransports:"relay"},m={},n=c.connect(d.SIGNALIG_SERVER_URL),o=!1,p={joinRoom:function(a){o||(n.emit("init",{room:a},function(a,b){i=b,j=a}),o=!0)},createRoom:function(){var a=b.defer();return n.emit("init",null,function(b,c){a.resolve(b),j=b,i=c,o=!0}),a.promise},init:function(a){k=a}};return EventEmitter.call(p),Object.setPrototypeOf(p,EventEmitter.prototype),h(n),p}]),angular.module("publicApp").factory("Io",function(){if("undefined"==typeof io)throw new Error("Socket.io required");return io}),angular.module("publicApp").factory("VideoStream",["$q",function(a){var b;return{get:function(){if(b)return a.when(b);var c=a.defer();return navigator.getUserMedia({video:!0,audio:!0},function(a){b=a,c.resolve(b)},function(a){c.reject(a)}),c.promise}}}]),angular.module("publicApp").directive("videoPlayer",["$sce",function(a){return{template:'<div><video ng-src="{{trustSrc()}}" autoplay></video></div>',restrict:"E",replace:!0,scope:{vidSrc:"@"},link:function(b){console.log("Initializing video-player"),b.trustSrc=function(){return b.vidSrc?a.trustAsResourceUrl(b.vidSrc):void 0}}}}]);