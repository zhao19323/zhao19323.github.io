// noprotect

import * as Shox from "https://cdn.jsdelivr.net/npm/shox@1.1.0/src/Shox.js"

export const frag = `#version 300 es

	precision mediump float;

	uniform vec2 canvasSize;
	uniform vec2 mouse;
	uniform float time;
	uniform vec2 Grid;
	uniform sampler2D Atlas;
	uniform vec2 AtlasGrid;
	uniform float EmojisLength;
	uniform int FLOW_TYPE;
	uniform bool ENABLE_SHADOW;
	uniform bool ENABLE_DISTORTIONS;
	uniform float DISTORTIONS_WEIGHT;

	in vec2 vTexCoord;
	out vec4 fragColor;

	${Shox.noiseMath}
	${Shox.snoise3D}
	${Shox.gradient}
	${Shox.pixelate}
	${Shox.mapFunc}

	vec4 sprite(vec2 uv, sampler2D atlas, vec2 atlasGrid, float id) {
		uv /= atlasGrid;
		uv += vec2(mod(id, atlasGrid.x), floor(id / atlasGrid.x))/atlasGrid;
		return texture(atlas, uv);
	}

	vec2 lensDistortions(vec2 uv, vec2 mouse, float wei, float range, float exp) {
		float dist = pow(length(uv - mouse), exp);
		dist = smoothstep(0., range, dist);
		vec2 lensCenter = mouse + wei * dist * (uv - mouse);
		return uv + wei * (lensCenter - uv);
	}

	void main() {
		float t = time*.1;
		vec2 uv = vTexCoord-.5;
		vec2 mo = mouse-.5;
		mo.x *= canvasSize.x/canvasSize.y;
		uv.x *= canvasSize.x/canvasSize.y;

		if (ENABLE_DISTORTIONS) {
			uv = lensDistortions(uv, mo, 1., 2., DISTORTIONS_WEIGHT);
		}

		vec2 fuv = fract(uv*Grid);
		vec2 iuv = floor(uv*Grid);
		vec2 puv = pixelate(uv, Grid);

		float flow;
		switch (FLOW_TYPE) {
			case 1: flow = vertical(puv, 2., t);              break;
			case 2: flow = horizontal(puv, 2., t);            break;
			case 3: flow = radial(puv, vec2(0.), 2., t);      break;
			case 4: flow = conical(puv, vec2(0.), 2., t).x;   break;
			case 5: flow = swirl(puv, vec2(0.), 2., t, 1.).x; break;
			case 6: flow = .5+.5*snoise(vec3(puv, t));        break;
		}

		float id = floor(map(flow, 0., 1., 0., EmojisLength-0.0001));
		vec4 sp = sprite(fuv, Atlas, AtlasGrid, id);

		fragColor = vec4(sp.rgb, 1.);
		if (ENABLE_SHADOW) {
			fragColor *= (1.-length(uv-mo));
		}
	}
`

export const vert = `#version 300 es

	in vec4 aPosition;
	in vec2 aTexCoord;

	out vec2 vTexCoord;

	void main() {
		vTexCoord = aTexCoord;
		gl_Position = aPosition;
	}
`
