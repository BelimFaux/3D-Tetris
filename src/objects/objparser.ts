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
 * Class to parse .obj files to data that can be used to construct objects
 */
export class ObjParser {
    vertices: Array<Array<number>> = [];
    vertexIndices: Array<number> = [];
    normals: Array<Array<number>> = [];
    normalIndices: Array<number> = [];
    texturecoords: Array<Array<number>> = [];
    textureIndices: Array<number> = [];
    currentLine = 0;

    constructor() {}

    /**
     * Parse an .obj file to a ObjData object.
     *
     * @param file {string} - the contents of the file
     * @returns {ObjData} the resulting ObjData
     */
    parse(file: string): ObjData {
        this.vertices = [];
        this.normals = [];
        this.vertexIndices = [];
        this.normalIndices = [];
        this.textureIndices = [];
        this.currentLine = 0;

        const lines = file.split('\n');

        lines.forEach((line: string) => {
            this.parseLine(line);
            this.currentLine++;
        });

        let vertices = [];
        let normals = [];
        let texturecoords = [];
        let indices = [];

        for (let i = 0; i < this.vertexIndices.length; i++) {
            const vInd = this.vertexIndices[i] as number;
            const nInd = this.normalIndices[i] as number;
            const tInd = this.textureIndices[i] as number;

            vertices.push(this.vertices[vInd] as Array<number>);
            normals.push(this.normals[nInd] as Array<number>);
            texturecoords.push(this.texturecoords[tInd] as Array<number>);
            indices.push(i);
        }

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
                if (coords.length != 2)
                    this.error(`Texturecoord has more than 2 points`);
                this.texturecoords.push(coords);
                break;
            case 'f':
                if (len != 4) {
                    this.error(`Expected 4 Elements but found ${len}`);
                }
                words.forEach((data) => {
                    const [ind, tex, normal] = this.parseFace(data);
                    this.vertexIndices.push(ind - 1);
                    this.textureIndices.push((tex || 1) - 1);
                    this.normalIndices.push((normal || 1) - 1);
                });
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
