/* Global variables */
var INITIALTIME = 6000;
var paused = 0;
var time;
var score = 0;
var canvas;
var context;
var interval; // change later
var foods = [];
var bugs = [];
var level = 1;
var NUM_FOOD = 5;
var food_left;
var fuzzy = 4; // bug food_collision radius
var cooldown = 0;
var ID = 0; //unique bug ID

// Loads element on start page
window.onload = function() {
	
	if (typeof(Storage) !== "undefined") {
		if (localStorage.getItem("highscore1") != null){
			if (localStorage.getItem("highscore2") != null){
				document.getElementById("highscore").innerHTML = "High Scores: <br>Level 1: " + localStorage.getItem("highscore1") + "<br>Level 2: " + localStorage.getItem("highscore2");
			}
			else {
				document.getElementById("highscore").innerHTML = "High Scores: <br>Level 1: " + localStorage.getItem("highscore1") + "<br>Level 2: 0" ;
			}
		}
		else {
			document.getElementById("highscore").innerHTML = "High Scores: <br> Level 1: 0<br> Level 2: 0";
		}
	}
		
}

// Game initialization function
function gameStart() {
	document.getElementById("start").style.visibility = "hidden";
	document.getElementById("game").style.visibility = "visible";
	document.getElementById("gamecontainer").style.visibility = "visible";
	
	/* get difficulty level */
	if (document.getElementById("levelone").checked) {
		document.title = "Level 1";
		level = 1;
	}
	else {
		document.title = "Level 2";
		level = 2;
	}
	// maybe change
	reset();
	
	canvas = document.getElementById("canvas");
	context = canvas.getContext('2d');
	
	canvas.addEventListener("mousedown", mouseClick, false);
	//window.addEventListener("keydown", keyDownTextField, false);
	document.getElementById("pause").addEventListener("mousedown", gamePause, false);
}

// Game loss function
function gameOver(state) {
	// reset, menu options
	context.clearRect(0, 0, canvas.width, canvas.height);
	var result;
	
	if (typeof(Storage) !== "undefined") {
		if (level == 1) {
			if (state == 0) { // lost game
				if (localStorage.getItem("highscore1") != null){
					if (score > localStorage.getItem("highscore1")) {
						localStorage.setItem("highscore1", score);
						result = confirm("Game Over\nNew Level 1 Highscore: " + score + "\nDo you want to play again?");
					}
					else {
						result = confirm("Game Over\nYour Score: " + score + "\nDo you want to play again?");
					}	
				}
				else {
					localStorage.setItem("highscore1", score);
					result = confirm("Game Over\nNew Level 1 Highscore: " + score + "\nDo you want to play again?");
				}
			}
			else if (state == 1){ // won game
				if (score > localStorage.getItem("highscore1")) {
						localStorage.setItem("highscore1", score);
						alert("You Win!\nNew Level 1 Highscore: " + score);
						result = true;
				}
				else {
					alert("You Win!\nYour Score: " + score)
					result = true;
				}
			}
		}
		
		if (level == 2) {
			
			if (state == 0){ //lost game
			
				if (localStorage.getItem("highscore2") != null){
					if (score > localStorage.getItem("highscore2")) {
						localStorage.setItem("highscore2", score);
						result = confirm("Game Over\nNew Level 2 Highscore: " + score + "\nDo you want to play again?");
					}
					else {
						result = confirm("Game Over\nYour Score: " + score + "\nDo you want to play again?");
					}	
				}
				else {
					localStorage.setItem("highscore2", score);
					result = confirm("Game Over\nNew Level 2 Highscore: " + score + "\nDo you want to play again?");
				}
			}
			else if (state == 1){ // won game
				if (score > localStorage.getItem("highscore2")) {
					localStorage.setItem("highscore2", score);
					result = confirm("You Win!\nNew Level 2 Highscore: " + score + "\nDo you want to play again?");
				}
				else {
					result = confirm("You Win!\nYour Score: " + score + "\nDo you want to play again?");
				}
			}
		}

		if (result == true){
			if (state == 1){ // won
				if (level == 1){
					level = 2;
					reset();
				}
				else if (level == 2){
					level = 1;
					reset();
				}
			}
			else if (state == 0){ // lost
					reset();
			}
		}
		else if (result == false){
			window.close();
		}
	}
	else {
		alert("HTML5 Local Storage not supported, restarting game")
		reset();
	}
}

// Game reset function
function reset() {
	time = INITIALTIME;
	score = 0;
	foods.length = 0;
	bugs.length = 0;
	food_left = NUM_FOOD;
	cooldown = 0;
	ID = 0;
	paused = 0;
	document.getElementById("pause").innerHTML= "Pause";
	document.title = "Level " + level;
	window.clearInterval(interval)
	interval = setInterval(update, 10);
	foodSpawn();
}

