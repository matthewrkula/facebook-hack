//var ipAddress = 'http://192.17.192.148:8000'; // Val
// var ipAddress = 'http://192.17.207.254:8000'; // Matt
 var ipAddress = 'http://facebook-hack.nodejitsu.com'; // production

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var socket = io.connect(ipAddress);

var mId = makeid();

socket.emit('new-player', { id : mId });

function registerAsButton(element, event, data){

  //
  // PRODUCTION
  //
  element.on({
    'touchstart': function(e) {
      socket.emit(event, $.extend(data, {pressed: true, id: mId}));
    },
    'touchend': function(e) {
      socket.emit(event, $.extend(data, {pressed: false, id: mId}));
    },
    'touchcancel': function(e) {
      socket.emit(event, $.extend(data, {pressed: false, id: mId}));
    }
  });

  //
  // DEVELOPMENT
  //
    //element.on({
      //'vmousedown': function(e) {
        //socket.emit(event, $.extend(data, {pressed: true, id: mId}));
      //},
      //'vmouseup': function(e) {
        //socket.emit(event, $.extend(data, {pressed: false, id: mId}));
      //},
      //'vmousecancel': function(e) {
        //socket.emit(event, $.extend(data, {pressed: false, id: mId}));
      //}
    //});
}
registerAsButton($('#left'), 'move', {dir: 'left'});
registerAsButton($('#right'), 'move', {dir: 'right'});
registerAsButton($('#up'), 'move', {dir: 'up'});
registerAsButton($('#down'), 'move', {dir: 'down'});

registerAsButton($('#a-button'), 'action-button', { btn: 'a-btn' });
