  //var ipAddress = 'http://192.17.192.148:8000'; // Val
  //var ipAddress = 'http://192.17.207.254:8000'; // Matt
var ipAddress = 'http://facebook-hack.nodejitsu.com'; // production

var canvas = $("#canvas")[0];
var ctx = canvas.getContext("2d");
var w = $("#canvas").width();
var h = $("#canvas").height();

var bombs = [];
var players = {};

function Player(id, x, y, color){
  this.id = id;
  this.x = x;
  this.y = y;
  this.xVel = 0;
  this.yVel = 0;
  this.color = color;
  this.score = 0;
  this.kill = function(){
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.decrementScore();
  };
  this.incrementScore = function(){
    this.score = this.score + 1;
    this.updateScoreDiv();
  }
  this.decrementScore = function(){
    this.score = this.score - 1;
    this.updateScoreDiv();
  }
  this.updateScoreDiv = function(){
    var playerScoreDiv = document.getElementById('player-score-' + this.id);
    playerScoreDiv.innerHTML = this.score;
  }
  this.paint = function(ctx){
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, 15, 15);

    if(this.x + this.xVel <= w - 15 && this.x + this.xVel >= 0)
      this.x += this.xVel;
    if(this.y + this.yVel <= h - 15 && this.y + this.yVel >= 0)
      this.y += this.yVel;
  }
}

function Bomb(player){
  this.player = player
  this.x = this.player.x;
  this.y = this.player.y;
  var _this = this;
  this.radius = 0;
  this.hasExploded = false;
  this.destroyed = false;

  this.paint = function(ctx){
    ctx.fillStyle = "red";

    if(_this.hasExploded){
      ctx.beginPath();
      ctx.arc(_this.x, _this.y, _this.radius, 0, 2 * Math.PI, false);
      ctx.fill();
      if(_this.radius < 70)
        _this.radius += 8;
      else{
        bombs.splice(bombs.indexOf(_this), 1);    // Destroy this bomb
      }

      for(var playerId in players){
        var player = players[playerId];
        if(Math.sqrt(Math.pow(_this.x - player.x, 2) + Math.pow(_this.y - player.y, 2)) < _this.radius){
          player.kill();
          _this.player.incrementScore();
          console.log(_this.player.score);
        }
      }
    } else {
      ctx.fillRect(this.x, this.y, 10, 10);
    }
  }

  this.explode = function(){
    _this.hasExploded = true;
    console.log("EXPLODE");
  }

  setTimeout(this.explode, 2000);
}



function paint(){
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "black";
  ctx.strokeRect(0, 0, w, h);

  for(var i =0; i < bombs.length; i++)
    bombs[i].paint(ctx);

  // for(i =0; i < players.length; i++)
  //   players[i].paint(ctx);
  for(var playerId in players)
    players[playerId].paint(ctx);
}

setInterval(paint, 60);

var colors = [ 'blue', 'black', 'orange', 'brown', 'gray', 'pink', 'green', 'purple', 'lightblue', 'lightgreen'];
var nextColorIndex = 0;

var socket = io.connect(ipAddress);

socket.on('add-player', function(data){
  var scoreDiv = document.createElement('div');
  scoreDiv.id = 'player-score-' + data.id;
  scoreDiv.className = 'player-score';
  scoreDiv.style.backgroundColor = colors[nextColorIndex];
  scoreDiv.style.color = '#fff';
  scoreDiv.innerHTML = 0;
  document.getElementById('scores-container').appendChild(scoreDiv);
  players[data.id] = new Player(data.id, 100, 100, colors[nextColorIndex]);
  nextColorIndex = (nextColorIndex + 1) % colors.length;
});

socket.on('a-btn', function (data) {
  if(data.pressed){
    bombs.push(new Bomb(players[data.id]));
  }
});

socket.on('left', function (data) {
  players[data.id].xVel = data.pressed ? -10 : 0;
});

socket.on('right', function(data){
  players[data.id].xVel = data.pressed ? 10 : 0;
});

socket.on('up', function (data) {
  players[data.id].yVel = data.pressed ? -10 : 0;
});

socket.on('down', function (data) {
  players[data.id].yVel = data.pressed ? 10 : 0;
});
