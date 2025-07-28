import type { Slider } from './input/slider.js';
import { getFile } from './utils/files.js';
import * as ui from './ui.js';

const availableShaders = ['gouraud', 'phong'];

/**
 * Class to generate shader programs
 */
export class Shader {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;

    // variables for the attribute and uniform locations
    locACoord = -1;
    locAColor = -1;
    locANormal = -1;
    locATexcoord = -1;
    locUTransform: WebGLUniformLocation = -1;
    locUProjection: WebGLUniformLocation = -1;
    locUEye: WebGLUniformLocation = -1;
    locUNormal: WebGLUniformLocation = -1;
    locUTexture: WebGLUniformLocation = -1;
    locUIsTextured: WebGLUniformLocation = -1;
    locUMixWhite: WebGLUniformLocation = -1;
    locUAmbient: WebGLUniformLocation = -1;
    locUDiffuse: WebGLUniformLocation = -1;
    locUSpecular: WebGLUniformLocation = -1;

    /**
     * initialize a new shader program in a webgl context
     *
     * @param {WebGL2RenderingContext} gl - the webgl context that should be used
     */
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.program = gl.createProgram();
    }

    /**
     * add a shader to the program from the source code
     *
     * @param {string} source - glsl source code for the shader
     * @param {GLenum} type - the type of the shader
     * @returns {Shader} the 'this' object for chaining calls
     * @throws an error message if the compilation fails
     */
    public addShader(source: string, type: GLenum): Shader {
        const shader = this.gl.createShader(type);
        if (!shader) {
            throw "Couldn't create a new shader object.";
        }

        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        // check for compilation errors
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const errorMsg = `Compilation Error while trying to compile ${type} Shader.\nError log is: ${this.gl.getShaderInfoLog(shader)}`;
            this.gl.deleteShader(shader);
            throw errorMsg;
        }

        this.gl.attachShader(this.program, shader);
        return this;
    }

    /**
     * link the program and initialize all locations of attributes and uniforms
     *
     * @returns {WebGLProgram} a finished WebGLProgram
     * @throws an error message if the linking fails
     */
    public link(): Shader {
        this.gl.linkProgram(this.program);

        // check for linking errors
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            const errorMsg = `Compilation Error while trying to link program.\nError log is: ${this.gl.getProgramInfoLog(this.program)}`;
            this.gl.deleteProgram(this.program);
            throw errorMsg;
        }

        this.locACoord = this.gl.getAttribLocation(this.program, 'a_coords');
        this.locAColor = this.gl.getAttribLocation(this.program, 'a_color');
        this.locANormal = this.gl.getAttribLocation(this.program, 'a_normal');
        this.locATexcoord = this.gl.getAttribLocation(
            this.program,
            'a_texture',
        );

        this.locUTransform =
            this.gl.getUniformLocation(this.program, 'u_modelview') || -1;

        this.locUProjection =
            this.gl.getUniformLocation(this.program, 'u_projection') || -1;

        this.locUEye = this.gl.getUniformLocation(this.program, 'u_eye') || -1;

        this.locUNormal =
            this.gl.getUniformLocation(this.program, 'u_normal') || -1;

        this.locUTexture =
            this.gl.getUniformLocation(this.program, 'u_texture') || -1;

        this.locUIsTextured =
            this.gl.getUniformLocation(this.program, 'u_istextured') || -1;

        this.locUMixWhite =
            this.gl.getUniformLocation(this.program, 'u_mixWhite') || -1;

        this.locUAmbient =
            this.gl.getUniformLocation(this.program, 'u_ambientCoefficient') ||
            -1;

        this.locUDiffuse =
            this.gl.getUniformLocation(this.program, 'u_diffuseCoefficient') ||
            -1;

        this.locUSpecular =
            this.gl.getUniformLocation(this.program, 'u_specularCoefficient') ||
            -1;

        return this;
    }

    /**
     * Passes the projection matrix to the shader program.
     *
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {mat4} projectionMatrix - The projection matrix.
     */
    public projMatrix(
        gl: WebGL2RenderingContext,
        projectionMatrix: mat4,
    ): void {
        gl.uniformMatrix4fv(this.locUProjection, false, projectionMatrix);
    }

    /**
     * bind the program to its current WebGL Context
     */
    public bind(): void {
        this.gl.useProgram(this.program);
    }

    /**
     * Initialize coefficients from the ui sliders
     *
     * @param sliders {Slider} the object that watches the sliders
     */
    initCoefficients(sliders: Slider): void {
        if (this.locUAmbient != -1) {
            this.gl.uniform1f(
                this.locUAmbient,
                sliders.getAmbientCoefficient(),
            );
        }
        if (this.locUDiffuse != -1) {
            this.gl.uniform1f(
                this.locUDiffuse,
                sliders.getDiffuseCoefficient(),
            );
        }
        if (this.locUSpecular != -1) {
            this.gl.uniform1f(
                this.locUSpecular,
                sliders.getSpecularCoefficient(),
            );
        }
    }
}

// map for caching all shaders
const shaderMap = new Map<string, Shader>();

/**
 * Load all Shaders specified in the availableShaders Array into a Map
 *
 * @param gl {WebGL2RenderingContext} - the WebGl context
 */
export function loadShaders(gl: WebGL2RenderingContext): void {
    for (const name of availableShaders) {
        const shader = loadShader(gl, name);
        if (shader) {
            shaderMap.set(name, shader);
        }
    }
}

/**
 * retrieve a precached shader from the shader map
 *
 * @param name {string} the name of the shader
 * @returns {Shader} the corresponding shader object
 * @throws an error message if the name is not present in the shader map
 */
export function getShader(name: string): Shader {
    const ret = shaderMap.get(name);
    if (!ret) {
        throw `Unrecoverable Error while searching for shader: Shader ${name} not found.`;
    }
    return ret;
}

/**
 * Load a shader from the name.
 * the files are assumed to be located at 'shaders/{name}.(vert|frag)'
 * If an error occurs this method will report the error to the ui
 *
 * @param gl {WebGL2RenderingContext} - the WebGl context
 * @param name {string} - the name of the shader
 * @returns {Shader | null} the shader if it could be compiled or null
 */
function loadShader(gl: WebGL2RenderingContext, name: string): Shader | null {
    // load shader source
    const vertexSource = getFile(`shaders/${name}.vert`);
    const fragmentSource = getFile(`shaders/${name}.frag`);

    try {
        // create program from shaders
        const shader = new Shader(gl)
            .addShader(vertexSource, gl.VERTEX_SHADER)
            .addShader(fragmentSource, gl.FRAGMENT_SHADER)
            .link();

        return shader;
    } catch (e) {
        ui.reportError(`Error while compiling shader ${name}: ${e}`);
        return null;
    }
}
