main();

function main () {
// ========== Criar um contexto WebGL ==========
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext('webgl');
    if(!gl ? console.log("WebGL Indisponível!") : console.log("WebGl Pronto!"));

// ========== Definir e armazenar a geometria ==========
    const firstSquare = [
    -0.3 , -0.3, -0.3,
    0.3, -0.3, -0.3,
    0.3, 0.3, -0.3,
    -0.3, -0.3, -0.3,
    -0.3, 0.3, -0.3,
    0.3, 0.3, -0.3,
    ]
//Obs.: Usa-se valores entre -1 e 1 para definir as localizações dos vértices (matriz de exibição), nessa matrix temos (X,Y,Z) para formar um ponto.
//Buffer
    const origBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, origBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(firstSquare), gl.STATIC_DRAW);

// ====== Definir fonte de sombreador ======
    const vsSource = `
        attribute vec4 aPosition;
        void main() {
            gl_Position = aPosition;
        }`;
    
    const fsSource = `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(1, 0, 0, 1);
        }`;

// ====== Criar shaders (sombreadores) ======
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.shaderSource(fragmentShader, fsSource);

// ====== Compilar shaders ======
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

// ====== Criar programa shader ======
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

// ====== Linkar sombreadores e programa ======
    gl.linkProgram(program);
    gl.useProgram(program)

// ====== Conecte o atributo com o sombreador de vértice =======
    const posAttribLocation = gl.getAttribLocation(program, "aPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, origBuffer);

    let size = 3; //Componentes por iteração (Cordenadas X, Y e Z)
    let type = gl.FLOAT; //Dados flutuantes de 32 bits
    let normalize = false; //Normalizar
    let stride = 0; //Não pule indices entre pares de coordenadas
    let offset = 0; //Começa no início do buffer
    gl.vertexAttribPointer(posAttribLocation, size, type, normalize, stride, offset);
   
    gl.enableVertexAttribArray(posAttribLocation);

// ========== Desenho ==========
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

// ====== Desenhe os pontos na tela ======
    const mode = gl.LINE_LOOP;
    const first = 0;
    const count = 6;
    gl.drawArrays(mode, first, count);

}