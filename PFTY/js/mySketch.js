let metaballShader;

const N_balls = 20,
    metaballs = [];

function preload() {
    metaballShader = getShader(this._renderer);
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    shader(metaballShader);

    for (let i = 0; i < N_balls; i ++) metaballs.push(new Metaball());
}

function draw() {
    var data = [];

    for (const ball of metaballs) {
        ball.update();
        data.push(ball.pos.x, ball.pos.y, ball.radius);
    }

    metaballShader.setUniform("metaballs", data);
    rect(0, 0, width, height);
}

// OpenProcessing has a bug where it always creates a scrollbar on Chromium.
function mouseWheel() { // This stops the canvas from scrolling by a few pixels.
    return false;
}
class Metaball {
    constructor() {
        const size = Math.pow(Math.random(), 2);
        this.vel = p5.Vector.random2D().mult(5 * (1 - size) + 2);
        this.radius = 100 * size + 20;

        this.pos = new p5.Vector(random(this.radius, width - this.radius), random(this.radius, height - this.radius));
    }

    update() {
        this.pos.add(this.vel);

        if (this.pos.x < this.radius || this.pos.x > width  - this.radius) this.vel.x *= -1;
        if (this.pos.y < this.radius || this.pos.y > height - this.radius) this.vel.y *= -1;
    }
}
function getShader(_renderer) {
    const vert = `
		attribute vec3 aPosition;
		attribute vec2 aTexCoord;

		varying vec2 vTexCoord;

		void main() {
			vTexCoord = aTexCoord;

			vec4 positionVec4 = vec4(aPosition, 1.0);
			positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

			gl_Position = positionVec4;
		}
	`;

    const frag = `
		precision highp float;

		varying vec2 vTexCoord;

		uniform vec3 metaballs[${N_balls}];

		const float WIDTH = ${windowWidth}.0;
		const float HEIGHT = ${windowHeight}.0;

		void main() {
			float x = vTexCoord.x * WIDTH;
			float y = vTexCoord.y * HEIGHT;
			float v = 0.0;

			for (int i = 0; i < ${N_balls}; i++) {
				vec3 ball = metaballs[i];
				float dx = ball.x - x;
				float dy = ball.y - y;
				float r = ball.z;
				v += r * r / (dx * dx + dy * dy);
			}

			if (v > 1.0) gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
			else gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0);
		}
	`;

    return new p5.Shader(_renderer, vert, frag);
}