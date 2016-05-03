
/* global constants */
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var mouseDown = 0;
var font = "16 verdana";

var textColor = "rgb(255,255,255)";
var smokeColor = "rgb(209,209,209)";

var initialAscentRate = 1.0;
var initialDescentRate = 1.5; // in pixels per frame
var gravity = 0.08;  // how quickly the descent rate increases
var liftFactor = 0.04; // how quickly the climb rate increases
var terminalVelocity = 5; // descent and ascent rate will never exceed this

var mineV = 6; // mine velocity
var mineInterval = 40; // difficulty level 
var mineHeight = 60;
var mineWidth = 30;
var mine = new Image();
mine.src = "images/mine.jpg";

var coinV = 6; // coin velocity
var coinInterval = 45; // difficulty level 
var coinHeight = 60;
var coinWidth = 30;
var coin = new Image();
coin.src = "images/chinese-coin-1467663.jpg";

var sharkHeight = 26;
var sharkWidth = 77;
var shark = new Image();
shark.src = "images/shark.png";


var backgroundHeight = 350;
var backgroundWidth = 702;
var backgroundV = 2; // background scroll velocity
var background = new Image();
background.src = "images/underwater.jpg";

/* variables that will be reset every time setup is called: */
var sharkX;
var sharkY;
var iterationCount;
//var brickList;
var mineList;
var coinList;
var smokeList;
var gameState;
var score;
var scrollVal;

var ascentRate;
var descentRate;

$(document).ready(function() {
    document.addEventListener("deviceready", onDeviceReady, false);
    //uncomment for testing in Chrome browser
    //onDeviceReady();
});

function onDeviceReady() {
    // lock the device orientation
    console.log('Orientation is ' + screen.orientation);
    window.screen.lockOrientation('landscape');
}



window.onload = function () { setup(); };

function setup() {

    
    gameState = "pause";
    clearScreen();
    
    shark.src = "images/shark.png";

//    brickList = new Array();
    mineList = new Array();
    smokeList = new Array();
    coinList = new Array();

    sharkX = 100;
    sharkY = 175;

    descentRate = initialDescentRate;
    ascentRate = initialAscentRate;
    
    iterationCount = 0;
    score = 0;

    scrollVal = 0;

    ctx.font = font;

//    addBrick();
    addMine();
    addCoin();

    ctx.drawImage(background, 0, 0, backgroundWidth, backgroundHeight);
    ctx.drawImage(shark, sharkX, sharkY, sharkWidth, sharkHeight);

}



function play() {
    if(gameState == "pause") {
        intervalId = window.requestAnimationFrame(draw, canvas); //window.setInterval(draw, refreshRate);
        gameState = "play";
    }
}

function pause() { 
    if(gameState == "play") {
        gameState = "pause";
    }
}

function stop() {
    gameState = "stop";
}

function draw() {
    if(gameState == "play") {
        clearScreen();
        animateBackground();
        animateShark();
//        animateBricks();
        animateMines();
        animateCoins();
        ctx.font = "20px Bold Verdana";
        ctx.fillStyle = textColor;
        ctx.fillText('Score:'+ score, 600, 340);
        
        collisionCheck();
        collisionCheck2();
        
        window.requestAnimationFrame(draw, canvas);
    }
}

function drawCrash() {    
    shark.src = "chopper_burn.png";
    ctx.drawImage(shark, sharkX, sharkY, sharkWidth, sharkHeight);
    
    ctx.fillstyle = "white";
    ctx.strokeStyle = "black";
    
    ctx.font = "50px Bold Verdana";
    ctx.fillText("Game Over!", 240, 140);
    ctx.strokeText("Game Over!", 240, 140);
    
    ctx.font = "30px Bold Verdana";
    ctx.fillText("Click to Continue", 240, 240);
    ctx.strokeText("Click to Continue", 240, 240);
    
    ctx.fill();
    ctx.stroke();
}

