var s = {
	width:400,
	height:400,
	nbColumns:20,
}

///////////////////////////////////////////////////////////////////////////////////////////////
function Game(){
	this.grid = new Grid();
	this.score = new Score();

	this.start();

	console.log("Lance l'update");
	setInterval(this.update.bind(this),100);
}

Game.prototype.start = function(){
	this.snake = new Snake();
	this.apple = new Apple();	
}

Game.prototype.update = function() {
	this.step();
	this.draw();
};

Game.prototype.step = function() {
	this.snake.step();
	this.checkCollision();
	// this.apple.step();
};

Game.prototype.checkCollision = function() {
	var s = this.snake.getPosition();
	var a = this.apple.getPosition();
	var h = s[0];

	// TODO
	if(h[1] == a[1] && h[0] == a[0]){
		console.log("-- snake eat apple --");
		this.snake.growth = true;
		this.apple.take();
	}

	for(var i = 1 ; i<s.length;i++){
		if(s[i][1] == h[1] && s[i][0] == h[0]){
			console.log("-- snake eat i'm self --");
			this.start();
		}
	}
};

Game.prototype.draw = function() {
	var s = this.snake.draw();
	var a = this.apple.draw();
	this.grid.render(s,a);	
};

///////////////////////////////////////////////////////////////////////////////////////////////
function Snake(){
	console.log("init Snake");
	this.data = [[3,1],[2,1],[1,1]];

	this.direction = "right";
	this.lastDirection = "right";
	this.growth = false;

	document.onkeydown = this.keyDown.bind(this);

	// init touch
	document.addEventListener('touchstart',this.down.bind(this));
	document.addEventListener('touchend',this.up.bind(this));
}

Snake.prototype.down = function(e){
	this.touchX = e.touches[0].clientX;
	this.touchY = e.touches[0].clientY;
}

Snake.prototype.up = function(e){
	console.log("e",e);
	var upx = e.changedTouches[0].clientX;
	var upy = e.changedTouches[0].clientY;

	var dx = this.touchX - upx;
	var dy = this.touchY - upy;

	if(Math.abs(dx)>Math.abs(dy)){
		// latteral
		if(dx<0){
			this.direction = 'right';
		}else{
			this.direction = 'left';
		}
	}else{
		// vertical
		if(dy<0){
			this.direction = 'down';
		}else{
			this.direction = 'up';
		}
	}
}

Snake.prototype.keyDown = function(e) {
	if(e.keyCode == 38){
		this.direction = 'up';
	}else
	if(e.keyCode == 40){
		this.direction = 'down';
	}else
	if(e.keyCode == 39){
		this.direction = 'right';
	}else
	if(e.keyCode == 37){
		this.direction = 'left';
	}
};

Snake.prototype.step = function() {
	var h = this.data[0]
	var x = h[0];
	var y = h[1];

	if(!this.growth){
		this.data.pop();
	}else{
		this.growth = false;
	}

	if(this.lastDirection == 'up' && this.direction == 'down' 
	|| this.direction == 'up' && this.lastDirection == 'down'
	|| this.lastDirection == 'right' && this.direction == 'left' 
	|| this.direction == 'right' && this.lastDirection == 'left'){
		this.direction = this.lastDirection;
	}
	this.lastDirection = this.direction;

	if(this.direction == "up"){
		if(y == 0){
			this.data.unshift([x,s.nbColumns-1]);
		}else{
			this.data.unshift([x,y-1]);
		}
	}else
	if(this.direction == "down"){
		if(y==s.nbColumns-1){
			this.data.unshift([x,0]);	
		}else{
			this.data.unshift([x,y+1]);			
		}
	}else
	if(this.direction == "left"){
		if(x==0){
			this.data.unshift([s.nbColumns-1,y]);	
		}else{
			this.data.unshift([x-1,y]);			
		}
	}else
	if(this.direction == "right"){
		if(x == s.nbColumns-1){
			this.data.unshift([0,y]);
		}else{
			this.data.unshift([x+1,y]);
		}
	}
};

Snake.prototype.draw = function() {
	return this.data;
};

Snake.prototype.getPosition = function() {
	return this.data;
};

///////////////////////////////////////////////////////////////////////////////////////////////
function Apple(){
	this.data = [];

	this.random();
}

Apple.prototype.take = function() {
	this.random();
};

Apple.prototype.random = function() {
	var x = Math.floor(Math.random()*s.nbColumns);
	var y = Math.floor(Math.random()*s.nbColumns);

	this.data = [x,y];
};

Apple.prototype.getPosition = function() {
	return this.data
};

Apple.prototype.draw = function() {
	return [this.data];
};

///////////////////////////////////////////////////////////////////////////////////////////////
function Grid(){
	console.log("Init Grid");
	this.stage = new PIXI.Stage(0x000000);
	this.renderer = new PIXI.autoDetectRenderer(s.width,s.height);
	document.body.appendChild(this.renderer.view);

	console.log("Construire grille");
	this.grid = [];
	for(var i = 0;i<s.nbColumns;i++){
		this.grid.push([]);
		for(var y = 0;y<s.nbColumns;y++){
			var square = new PIXI.Graphics();
			var w = s.width/s.nbColumns;
			
			square.on = function(){
				this.beginFill(0xFFFFFF);
				this.drawRect(0,0,w,w);
			}

			square.off = function(){
				this.clear()
			}

			square.x = y*w;
			square.y = i*w;

			this.stage.addChild(square);

			this.grid[i][y] = square;
		}		
	}
}
Grid.prototype.render = function(array1,array2) {
	this.clean();

	for(var i in array1){
		var x = array1[i][0];
		var y = array1[i][1];

		this.on(x,y);
	}

	for(var i in array2){
		var x = array2[i][0];
		var y = array2[i][1];

		this.on(x,y);
	}

	this.renderer.render(this.stage);
};

Grid.prototype.clean = function() {
	for(var i = 0 ; i<s.nbColumns;i++){
		for(var y = 0; y<s.nbColumns;y++){
			this.grid[i][y].clear();
		}
	}
};

Grid.prototype.on = function(x,y){
	this.grid[y][x].on();
}
Grid.prototype.off = function(x,y){
	this.grid[y][x].off();
}

function Score(){
	console.log("init Score");

}

var game = new Game();