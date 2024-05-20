let slider1;
let slider2;
let slider3;
let slider4;

function setup() {
    createCanvas(1920,1080);


    img_1 = loadImage('1.png');
    img_5 = loadImage('2.png');
    img_4 = loadImage('3.png');
    img_2 = loadImage('4.png');
    img_3 = loadImage('5.png');


    slider1 = createSlider(0, 255, 0, 10);
    slider1.position(10, 200);
    slider1.style('width', '200px');


    slider2 = createSlider(0, 255, 0, 10);
    slider2.position(10, 250);
    slider2.style('width', '200px');


    slider3 = createSlider(0, 255, 0, 10);
    slider3.position(10, 300);
    slider3.style('width', '200px');

    slider4 = createSlider(0, 255, 0, 10);
    slider4.position(10, 350);
    slider4.style('width', '200px');
}







function draw() {


    image(img_1,0, 0);

    let val1 = slider1.value();
    tint(255,255,255,val1);
    image(img_2,0,0);


    let val2 = slider2.value();
    tint(255,255,255,val2);
    image(img_3,0,0);

    let val3 = slider3.value();
    tint(255,255,255,val3);
    image(img_4,0, 0);

    let val4 = slider4.value();
    tint(255,255,255,val4);
    image(img_5,0, 0);
    fill(255,120);
    noStroke();
    rect(20,160, 400, 250);
    //stroke(0);
    fill(0);
    textSize(18);
    noTint();
    text('This is the carrier of my emotion for this region', 20, 170);
    noTint();
    textSize(18);
    text('Specific location', 20, 200);
    text('There are few roads between lots of trees and grass',20,250)
    text('The road traveled', 20, 300);
    text('Mood',20,350);
}