function animateShark() {
    if(mouseDown) {
        descentRate = initialDescentRate;
        sharkY = sharkY - ascentRate;

        if(!(ascentRate > terminalVelocity)) {
            ascentRate += liftFactor;
        }
    } else {
        ascentRate = initialAscentRate;
        sharkY = sharkY + descentRate;
    
        if(!(descentRate > terminalVelocity)) {
            descentRate += gravity;
        }
    }
    
     /* Array of particles (global variable)
*/
 var particles = [];

 
    function randomFloat (min, max)
{
	return min + Math.random()*(max-min);
}
    
    function Particle ()
{
	this.scale = 1.0;
	this.x = 0;
	this.y = 0;
	this.radius = 20;
	this.color = "#000";
	this.velocityX = 0;
	this.velocityY = 0;
	this.scaleSpeed = 0.5;

	this.update = function(ms)
	{
		// shrinking
		this.scale -= this.scaleSpeed * ms / 1000.0;

		if (this.scale <= 0)
		{
			this.scale = 0;
		}
		// moving away from explosion center
		this.x += this.velocityX * ms/1000.0;
		this.y += this.velocityY * ms/1000.0;
	};

	this.draw = function(ctx)
	{
		// translating the 2D context to the particle coordinates
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.scale(this.scale, this.scale);

		// drawing a filled circle in the particle's local space
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, Math.PI*2, true);
		ctx.closePath();

		ctx.fillStyle = this.color;
		ctx.fill();

		ctx.restore();
	};
}

    
    function createExplosion(x, y, color)
{
	var minSize = 10;
	var maxSize = 30;
	var count = 10;
	var minSpeed = 60.0;
	var maxSpeed = 200.0;
	var minScaleSpeed = 1.0;
	var maxScaleSpeed = 4.0;

	for (var angle=0; angle<360; angle += Math.round(360/count))
	{
		var particle = new Particle();

		particle.x = x;
		particle.y = y;

		particle.radius = randomFloat(minSize, maxSize);

		particle.color = color;

		particle.scaleSpeed = randomFloat(minScaleSpeed, maxScaleSpeed);

		var speed = randomFloat(minSpeed, maxSpeed);

		particle.velocityX = speed * Math.cos(angle * Math.PI / 180.0);
		particle.velocityY = speed * Math.sin(angle * Math.PI / 180.0);

		particles.push(particle);
	}
}
    // border detection
    if( (sharkY < 0) || (sharkY > (canvas.height-sharkHeight)) ) {
        gameOver();
    }

    ctx.drawImage(shark, sharkX, sharkY, sharkWidth, sharkHeight);
    addSmokeTrail();
    animateSmoke();
}


function animateMines() {
    iterationCount++;
    for(var i=0; i<mineList.length; i++) {
        if(mineList[i].x < 0-mineWidth) {
            mineList.splice(i, 1); // remove the brick that's outside the canvas
        } 
        else { 
            mineList[i].x = mineList[i].x - mineV;
            ctx.drawImage(mine, mineList[i].x, mineList[i].y, mineWidth, mineHeight);
            
            // If enough distance (based on brickInterval) has elapsed since 
            // the last brick was created, create another one
            if(iterationCount >= mineInterval) {
                addMine();
                iterationCount = 0;
                score=score+10;
            }
        }
    }
}

function animateCoins() {
    iterationCount++;
    for(var i=0; i<coinList.length; i++) {
        if(coinList[i].x < 0-coinWidth) {
            coinList.splice(i, 1); // remove the brick that's outside the canvas
        } 
        else { 
            coinList[i].x = coinList[i].x - coinV;
            ctx.drawImage(coin, coinList[i].x, coinList[i].y, coinWidth, coinHeight);
            
            // If enough distance (based on brickInterval) has elapsed since 
            // the last brick was created, create another one
            if(iterationCount >= coinInterval) {
                addCoin();
                iterationCount = 0;
                score=score+10;
            }
        }
    }
}


