// Functions

// Get the position of the mouse pointer
function getMouseXY(e) {
  var userCanvas = document.getElementById('canvas');
  var boundingRect = canvas.getBoundingClientRect();
  var offsetX = boundingRect.left;
  var offsetY = boundingRect.top;
  var w = (boundingRect.width-canvas.width)/2;
  var h = (boundingRect.height-canvas.height)/2;
  offsetX += w;
  offsetY += h;
  // use clientX and clientY as getBoundingClientRect is used above
  var mx = Math.round(e.clientX-offsetX);
  var my = Math.round(e.clientY-offsetY);
  return {x: mx, y: my};
}

// Draws a card on the screen, face down
function drawCardDown(context, card) {
  context.fillStyle = "rgb(75,0,130)";
  context.beginPath();
  context.rect(card.x, card.y, card.w, card.h);
  context.fill();
  context.drawImage(base_image, card.x+10, card.y+5, card.w, card.h);
  card.isFaceUp = false;
}

// Draws a card on the screen, face up, with the correct face image
function drawCardUp(context, card) {
	context.fillStyle = "rgb(10,206,124)";
	context.beginPath();
	context.rect(card.x, card.y, card.w, card.h);
	context.fill();
	context.drawImage(card.i, card.x, card.y-5, card.w*1.2, card.h*1.2);
	card.isFaceUp = true;
}

// Checks whether the user is clicking inside a card
function checkContained(x,y, card) {
  return ((x>=card.x)
          && (x<=card.x+card.w)
          && (y>=card.y)
          && (y<=card.y+card.h));
}

/* Is triggered when the user clicks inside a card.
	First, checks whether the card is already face up and how many cards are flipped.
	If less than 2 cards are flipped and the card is face down, turns it face up.
	Then, if 2 cards are now face up, they are compared to see if they match.
	If they do, they are kept face up. If not, they are flipped back after a short period.
	Then, checks if all matches have been found.
	If so, triggers the winGame function, starting the victory animation. */
function doSomething(evt, context, card) {
  var pos = getMouseXY(evt);
  var inside = checkContained(pos.x, pos.y, card);
  if (inside) {
  	if (flippedCards.length < 2 && !card.isFaceUp) {
  		drawCardUp(context,card);
  		flippedCards.push(card);
  	}
  }
  if (flippedCards.length == 2) {
  	if (flippedCards[0].i == flippedCards[1].i) {
  		flippedCards[0].match = true;
  		flippedCards[1].match = true;
  	}
  	setTimeout(function() {
  		unflip();
  	}, 1000);
  };
  var foundAllMatches = true;
  	for (var i = 0; i < cards.length; i++) {
  		foundAllMatches = foundAllMatches && cards[i].match;
  	}
  if (foundAllMatches) {
  	won = true;
  	winGame(context, winText);
  }
}

// Turns cards that do not match face down again.
function unflip() {
	for (var i = 0; i < cards.length; i++) {
		if (!cards[i].match) {
			drawCardDown(context, cards[i]);
		}
	}
	flippedCards = [];
}

// Contains the starting positions and speeds for the congratulations message
function winText() {
	this.x = 50;
	this.y = 50;
	this.dx = 0.75;
	this.dy = 0.75;
}

// Draws the congratulations message on screen
function drawText(context,x,y) {
	context.fillStyle = "rgb(75,0,130)";
	context.font = "24px sans-serif";
	context.fillText("Congratulations!", x, y);
}

// Clears the canvas
function clear(context) {
	context.clearRect(0, 0, canvas.width, canvas.height);
}

// Updates the position of the congratulations message based on its speeds
function updateText(winText) {
	if ((winText.x + winText.dx) + 210 > WIDTH || winText.x + winText.dx < 0) {
		winText.dx = -winText.dx;
	}
	if (winText.y + winText.dy + 24 > HEIGHT || winText.y + winText.dy - 24 < 0) {
		winText.dy = -winText.dy;
	}
	winText.x += winText.dx;
	winText.y += winText.dy;
}

// Clears the canvas and redraws the congratulations message
function drawWinText(context, winText) {
	clear(context);
	drawText(context, winText.x+5, winText.y);
}

// As long as the user has not restarted the game, continually updates the congratulations message
function nextFrame(context, winText) {
	if (won) {
		requestID = requestAnimationFrame(function() { nextFrame(context
		,winText); } );
		updateText(winText);
		drawWinText(context, winText);
	}
}

// Is called when the user wins the game, starting the congratulations message
function winGame(context, winText) {
	drawWinText(context, winText);
	nextFrame(context, winText);
}

// Swaps two elements of an arbitrary array
function swap(array, i, j) {
	var temp = array[i];
	array[i] = array[j];
	array[j] = temp;
}

// Generates a random integer between 1 and max
function randInt(max) {
	return Math.floor(Math.random() * max);
}

// Randomly shuffles the elements of an arbitrary array
function shuffleSort(array) {
	for (var position = array.length - 1; position > 0; position--) {
		var element = randInt(position + 1);
		swap(array, element, position);
	}
}

// Main program

// Initialises the canvas, restart button, and various constants
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var restartButton = document.getElementById('restartbutton');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
var winText = new winText();
var won = false;

// Imports the logo to use as a card back
base_image = new Image();
base_image.src = '././img/logo.svg';

// Generates an array of images to use for card fronts
var imgArray = new Array();

for (var i = 0; i < 8; i++) {
	imgArray[i] = new Image();
}

imgArray[0].src = '././img/1.svg';
imgArray[1].src = '././img/2.svg';
imgArray[2].src = '././img/3.svg';
imgArray[3].src = '././img/4.svg';
imgArray[4].src = '././img/5.svg';
imgArray[5].src = '././img/6.svg';
imgArray[6].src = '././img/7.svg';
imgArray[7].src = '././img/8.svg';

// Initialises arrays for the game logic
var cards = [];
var flippedCards = [];


// All game logic is contained in this function to make restarting clean and easy
function restart() {

	// Resets the game arrays
	cards = [];
	flippedCards = [];

	// Ensures that the victory message is stopped and cleared from the canvas if it is playing
	won = false;
	foundAllMatches = false;
	clear(context);

	// Randomly pushes two copies of each image to a new array
	var randomArray = [];
		for (var i = 0; i < 8; i++) {
			randomArray.push(imgArray[i]);
			randomArray.push(imgArray[i]);
		}

	// Properly randomises this array so the game is different every time
	shuffleSort(randomArray);

	// Generates card objects at each position in the 4x4 grid with a random front image assigned
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			cards.push({x: 20+(75*i), y: 20+(70*j), w: 50, h: 60, 
				i: randomArray.pop()});
		}
	}



	// Draws all 16 cards face down, starting the game
	for (var n = 0; n < cards.length; n++) {
		drawCardDown(context, cards[n]);
	}

}


// Allows clicks to be registered by the canvas, unless the user has won
canvas.addEventListener('click', function(evt) { 
	for (var n = 0; n < cards.length; n++) {
		if (!won) {
			doSomething(evt, context, cards[n]); }
		}
	});

// Allows the player to restart by clicking the restart button
restartButton.addEventListener('click', function() { restart() });

// This ensures the game will not start until the card back image is loaded
base_image.onload = restart();