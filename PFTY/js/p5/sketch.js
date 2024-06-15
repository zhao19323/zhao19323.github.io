// module aliases
var Engine = Matter.Engine,
Render = Matter.Render,
World = Matter.World,
Bodies = Matter.Bodies,
Runner = Matter.Runner,
MouseConstraint = Matter.MouseConstraint,
Mouse = Matter.Mouse,
Constraint = Matter.Constraint;

// create an engine
var engine,world;
var circles = [];
var box = [];
var mConstraint;

let t = ["I see.","Yeah that’s right.","You’re right.","Yeah that’s obvious.",
	"Oh absolutely.","I totally agree.","I couldn't agree more.","Now I understand.","That’s for sure.","Oh!","Oh my gosh!","Cool!","Oh!","Oh no!","Oh dear!","Damn!","Goodness me!","Oh my gosh!",
	"Bloody hell!","That’s crazy!","Good luck!","Really?","Seriously?",
	"No way. Is that real?",
	"Is it true?",
	"You not serious are you?",
	"How is it possible?",
	"Couldn't believe it!","That can't be real","Are you sure about that?",
	"You' ve got to be kidding me!","How’s your day?","How’re you doing?"
	,"What’s up mate?"
	,"How’s everything going?"
	,"What are you up to these days?"
	,"What have you been doing?"];
let r= [10,8,6,3,4,3,4,8,6,3,4,3,2,3,3,4,5,5,4,3,4,3,2,3,3,4,5,1,3,4,3,2,3,3,4,1,1];


function setup () {
	var canvas =createCanvas (windowWidth, windowHeight); 
	engine = Engine.create();
	world = engine.world;
	Engine.run(engine);
	var options = {
		isStatic: true
	}
	ground = Bodies.rectangle( width/2, height, width*3,2, options);
	groundL = Bodies.rectangle( 0, height/2, 2,height*3,options);
	groundR = Bodies.rectangle( width, height/2, 2, height*3,options);
	groundT = Bodies.rectangle( width/2, -3000,width*3,100,options);
	World.add(world, [ground,groundL,groundR,groundT]);
	for(var i = 0 ; i < t.length; i++){
		var radius = map(r[i],0,10,20,70);
		var n = map(windowWidth,400,2000,1,2.5);
		circles.push(new Circle(random(width),random(-200,-2000), radius*n,t[i]));
	}


	var canvasmouse = Mouse.create(canvas.elt);
	canvasmouse.pixelRatio = 2; 
	var options = {
		mouse: canvasmouse
	}


	mConstraint = MouseConstraint.create(engine,options);
	World.add(world, mConstraint);
} 



function draw () {
	pixelDensity(2);
	background ('#d9d9d9');
	var percent = norm(sin(PI/2+frameCount/100), -1, 1);
	var between = lerpColor(color('#d9d9d9'),color('#d9d9d9'), percent);
	fill(between);
	noStroke();
	rect(0,0,width,height);
	noStroke();
	var size = map(windowWidth,375,2000,14,22);
	textSize(size);
	textAlign(CENTER);
	textSize(size*2.5);
	for(var i = 0; i < t.length; i++){
		circles[i].show();
	}

}


function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}