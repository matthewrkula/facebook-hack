//var ipAddress = 'http://192.17.192.148:8000'; // Val
//var ipAddress = 'http://192.17.207.254:8000'; // Matt
var ipAddress = 'http://facebook-hack.nodejitsu.com'; // production

var canvas = $("#canvas")[0];
var ctx = canvas.getContext("2d");
var w = $("#canvas").width();
var h = $("#canvas").height();
var bombs = [];
var players = {};
var playerWidth = 35;
var playerHeight = 35;
var idleLimit = 30;

function Player(id, x, y, color) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.xVel = 0;
  this.yVel = 0;
  this.color = color;
  this.score = 0;
  this.idleCount = 0;
  var _this = this;

  this.kill = function() {
    this.x = Math.random() * (w - playerWidth);
    this.y = Math.random() * (h - playerHeight);
    this.decrementScore();
  };

  this.incrementScore = function() {
    this.score = this.score + 1;
    this.updateScoreDiv();
  };

  this.decrementScore = function() {
    this.score = this.score - 1;
    this.updateScoreDiv();
  };

  this.updateScoreDiv = function() {
    var playerScoreDiv = document.getElementById('player-score-' + this.id);
    playerScoreDiv.innerHTML = this.score;
  };

  this.paint = function(ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, playerWidth, playerHeight);
    if (this.x + this.xVel <= w - playerWidth && this.x + this.xVel >= 0)
      this.x += this.xVel;
    if (this.y + this.yVel <= h - playerHeight && this.y + this.yVel >= 0)
      this.y += this.yVel;
  };

  this.resetIdleCount = function() {
    this.idleCount = 0;
  };

  this.getPlayerScoreNode = function(playerId) {
    return document.getElementById('player-score-' + playerId);
  };

  this.getScoresContainer = function() {
    return document.getElementById('scores-container');
  };

  this.removePlayerScore = function(playerId) {
    _this.getScoresContainer().removeChild(_this.getPlayerScoreNode(playerId));
  };

  this.removePlayer = function(playerId) {
    _this.removePlayerScore(playerId);
    delete players[playerId];
  };

  this.incrementIdleCount = function() {
    _this.idleCount = _this.idleCount + 1;
    _this.idleCount >= idleLimit ? _this.removePlayer(_this.id) : setTimeout(_this.incrementIdleCount, 1000);
  };

  setTimeout(this.incrementIdleCount, 1000);
}

Player.getScoresContainer = function() {
  return document.getElementById('scores-container');
};

Player.getPlayerScoreNode = function(playerId) {
  return document.getElementById('player-score-' + playerId);
};

Player.getPlayers = function() {
  return players;
};

Player.removePlayerScore = function(playerId) {
  Player.getScoresContainer().removeChild(
    Player.getPlayerScoreNode(playerId));
};

Player.removePlayer = function(playerId) {
  Player.removePlayerScore(playerId);
  delete Player.getPlayers()[playerId];
};

function Bomb(player) {
  this.player = player
  this.x = this.player.x;
  this.y = this.player.y;
  var _this = this;
  this.radius = 0;
  this.hasExploded = false;
  this.destroyed = false;

  this.paint = function(ctx) {
    ctx.fillStyle = 'red';

    if (_this.hasExploded) {
      ctx.beginPath();
      ctx.arc(_this.x, _this.y, _this.radius, 0, 2 * Math.PI, false);
      ctx.fill();
      if(_this.radius < 70)
        _this.radius += 8;
      else{
        bombs.splice(bombs.indexOf(_this), 1); // Destroy this bomb
      }

      for (var playerId in players) {
        var player = players[playerId];
        if (Math.sqrt(Math.pow(_this.x - player.x - (playerWidth / 2), 2) + 
            Math.pow(_this.y - player.y - (playerHeight / 2), 2)) < _this.radius) {
          player.kill();
          _this.player.incrementScore();
          console.log(_this.player.score);
        }
      }
    } else {
      ctx.fillRect(this.x, this.y, 10, 10);
    }
  };

  this.explode = function() {
    _this.hasExploded = true;
    console.log("EXPLODE");
  };

  setTimeout(this.explode, 2000);
}

function paint() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "black";
  ctx.strokeRect(0, 0, w, h);
  for (var i =0; i < bombs.length; i++)
    bombs[i].paint(ctx);
  for (var playerId in players)
    players[playerId].paint(ctx);
}

setInterval(paint, 60);

var colors = ['blue', 'black', 'orange', 'brown', 'gray', 'pink', 'green', 'purple', 'lightblue', 'lightgreen'];
var nextColorIndex = 0;

var socket = io.connect(ipAddress);

function setupScoreBoard(data) {
  var scoreDiv = document.createElement('div');
  scoreDiv.id = 'player-score-' + data.id;
  scoreDiv.className = 'player-score';
  scoreDiv.style.backgroundColor = colors[nextColorIndex];
  scoreDiv.style.color = '#fff';
  scoreDiv.innerHTML = 0;
  document.getElementById('scores-container').appendChild(scoreDiv);
}

socket.on('quit-game', function(data) {
  Player.removePlayer(data.id);
});

socket.on('add-player', function(data) {
  setupScoreBoard(data);
  players[data.id] = new Player(data.id, 100, 100, colors[nextColorIndex]);
  nextColorIndex = (nextColorIndex + 1) % colors.length;
});

socket.on('a-btn', function (data) {
  if (data.pressed) {
    bombs.push(new Bomb(players[data.id]));
    players[data.id].resetIdleCount();
  }
});

function movePlayer(value, movingSpeed, data) {
  if (players.hasOwnProperty(data.id)) {
    players[data.id][value] = data.pressed ? movingSpeed : 0;
    players[data.id].resetIdleCount();
  }
}

socket.on('left', function (data) {
  movePlayer('xVel', -10, data);
});

socket.on('right', function(data) {
  movePlayer('xVel', 10, data);
});

socket.on('up', function (data) {
  movePlayer('yVel', -10, data); 
});

socket.on('down', function (data) {
  movePlayer('yVel', 10, data);
});
