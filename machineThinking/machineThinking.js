var characters = [];
var b = [];

function setup() {
    createCanvas(windowWidth, windowHeight);

    for (var i = 0; i < 30; i++) {
        b[i] = new Block();
    }
}

function draw() {
    fill(255);
    background(0);

    for (var i = 0; i < 10; i++) {
        b[i].draw();
    }
}

class Block {
    constructor() {
        this.characters = '010101010101010101010101010101010';
        this.x = random(width);
        this.y = random(height);
        this.time_limit = random(2, 30);
        this.counter = 0;
        this.super_counter = 0;
        this.strings = [''];
        this.char_max = random(5, 300);
        this.strings_amount = random(10, 40);
    }

    draw() {

        if (this.counter > this.time_limit) {
            for (var y = 0; y < this.strings_amount; y++) {
                this.strings[y] = '';
                for (var t = 0; t < this.char_max; t++) {
                    this.strings[y] += this.characters.charAt(floor(random(0, this.characters.length)));

                    var break_dice = random(100);
                    if (break_dice < 5) {
                        break;
                    }
                }
            }
            this.counter = 0;

            if (this.super_counter > 10) {
                this.char_max = random(5, 300);
                this.x = random(windowWidth);
                this.y = random(windowHeight);
                this.super_counter = 0;
            } else {
                this.super_counter++;
            }

        } else {
            for (var y = 0; y < this.strings_amount; y++) {
                text(this.strings[y], this.x, this.y + y * 20);
            }
            this.counter++;
        }
    }
}