function animateSmoke() {
    for(var i=0; i<smokeList.length; i++) {
        if(smokeList[i].x < 0) {
            smokeList.splice(i, 1); // remove the smoke particle that outside the canvas
        }
        else {
            smokeList[i].x = smokeList[i].x - mineV;
            ctx.fillStyle = smokeColor;
            ctx.fillRect(smokeList[i].x, smokeList[i].y, 2, 2);
        }
    }
}

function animateBackground() {
    if(scrollVal >= canvas.width){
        scrollVal = 0;
    }
    scrollVal+=backgroundV;       
    ctx.drawImage(background, -scrollVal, 0, backgroundWidth, backgroundHeight);
    ctx.drawImage(background, canvas.width-scrollVal, 0, backgroundWidth, backgroundHeight);
}

/* Very naive collision detection using a bounding box.
 * This will trigger a collision when a brick intersects with the helicopter GIF. 
 * Since the image is square but the helicopter is not, collisions will be detected
 * when the helicopter is merely close, and not actually contacting the brick.
 */
function collisionCheck() {
    for(var i=0; i<mineList.length; i++) {
        if (sharkX < (mineList[i].x + mineWidth) && (sharkX + sharkWidth) > mineList[i].x
                    && sharkY < (mineList[i].y + mineHeight) && (sharkY + sharkHeight) > mineList[i].y ) {
            gameOver();
            createExplosion(x, y, "#FF0000");
			
			createExplosion(x, y, "#FF8518");
        }
    }
}

function collisionCheck2() {
    for(var i=0; i<coinList.length; i++) {
        if (sharkX < (coinList[i].x + coinWidth) && (sharkX + sharkWidth) > coinList[i].x
                    && sharkY < (coinList[i].y + coinHeight) && (sharkY + sharkHeight) > coinList[i].y ) {
        }
    }
}

function gameOver() {
    stop();
    drawCrash();
    var x = randomFloat(100, 400);
    var y = randomFloat(100, 400);

}
function addMine() {
    newMine = {};
    newMine.x = canvas.width;
    newMine.y = Math.floor(Math.random() * (canvas.height-mineHeight));
    mineList.push(newMine);
}

function addCoin() {
    newCoin = {}
    newCoin.x = canvas.width;
    newCoin.y = Math.floor(Math.random() * (canvas.height-coinHeight));
    coinList.push(newCoin);
}

function addSmokeTrail() {
    newParticle = {}
    newParticle.x = sharkX
    newParticle.y = sharkY + 4

    smokeList.push(newParticle);
}

/* Heads up - if this function is just named clear(), onclick fails silently! */
function clearScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


/* This is a nifty trick! */ 
document.body.onmousedown = function() { 
    if(!(mouseDown === 1)) {
        ++mouseDown;
    }
};
document.body.onmouseup = function() {
    if(mouseDown > 0) {
        --mouseDown;
    }
    if(gameState == "pause") {
        play();
    }
};


// This is a niftier trick! Works with taps!
$( function () {
  $( document ).on( "vmousedown", "div", function() {
    if(!(mouseDown === 1)) {
        ++mouseDown;
    }
  }
                  );
});
    
    $( function () {
        $( document ).on( "vmouseup", "div", function() {
            if((mouseDown > 0)) {
                --mouseDown;
            }
            
            if (gameState == "pause") {
                play();
            }
        }
                        );
    });

document.body.onclick = function(e) {
    /* if(e.keyCode == 32) { // spacebar
        if(gameState == "pause") {
            play();
        } else {
            pause();
        }
    } */ 
    
    if(e.CLICK) {
        if(gameState != "play") {
            setup();
        }
    }
};


/**
 * Provides requestAnimationFrame in a cross browser way.
 * @author paulirish / http://paulirish.com/
 * https://gist.github.com/mrdoob/838785
 */
if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
            window.setTimeout( callback, 1000 / 60 );
        };
    } )();
}
