import { mountFlex } from "https://cdn.jsdelivr.net/npm/p5.flex@0.2.0/src/p5.flex.min.mjs"
import { mountControl } from "./Controls.js"
import { vert, frag } from "./shader.js"

mountFlex(p5)
mountControl(p5)

new p5((p) => {
    const [WIDTH, HEIGHT] = [p.windowWidth, p.windowHeight]
    const PIXEL_DENSITY = 2
    const CANVAS_SIZE = [WIDTH, HEIGHT]
    let Atlas, theShader

    // prettier-ignore
    const emojis = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

    // Grid. if the screen is not square will expand more cells
    const cols = 27
    const rows = 27
    const Grid = [cols, rows]

    const STATE = {
        FLOW_TYPE: 6,
        ENABLE_SHADOW: true,
        ENABLE_DISTORTIONS: true,
        DISTORTIONS_WEIGHT: 0.38,
    }

    p.setup = () => {
        p.createCanvas(WIDTH, HEIGHT, p.WEBGL)
        p.flex({ canvas: { fit: p.COVER } })
        p.pixelDensity(PIXEL_DENSITY)

        theShader = p.createShader(vert, frag)

        p.noStroke()
        p.imageMode(p.CENTER)
        p.background(0)

        Atlas = initAtlas({
            array: emojis,
            cols: 5,
            unitSize: 128,
        })

        controls()
    }

    p.draw = () => {
        p.background(0)

        p.shader(theShader)
        theShader.setUniform("canvasSize", CANVAS_SIZE)
        theShader.setUniform("mouse", [p.mouseX / WIDTH, p.mouseY / HEIGHT])
        theShader.setUniform("time", p.frameCount / 60)
        theShader.setUniform("Grid", Grid)
        theShader.setUniform("Atlas", Atlas.atlas)
        theShader.setUniform("AtlasGrid", [Atlas.cols, Atlas.rows])
        theShader.setUniform("EmojisLength", emojis.length)
        theShader.setUniform("FLOW_TYPE", STATE.FLOW_TYPE)
        theShader.setUniform("ENABLE_SHADOW", STATE.ENABLE_SHADOW)
        theShader.setUniform("ENABLE_DISTORTIONS", STATE.ENABLE_DISTORTIONS)
        theShader.setUniform("DISTORTIONS_WEIGHT", STATE.DISTORTIONS_WEIGHT)
        p.quad(-1, 1, 1, 1, 1, -1, -1, -1)
    }

    const initAtlas = ({ array, cols, unitSize, unitScale = 0.8 }) => {
        const rows = p.ceil(emojis.length / cols)
        const atlas = p.createGraphics(unitSize * cols, unitSize * rows)
        atlas.fill(255)
        atlas.stroke(255)
        atlas.textAlign(atlas.CENTER, atlas.CENTER)
        atlas.textSize(unitSize * unitScale)
        array.forEach((value, index) => {
            const x = unitSize / 2 + unitSize * (index % cols)
            const y = unitSize / 2 + unitSize * atlas.floor(index / cols)
            atlas.text(value, x, y)
        })
        return { atlas, cols, rows }
    }

    const controls = () => {
        p.PressDo("1", () => (STATE.FLOW_TYPE = 1)) // vertical
        p.PressDo("2", () => (STATE.FLOW_TYPE = 2)) // horizontal
        p.PressDo("3", () => (STATE.FLOW_TYPE = 3)) // radial
        p.PressDo("4", () => (STATE.FLOW_TYPE = 4)) // conical
        p.PressDo("5", () => (STATE.FLOW_TYPE = 5)) // swirl
        p.PressDo("6", () => (STATE.FLOW_TYPE = 6)) // noise
        p.PressDo("s", () => (STATE.ENABLE_SHADOW = !STATE.ENABLE_SHADOW))
        p.PressDo("S", () => (STATE.ENABLE_SHADOW = !STATE.ENABLE_SHADOW))
        p.PressDo("d", () => (STATE.ENABLE_DISTORTIONS = !STATE.ENABLE_DISTORTIONS))
        p.PressDo("D", () => (STATE.ENABLE_DISTORTIONS = !STATE.ENABLE_DISTORTIONS))
        p.PressDo(
            "ArrowUp",
            () =>
                (STATE.DISTORTIONS_WEIGHT = p.min(1, STATE.DISTORTIONS_WEIGHT + 0.02))
        )
        p.PressDo(
            "ArrowDown",
            () =>
                (STATE.DISTORTIONS_WEIGHT = p.max(0, STATE.DISTORTIONS_WEIGHT - 0.02))
        )
        p.PressLoopToggle(" ")
    }
})