// Mouse clicking handler function
function mouseClick(event) {
	var box = canvas.getBoundingClientRect();
	var mouseX = event.clientX - box.left;
	var mouseY = event.clientY - box.top;
	for (i =  0; i < bugs.length; i++){
		if (bugs[i].status == 1){
			x = Math.abs(mouseX - (bugs[i].x));
			y = Math.abs(mouseY - (bugs[i].y));
			R = 20;
			if (x + y <= R || x * x + y * y <= R * R){
				bugs[i].status = 0;
				score += bugs[i].value;
			}
		}
	}
}

/* //Debug code
function keyDownTextField (e) {
  var keyCode = e.keyCode;
  if (keyCode == 32){
	  reset();
  }
} */

// Game tick function, implement pause state
function update() {
	if (paused == 0){
		time = time - 1;
		
		// Check if game over by time or by food eaten
		if (food_left == 0){
			gameOver(0); // lost level
		}
		else if (time < 0){
			gameOver(1); // won level
		}
		else {
			document.getElementById("timer").innerHTML = "Time: " + Math.floor(time/100);
			document.getElementById("score").innerHTML = "Points: " + score;
			draw();
			
			if (((cooldown > 100) && Math.random() <= (1/200)) || (cooldown > 300)){
				bugSpawn();
				cooldown = 0;
			}
			cooldown += 1;
		}
	}
}

// Draw function
function draw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawFood();
	drawBugs();
}

function drawFood() {
	for (i = 0; i < foods.length; i++){
		if (foods[i].status == 1){
			context.beginPath();
			context.fillStyle = "#ED4264";
			context.arc(foods[i].x + 10, foods[i].y + 10, 10, 0, 2 * Math.PI, false);
			context.moveTo(foods[i].x + 10, foods[i].y + 10);
			context.lineTo(foods[i].x + 15, foods[i].y - 5);
			context.stroke();
			
			context.closePath();
			context.fill();
		}
	}
}

// Bug drawing function, determines current target, route to target, changed position of bug
function drawBugs() {
	
	var curr_bug;
	
	for (i = 0; i < bugs.length; i++){
		curr_bug = bugs[i];
		// Fading out
		if (curr_bug.status == 0 && curr_bug.opacity > 0){
			context.beginPath();
			context.fillStyle = curr_bug.colour;
			context.globalAlpha = 1/(201-curr_bug.opacity);
			
			context.save();
			context.translate(curr_bug.x, curr_bug.y);
			context.rotate((90 + curr_bug.angle) * Math.PI/180);
		
			context.arc(0, -15, 5, 0, 2 * Math.PI, false);
			context.arc(0, -5, 5, 0, 2 * Math.PI, false);
			context.arc(0, 5, 5, 0, 2 * Math.PI, false);
			context.arc(0, 15, 5, 0, 2 * Math.PI, false);
			
			context.closePath();
			context.fill();
			context.restore()
			curr_bug.opacity -= 0.5;
			context.globalAlpha  = 1;
		}
		
		if (curr_bug.status == 1){
			
			food_collision(curr_bug);
			//bug_collision(curr_bug);
			
			// If bug has no target, find new target
			if (curr_bug.target == 0 || curr_bug.target.status == 0){
				closest(curr_bug); 
				getAngle(curr_bug);
			}
			
			// Doesn't do anything since bug collision disabled
			if (curr_bug.stop == 0){
				context.beginPath();
				context.fillStyle = curr_bug.colour;
				context.save();
				context.translate(curr_bug.x, curr_bug.y);
				context.rotate((90 + curr_bug.angle) * Math.PI/180);
				
				context.arc(0, -15, 5, 0, 2 * Math.PI, false);
				context.arc(0, -5, 5, 0, 2 * Math.PI, false);
				context.arc(0, 5, 5, 0, 2 * Math.PI, false);
				context.arc(0, 15, 5, 0, 2 * Math.PI, false);
				
				curr_bug.x += (curr_bug.dx * curr_bug.speed);
				curr_bug.y += (curr_bug.dy * curr_bug.speed);
				
				context.closePath();
				context.fill();
				context.restore();
			}
			else if (curr_bug.stop == 1) { // if currently stopped
				curr_bug.stop = 0;
			}
		}
	}
}
// Get rotational angle
function getAngle(curr_bug){
	x = curr_bug.x - curr_bug.target.x;
	y = curr_bug.y - curr_bug.target.y;
	curr_bug.angle = Math.atan2(y,x) / Math.PI * 180;
}

// If bug/food, check if all food is eaten, end game
function food_collision(curr_bug) {
	for (j = 0; j < foods.length; j++){
		if (foods[j].status == 1){
			x = Math.abs((foods[j].x + 10) - (bugs[i].x));
			y = Math.abs((foods[j].y + 10) - (bugs[i].y));
			R = 20;
			if (x + y <= R || x * x + y * y <= R * R){
				foods[j].status = 0;
				curr_bug.target = 0;
				curr_bug.dx = 0;
				curr_bug.dy = 0;
				food_left = food_left - 1;
			}
		}
	}
}

