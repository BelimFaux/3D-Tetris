/**
 * Interface for dataclasses containing object data
 */
export interface ObjData {
    vertices: Float32Array;
    normals: Float32Array;
    texturecoords: Float32Array;
    indices: Uint16Array;
}

/**
 * A vertex as specified in the obj file
 */
interface Vertex {
    v: number;
    vt: number;
    vn: number;
}

/**
 * A Face as specified in the obj file
 */
interface Face {
    v1: Vertex;
    v2: Vertex;
    v3: Vertex;
}

/**
 * Class to parse .obj files to data that can be used to construct objects
 */
export class ObjParser {
    vertices: Array<Array<number>> = [];
    normals: Array<Array<number>> = [];
    texturecoords: Array<Array<number>> = [];
    faces: Array<Face> = [];

    vertexIndices: Array<number> = [];
    normalIndices: Array<number> = [];
    textureIndices: Array<number> = [];

    currentLine = 0;

    /**
     * construct a new parser
     */
    constructor() {}

    /**
     * Parse an .obj file to a ObjData object.
     *
     * @param file {string} - the contents of the file
     * @returns {ObjData} the resulting ObjData
     * @throws an error message if the file could not be parsed for some reason
     */
    parse(file: string): ObjData {
        this.vertices = [];
        this.normals = [];
        this.texturecoords = [];
        this.vertexIndices = [];
        this.normalIndices = [];
        this.textureIndices = [];
        this.faces = [];
        this.currentLine = 0;

        const lines = file.split('\n');

        for (; this.currentLine < lines.length; this.currentLine++) {
            this.parseLine(lines[this.currentLine] as string);
        }

        let vertices: Array<Array<number>> = [];
        let normals: Array<Array<number>> = [];
        let texturecoords: Array<Array<number>> = [];
        let indices: Array<number> = [];

        let i = 0;
        const emitVertex = (vertex: Vertex) => {
            vertices.push(this.vertices[vertex.v] as Array<number>);
            normals.push(this.normals[vertex.vn] as Array<number>);
            texturecoords.push(this.texturecoords[vertex.vt] as Array<number>);
            indices.push(i);
            i++;
        };

        this.faces.forEach((face) => {
            emitVertex(face.v1);
            emitVertex(face.v2);
            emitVertex(face.v3);
        });

        return {
            vertices: new Float32Array(vertices.flat()),
            normals: new Float32Array(normals.flat()),
            texturecoords: new Float32Array(texturecoords.flat()),
            indices: new Uint16Array(indices),
        };
    }

    /**
     * Throw an error with the corresponding line number
     *
     * @param msg {string} - the error message
     * @throws the error message with line number
     */
    private error(msg: string): void {
        throw `Error on line ${this.currentLine}: ${msg}`;
    }

    /**
     * parse a line from an .obj file
     * adds the date directly to the arrays
     *
     * @param line {string} - the line to be parsed
     */
    private parseLine(line: string): void {
        const words = line.split(' ');
        const len = words.length;
        const type = words.shift();

        switch (type) {
            case 'v':
                if (len < 4 || len > 5) {
                    this.error(`Expected 4-5 Elements but found ${len}`);
                }
                let vertex: Array<number> = [];
                words.forEach((data) => {
                    vertex.push(parseFloat(data));
                });
                // normalize
                if (vertex.length == 4) {
                    const w = vertex.pop() || 1;
                    (vertex[0] as number) /= w;
                    (vertex[1] as number) /= w;
                    (vertex[2] as number) /= w;
                }
                if (vertex.length != 3)
                    this.error(`Vertex has more than 3 points`);
                this.vertices.push(vertex);
                break;
            case 'vn':
                if (len != 4) {
                    this.error(`Expected 4 Elements but found ${len}`);
                }
                let normal: Array<number> = [];
                words.forEach((data) => {
                    normal.push(parseFloat(data));
                });
                if (normal.length != 3)
                    this.error(`Normal has more than 3 points`);
                this.normals.push(normal);
                break;
            case 'vt':
                if (len != 3) {
                    this.error(`Expected 3 Elements but found ${len}`);
                }
                let coords: Array<number> = [];
                words.forEach((data) => {
                    coords.push(parseFloat(data));
                });
                coords[1] = 1.0 - (coords[1] as number); // webgl flips the v-axis of textures for some reason
                if (coords.length != 2)
                    this.error(`Texturecoord has more than 2 points`);
                this.texturecoords.push(coords);
                break;
            case 'f':
                if (len != 4) {
                    this.error(`Expected 4 Elements but found ${len}`);
                }
                const vertices: Array<Vertex> = [];
                words.forEach((data) => {
                    const [ind, tex, normal] = this.parseFace(data);
                    const vertex = {
                        v: ind - 1,
                        vt: (tex || 1) - 1,
                        vn: (normal || 1) - 1,
                    };
                    vertices.push(vertex);
                });
                const face = {
                    v1: vertices[0] as Vertex,
                    v2: vertices[1] as Vertex,
                    v3: vertices[2] as Vertex,
                };
                this.faces.push(face);
                break;
        }
    }

    /**
     * Parse face index data from an .obj file
     * The input is expected to be in the format:
     *  `v1/vt1/vn1`
     * where vt1 and vn1 are optional
     *
     * @param inp {string} - the data as a string
     * @returns {[number, number | null, number | null]} a 3-tuple of the numbers [v, vt, vn] (vt1 and vn1 are again optional)
     */
    private parseFace(inp: string): [number, number | null, number | null] {
        const parts = inp.split('/');
        if (parts.length > 3) {
            this.error('Face data contains more than three indices');
        }
        const [ind, tex, normal] = [
            parts[0] || '',
            parts[1] || '',
            parts[2] || '',
        ];

        return [parseInt(ind), parseInt(tex) || null, parseInt(normal) || null];
    }
}
