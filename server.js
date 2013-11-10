// 192.17.207.254

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8000);

function handler (req, res){
  fs.readFile(__dirname + req.url,
    function(err, data){
      if(err){
        res.writeHead(500);
        return res.end('Internal server error');
      }

      res.writeHead(200);
      res.end(data);
    });
}

io.sockets.on('connection', function(socket){
  socket.on('move', function(data){
      socket.broadcast.emit(data.direction, { down: data.down });
  });

  socket.on('action-button', function(data){
      socket.bradcast.emit(data.btn, { down: data.down });
  });

});