main();

function main () {
// ========== Criar um contexto WebGL ==========
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext('webgl');
    if(!gl ? console.log("WebGL Indisponível!") : console.log("WebGl Pronto!"));

// ========== Definir e armazenar a geometria ==========
    const square = [
 -0.3 , -0.3, -0.3,
 0.3, -0.3, -0.3,
 0.3, 0.3, -0.3,
 -0.3, -0.3, -0.3,
 -0.3, 0.3, -0.3,
 0.3, 0.3, -0.3,

 -0.2, -0.2, 0.3,
 0.4, -0.2, 0.3,
 0.4, 0.4, 0.3,
 -0.2, -0.2, 0.3,
 -0.2, 0.4, 0.3,
 0.4, 0.4, 0.3,

 -0.3, 0.3, -0.3,
 0.3, 0.3, -0.3,
 -0.2, 0.4, 0.3,
 0.4, 0.4, 0.3,
 0.3, 0.3, -0.3,
 -0.2, 0.4, 0.3,
];
//Obs.: Usa-se valores entre -1 e 1 para definir as localizações dos vértices (matriz de exibição), nessa matrix temos (X,Y,Z) para formar um ponto.
//Buffer Formas
    const origBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, origBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square), gl.STATIC_DRAW);

    const squareColors = [
        0.0,  0.0,  1.0,  1.0,
        0.0,  0.0,  1.0,  1.0,
        0.0,  0.0,  1.0,  1.0,
        0.0,  0.0,  1.0,  1.0,
        0.0,  0.0,  1.0,  1.0,
        0.0,  0.0,  1.0,  1.0,
        
        1.0,  0.0,  0.0,  1.0,
        1.0,  0.0,  0.0,  1.0,
        1.0,  0.0,  0.0,  1.0,
        1.0,  0.0,  0.0,  1.0,
        1.0,  0.0,  0.0,  1.0,
        1.0,  0.0,  0.0,  1.0,
        
        0.0,  1.0,  0.0,  1.0,
        0.0,  1.0,  0.0,  1.0,
        0.0,  1.0,  0.0,  1.0,
        0.0,  1.0,  0.0,  1.0,
        0.0,  1.0,  0.0,  1.0,
        0.0,  1.0,  0.0,  1.0,
    ];

//Buffer Cores
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareColors), gl.STATIC_DRAW);

// ====== Definir fonte de sombreador ======
//vec4 (nforma o compilador para esperar um vetor com quatro índices, cada um representando um valor de r, g, b e alfa)
    const vsSource = `
        attribute vec4 aPosition;
        attribute vec4 aVertexColor;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying lowp vec4 vColor;
        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
            vColor = aVertexColor;
        }`;
    
    const fsSource = `
        precision mediump float;
        varying lowp vec4 vColor;
        void main() {
            gl_FragColor = vColor;
        }`;

// ====== Criar shaders (sombreadores) ======
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.shaderSource(fragmentShader, fsSource);

// ====== Compilar shaders ======
    gl.compileShader(vertexShader);
    if(! gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        alert("Ocorreu um erro ao compilar os sombreadores: " + gl.getShaderInfoLog(vertexShader));
        gl.deleteShader(vertexShader);
        return null;
    }
    
    gl.compileShader(fragmentShader);
    if(! gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        alert("Ocorreu um erro ao compilar os sombreadores: " + gl.getShaderInfoLog(fragmentShader));
        gl.deleteShader(fragmentShader);
        return null;
    }

// ====== Criar programa shader ======
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

// ====== Linkar sombreadores e programa ======
    gl.linkProgram(program);
    gl.useProgram(program);
    

// ====== Conecte o atributo com o sombreador de vértice =======
let cubeRotation = 0.0;
let then = 0;
function render(now){

    //Mantém a mudança no tempo entre os quadros de animação
    now *= 0.001;
    let deltaTime = now - then;
    then = now;

    const posAttribLocation = gl.getAttribLocation(program, "aPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, origBuffer);

    let size = 3; //Componentes por iteração (Cordenadas X, Y e Z)
    let type = gl.FLOAT; //Dados flutuantes de 32 bits
    let normalize = false; //Normalizar
    let stride = 0; //Não pule indices entre pares de coordenadas
    let offset = 0; //Começa no início do buffer
    gl.vertexAttribPointer(posAttribLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(posAttribLocation);

    const colorAttribLocation = gl.getAttribLocation(program, "aVertexColor");
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorAttribLocation);

    const projMatrixLocation = gl.getUniformLocation(program, 'uProjectionMatrix');
    const modelMatrixLocation = gl.getUniformLocation(program, 'uModelViewMatrix');

    //Armazena o valor do angulo de visão
    const fieldOfView = 45 * Math.PI/180;
    //Proporção da cena
    const aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
    //Proximidade da lente
    const zNear = 0.1;
    //Distancia da lente
    const zFar = 100.0;
    const projectionMatrix = glMatrix.mat4.create();

    glMatrix.mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    gl.uniformMatrix4fv(projMatrixLocation, false, projectionMatrix);
    //Matriz 4x4 da api glMatrix
    const modelViewMatrix = glMatrix.mat4.create();


    //Move o cubo em relação ao ponto de vista da câmera
    glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -2.0]);

    //Eixos de Rotação
    //Parâmetros: Matriz de Destino, Matriz de para traduzir e quantidade a ser traduzida
    glMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1]);
    glMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 1, 0]);

    gl.uniformMatrix4fv(modelMatrixLocation, false, modelViewMatrix);

// ========== Desenho ==========
    gl.clearColor(1, 1, 1, 1);

    //Avalia a ordem dos vértices e edefine os dados de cor e profundidade antes de desenhar a cena.
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// ====== Desenhe os pontos na tela ======
    const mode = gl.TRIANGLES;
    const first = 0;
    const count = 18;
    gl.drawArrays(mode, first, count);
    

    cubeRotation += deltaTime;

    //Função da interface window que executa uma função imediatamente após uma tarefa, nesse caso renderizar a página novamente
    requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}