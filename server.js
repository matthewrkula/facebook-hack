var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

// app.listen(80);
app.listen(8000);

function handler (req, res) {
  fs.readFile(__dirname + req.url,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {

  socket.on('new-player', function(data){
    socket.broadcast.emit('add-player', data);
  });

  socket.on('move', function(data){
      socket.broadcast.emit(data.dir, { down: data.down, id: data.id });
  });

  socket.on('action-button', function(data){
      socket.broadcast.emit(data.btn, { down: data.down, id: data.id });
  });
});