// Function is bugged somehow
function bug_collision(curr_bug) {
	for (i = 0; i < bugs.length; i++){
		if (curr_bug.id != bugs[i].id && bugs[i].status == 1){
			x = Math.abs((bugs[i].x) - (curr_bug.x));
			y = Math.abs((bugs[i].y) - (curr_bug.y));
			R = 10;
			if (x + y <= R || x * x + y * y <= R * R){
				if (curr_bug.speed > bugs[i].speed){
					bugs[i].stop = 1;
				}
				else if (curr_bug.speed == bugs[i].speed){
					bugs[i].stop = 1;
				}
				else if (curr_bug.speed < bugs[i].speed) {
					curr_bug.stop = 1;
				}

			}
		}
	}
}

// might not work, goes through food array, find closest food to bug, sets as target
// NOT WORKING PROPERLY
function closest(curr_bug) {
	
	var curr_food;
	var	x = 0;
	var	y = 0;
	var	d = 721;
	var target;
	
	for (k = 0; k < foods.length; k++){
		curr_food = foods[k];
		
		if (curr_food.status == 1){
			
			// Distance
			if (Math.sqrt(Math.pow((curr_food.x - curr_bug.x), 2) + Math.pow((curr_food.y - curr_bug.y), 2)) < d){
				x = (curr_food.x + 10) - curr_bug.x;
				y = (curr_food.y + 10) - curr_bug.y;
				d = Math.sqrt(Math.pow((curr_food.x - curr_bug.x), 2) + Math.pow((curr_food.y - curr_bug.y), 2));
				target = curr_food;
			}
		}
	}
	normalize(curr_bug, x, y)
	curr_bug.target = target;
}

// Normalize a vector
function normalize(bug, x, y){
	var magnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	bug.dx = x / magnitude;
	bug.dy = y / magnitude;
}

// Game pause function (stops game tick)
function gamePause(){
	
	if (paused == 0){
		document.getElementById("pause").innerHTML= "Resume";
		paused = 1;
		canvas.removeEventListener("mousedown", mouseClick, false);
	}
	
	else {
		document.getElementById("pause").innerHTML= "Pause";
		paused = 0;
		canvas.addEventListener("mousedown", mouseClick, false);
	}
}

// Initial spawn of Food function
function foodSpawn(){
		var a = 0;
		var b = (Math.random() * 70) + 5;
		
		for (i = 0; i < NUM_FOOD; i++){
			
			a = Math.random();
			while (a < 0.2 || a > 0.95){
				a = Math.random();
			}

			foods.push({x: b, y: a * 600, status: 1});
				b += 75;
		}
}
// Continual bug spawning function, spawns 1 bug per call
function bugSpawn() {
	
	var t = Math.random();
	var t2 = Math.random();
	
	while (t2 < 0.025 || t2 >  0.975){
		t2 = Math.random();
	}
	
	if (level == 1){
		// Black
		if (t <= 0.3){
			bugs.push({x: t2 * 400, y: 0, dx: 0, dy: 0, target: 0, speed: 1.5, value: 5, colour: "#000000", status: 1, id: ID, opacity: 200, angle: 0, stop: 0});
		}
		
		// Red
		else if (t <= 0.6){
			bugs.push({x: t2 * 400, y: 0, dx: 0, dy: 0, target: 0, speed: 0.75, value: 3, colour: "#FF0000", status: 1, id: ID, opacity: 200, angle: 0, stop: 0});
		}
		
		// Orange
		else {
			bugs.push({x: t2 * 400, y: 0, dx: 0, dy: 0, target: 0, speed: 0.6, value: 1, colour: "#FFA500", status: 1, id: ID, opacity: 200, angle: 0, stop: 0});
		}
	}
	
	else if (level == 2){
		// Black
		if (t <= 0.3){
			bugs.push({x: t2 * 400, y: 0, dx: 0, dy: 0, target: 0, speed: 2, value: 5, colour: "#000000", status: 1, id: ID, opacity: 200, angle: 0, stop: 0});
		}
		
		// Red
		else if (t <= 0.6){
			bugs.push({x: t2 * 400, y: 0, dx: 0, dy: 0, target: 0, speed: 1, value: 3, colour: "#FF0000", status: 1, id: ID, opacity: 200, angle: 0, stop: 0});
		}
		
		// Orange
		else {
			bugs.push({x: t2 * 400, y: 0, dx: 0, dy: 0, target: 0, speed: 0.8, value: 1, colour: "#FFA500", status: 1, id: ID, opacity: 200, angle: 0, stop: 0});
		}
	}
	
	ID = ID + 1;
}

// This stuff down here isn't even needed, due to implementation

// Drawn objects
// Position and status of food
var food = {
	x: 0,
	y: 0,
	status: 1,
};

// All three bug types
var bug = {
	x: 0,
	y: 0,
	dx: 0,
	dy: 0,
	speed: 0,
	value: 0,
	target: 0, // food object
	colour: "",
	direction: 0,
	id: 999,
	opacity: 200,
	angle: 180,
	stop: 0,
	status: 1
};
