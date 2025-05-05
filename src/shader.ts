/**
 * Class to generate shader programs
 */
export class Shader {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;

    // variables for the attribute and uniform locations
    locACoord = -1;
    locAColor = -1;
    locUTransform: WebGLUniformLocation = -1;
    locUProjection: WebGLUniformLocation = -1;
    locUView: WebGLUniformLocation = -1;

    /**
     * initialize a new shader program in a gl context
     *
     * @param {WebGL2RenderingContext} gl - the gl context that should be used
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
     * @returns {ProgramBuilder} the 'this' object
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
     * link the program
     *
     * @returns {WebGLProgram} a finished WebGLProgram
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

        this.locUTransform =
            this.gl.getUniformLocation(this.program, 'u_transform') || -1;

        this.locUProjection =
            this.gl.getUniformLocation(this.program, 'u_projection') || -1;

        this.locUView =
            this.gl.getUniformLocation(this.program, 'u_view') || -1;

        return this;
    }

    /**
     * Passes the projection and view matrices to the shader program.
     *
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {mat4} projectionMatrix - The projection matrix.
     * @param {mat4} viewMatrix - The view matrix.
     */
    public projViewMatrix(
        gl: WebGL2RenderingContext,
        projectionMatrix: mat4,
        viewMatrix: mat4,
    ): void {
        gl.uniformMatrix4fv(this.locUView, false, viewMatrix);
        gl.uniformMatrix4fv(this.locUProjection, false, projectionMatrix);
    }

    /**
     * bind the program to the current WebGL Context
     */
    public bind(): void {
        this.gl.useProgram(this.program);
    }
}
