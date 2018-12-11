var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec3 a_Color;\n' +
//    'uniform mat4 u_ViewMatrix;\n' +
//    'uniform mat4 u_ProjMatrix;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'attribute vec4 a_Normal;\n' +
    'void main() {\n' +
    'vec4 transVec = u_NormalMatrix * a_Normal;\n' +
    'vec3 normVec = normalize(transVec.xyz);\n' +
    'vec3 lightVec = normalize(vec3(0.0, 0.0, -1.0));\n' +
    'float nDotL = clamp(dot(normVec, lightVec), 0.0, 1.0);' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  v_Color = vec4((0.3 + 0.7*nDotL)*a_Color, 1.0);\n' +
    '}\n';
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';

var floatsPerVertex = 9;
var currentAngle = 0.0;
var ANGLE_STEP = 90.0;

var canvas;
var modelMatrix;
var viewMatrix;
var projMatrix;
var mvpMatrix, u_MvpMatrix;
var normalMatrix, u_NormalMatrix;

var jointLen = 0.0;

function main() {
    canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);
    if (!gl) {console.log('Failed to get the rendering context for WebGL');	return;}
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {console.log('Failed to intialize shaders.'); return;}
    gl.enable(gl.DEPTH_TEST);
    
    // Set the vertex coordinates and color (the blue triangle is in the front)
    var n = initVertexBuffers(gl);
    if (n < 0) {console.log('Failed to specify the vertex information'); return;}

    gl.clearColor(0.25, 0.2, 0.25, 1.0);
    u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {console.log('Failed to get the storage location of u_MvpMatrix'); return;}

    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {console.log('Failed to get the storage location of u_NormalMatrix'); return;}
    
    // Create a JavaScript matrix to specify the view transformation
    modelMatrix = new Matrix4();
    viewMatrix = new Matrix4();
    projMatrix = new Matrix4();
    mvpMatrix = new Matrix4();
    normalMatrix = new Matrix4();
    // Register the event handler to be called on key press
    document.onkeydown = function(ev){keydown(ev, gl, u_MvpMatrix, mvpMatrix); };

    var tick = function() {
	currentAngle = animate(currentAngle);
	drawResize();
	requestAnimationFrame(tick, canvas);
    }
    tick();
}

function initVertexBuffers(gl) {
    makeStar();
    makeAxes();
    makeGroundGrid();
    
    // How much space to store all the shapes in one array?
    // (no 'var' means this is a global variable)
    mySiz = 2.0*starVerts.length + gndVerts.length + axesVerts.length;
    
    // How many vertices total?
    var nn = mySiz / floatsPerVertex;
    console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
    
    // Copy all shapes into one big Float32 array:
    var verticesColors = new Float32Array(mySiz);
    // Copy them:  remember where to start for each shape:
    star1Start = 0;							// we store the forest first.
    for(i=0,j=0; j< starVerts.length; i++,j++) {
  	verticesColors[i] = starVerts[j];
    }
    star2Start = i;
    for(j=0; j < starVerts.length; i++, j++) {
	verticesColors[i] = starVerts[j];
    }
    axesStart = i;
    for(j=0; j < axesVerts.length; i++, j++) {
	verticesColors[i] = axesVerts[j];
    }
    gndStart = i;						// next we'll store the ground-plane;
    for(j=0; j< gndVerts.length; i++, j++) {
	verticesColors[i] = gndVerts[j];
    }

    // Create a vertex buffer object (VBO)
    var vertexColorbuffer = gl.createBuffer();  
    if (!vertexColorbuffer) {console.log('Failed to create the buffer object');return -1;}
    
    // Write vertex information to buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    // Assign the buffer object to a_Position and enable the assignment
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0) {console.log('Failed to get the storage location of a_Position');return -1;}
    
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 9, 0);
    gl.enableVertexAttribArray(a_Position);
    // Assign the buffer object to a_Color and enable the assignment
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0) {console.log('Failed to get the storage location of a_Color');return -1;}
    
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal<0) {console.log('Failed to get the storage location of a_Normal'); return -1;}

    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE*9, FSIZE*6);
    gl.enableVertexAttribArray(a_Normal);
    
    return mySiz/floatsPerVertex;	// return # of vertices
}


var g_EyeX = 0.0, g_EyeY = 2.0, g_EyeZ = 25.0;
var focusX = 0.0, focusY = 0.0, focusZ = 25.0;
var theta = 0;
var theta2 = 0;
var vel = 0.5;
var vel2 = 0.5;

function keydown(ev, gl, u_MvpMatrix, mvpMatrix) {
    if(ev.keyCode == 39) { // The right arrow key was pressed
	var Dx = vel2*Math.sin(theta2); focusX -= Dx; g_EyeX -= Dx;
	var Dz = vel2*Math.cos(theta2); focusZ += Dz; g_EyeZ += Dz;
	console.log(Dz);
    }
    else if (ev.keyCode == 37) { // The left arrow key was pressed
	var Dx = vel2*Math.sin(theta2); focusX += Dx; g_EyeX += Dx;
	var Dz = vel2*Math.cos(theta2); focusZ -= Dz; g_EyeZ -= Dz;
    }
    else if (ev.keyCode == 38) { // UP -- curl forward
	var Dx = (focusX - g_EyeX)*vel; focusX += Dx; g_EyeX += Dx;
	var Dy = (focusY - g_EyeY)*vel; focusY += Dy; g_EyeY += Dy;
	var Dz = (focusZ - g_EyeZ)*vel; focusZ += Dz; g_EyeZ += Dz;
    }
    else if (ev.keyCode == 40) { // DOWN -- curl backward
	var Dx = (focusX - g_EyeX)*vel; focusX -= Dx; g_EyeX -= Dx;
	var Dy = (focusY - g_EyeY)*vel; focusY -= Dy; g_EyeY -= Dy;
	var Dz = (focusZ - g_EyeZ)*vel; focusZ -= Dz; g_EyeZ -= Dz;
    }
    else if (ev.keyCode == 79) { // O -- lower camera
	g_EyeY -= 0.5;
	focusY -= 0.5
    }
    else if (ev.keyCode == 80) { // P -- raise camera
	g_EyeY += 0.5;
	focusY += 0.5;
    }
    
    // move look-at point
    else if (ev.keyCode == 87) { // W -- look up
	focusY += 0.1;
    }
    else if (ev.keyCode == 83) { // S -- look down
	focusY -= 0.1;
    }
    else if (ev.keyCode == 68) { // D -- turn right
	focusX = g_EyeX + Math.cos(theta);
	focusZ = g_EyeZ + Math.sin(theta);
	theta += 0.1;
	theta2 += 0.1;
	//console.log('Theta: ',theta);
    }
    else if (ev.keyCode == 65) { // A -- turn left
	focusX = g_EyeX + Math.cos(theta);
	focusZ = g_EyeZ + Math.sin(theta);
	theta -= 0.1;
	theta2 -= 0.1;
    }
    else if (ev.keyCode == 77) { // M -- increase joint length
	jointLen += 1.0;
    }
    else if (ev.keyCode == 78) { // N -- decrease joint length
	jointLen -= 1.0;
    }
    else { return; } // Prevent the unnecessary drawing
    
    //console.log("EyeX: ",g_EyeX," EyeY: ",g_EyeY," EyeZ: ",g_EyeZ," focusX: ",focusX," focusY: ",focusY," focusZ: ",focusZ);
    drawResize();
}

function draw(gl, currentAngle, u_MvpMatrix, mvpMatrix) {
    // Clear <canvas> color AND DEPTH buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //console.log(g_EyeX, g_EyeY, g_EyeZ);
    //console.log(focusX, focusY, focusZ);
    
    //  https://www.khronos.org/registry/webgl/specs/1.0/#2.3
    // Draw in the FIRST of several 'viewports'
    gl.viewport(0,  							// Viewport lower-left corner
		0,							// (x,y) location(in pixels)
  		gl.drawingBufferWidth, 				// viewport width, height.
  		gl.drawingBufferHeight);
    projMatrix.setPerspective(35, canvas.width/canvas.height, 1, 100);
    viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, // eye position
  			 focusX, focusY, focusZ, 									// look-at point 
  			 0, 1, 0);
    
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    normalMatrix.setInverseOf(mvpMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    drawMyScene(gl, currentAngle, u_MvpMatrix, mvpMatrix);
}

function drawResize() {
    var nuCanvas = document.getElementById('webgl');
    var nuGL = getWebGLContext(nuCanvas);
    nuCanvas.width = innerWidth;
    nuCanvas.height = innerHeight*7/8; 
    currentAngle = animate(currentAngle);
    draw(nuGL, currentAngle, u_MvpMatrix, mvpMatrix);			
}

var g_last = Date.now();
function animate(angle) {
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    if(angle >   358.0 && ANGLE_STEP > 0) {ANGLE_STEP = -ANGLE_STEP;}
    if(angle <  0.0 && ANGLE_STEP < 0) {ANGLE_STEP = -ANGLE_STEP;}
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}

function drawMyScene(myGL, currentAngle, myu_ViewMatrix, myViewMatrix) {			
    // GROUND PLANE
    myViewMatrix.rotate(-90.0, 1,0,0);	// +Z UPWARDS AXIS

    //normalMatrix.setInverseOf(myViewMatrix);
    //normalMatrix.transpose();
    normalMatrix.setInverseOf(myViewMatrix);
    normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    // WORLD AXES (R, G, B)
    myGL.drawArrays(myGL.LINES,
		    axesStart/floatsPerVertex,
		    axesVerts.length/floatsPerVertex);

    // GROUND PLANE
    myViewMatrix.translate(0.0, 0.0, -0.6);	
    myViewMatrix.scale(0.4, 0.4,0.4);
    normalMatrix.setInverseOf(myViewMatrix);
    normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    
    myGL.drawArrays(myGL.LINES,							
  		    gndStart/floatsPerVertex,
  		    gndVerts.length/floatsPerVertex);

    // GROUND STAR 1
    myViewMatrix.scale(10, 10, 10);
    myViewMatrix.translate(0.0, 5.0, 0.5);
    myViewMatrix.rotate(currentAngle, 0, 0, 1);
    myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLES, 				
  		    star1Start/floatsPerVertex,	
  		    starVerts.length/floatsPerVertex);/*
    myViewMatrix.rotate(-currentAngle, 0, 0, 1);
    myViewMatrix.translate(0.0, -5.0, -0.5);

    // GROUND STAR 2
    //myViewMatrix.scale(10, 10, 10);
    myViewMatrix.translate(10.0, 5.0, 0.5);
    myViewMatrix.rotate(2*currentAngle, 1.0, 0.0, 1.0);
    myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLES, 				
  		    star6Start/floatsPerVertex,	
  		    starVerts.length/floatsPerVertex);
    myViewMatrix.rotate(-2*currentAngle, 1.0, 0.0, 1.0);
    myViewMatrix.translate(-10.0, -5.0, -0.5);*/

/*    // GROUND STAR 3
    //myViewMatrix.scale(10, 10, 10);
    myViewMatrix.translate(-4.0, -5.0, 0.5);
    myViewMatrix.rotate(3*currentAngle, 1.0, 1.0, 1.0);
    myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLES, 				
  		    star7Start/floatsPerVertex,	
  		    starVerts.length/floatsPerVertex);
    myViewMatrix.rotate(-3*currentAngle, 1.0, 1.0, 1.0);
    myViewMatrix.translate(4.0, 5.0, -0.5);
    
    // GROUND STAR 4
    //myViewMatrix.scale(10, 10, 10);
    myViewMatrix.translate(5.0, -5.0, 0.5);
    myViewMatrix.rotate(10*currentAngle, 1, 0, 0);
    myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLES, 				
  		    star8Start/floatsPerVertex,	
  		    starVerts.length/floatsPerVertex);
    myViewMatrix.rotate(-10*currentAngle, 1, 0, 0);
    myViewMatrix.translate(-5.0, 5.0, -0.5);

    // ROTATING STAR
    // return to center of world axes and animate
    myViewMatrix.scale(0.2, 0.2, 0.2);
    myViewMatrix.rotate(90.0, 1, 0, 0);
   
    myViewMatrix.translate(0.0, 2.0, 0.0);
    myViewMatrix.rotate(currentAngle, 0, 1, 0, 0);

    normalMatrix.setInverseOf(myViewMatrix);
    normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    
    myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLES, 				
  		    star1Start/floatsPerVertex,	
  		    starVerts.length/floatsPerVertex);

    // EMERING STAR 1
    myViewMatrix.rotate(currentAngle, 0, 0, 1);

    myViewMatrix.translate(0.0, 1.0+jointLen, 0.0);
    myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    // LOCAL AXES
    myGL.drawArrays(myGL.LINES,
		    axesStart/floatsPerVertex,
		    axesVerts.length/floatsPerVertex);
    myGL.drawArrays(myGL.TRIANGLES, 				
  		    star2Start/floatsPerVertex,	
  		    starVerts.length/floatsPerVertex);

    // EMERING STAR 2
    //myViewMatrix.translate(0.0, currentAngle*currentAngle/50000, 0.0);
    myViewMatrix.rotate(currentAngle, 0, 0, 1);

    myViewMatrix.translate(0.0, 0.0, 1.0+jointLen);
    //myViewMatrix.rotate(currentAngle, 0, 0, 1);
    myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    // LOCAL AXES
    myGL.drawArrays(myGL.LINES,
		    axesStart/floatsPerVertex,
		    axesVerts.length/floatsPerVertex);

    myGL.drawArrays(myGL.TRIANGLES, 				
  		    star3Start/floatsPerVertex,	
  		    starVerts.length/floatsPerVertex);

    // EMERING STAR 3
    //myViewMatrix.translate(0.0, currentAngle*currentAngle*currentAngle/15000000, 0.0);
    myViewMatrix.rotate(currentAngle, 0, 0, 1);
    
    myViewMatrix.translate(0.0, -1.5+jointLen, 0.0);
    //myViewMatrix.rotate(currentAngle, 0, 1, 0);
    myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLES, 				
  		    star4Start/floatsPerVertex,	
  		    starVerts.length/floatsPerVertex);*/

}

function makeGroundGrid() {
    var xcount = 100;			// # of lines to draw in x,y to make the grid.
    var ycount = 100;		
    var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
    var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
    var yColr = new Float32Array([0.5, 1.0, 0.5]);	// bright green.

    var Norm = new Float32Array([0.0, 0.0, 1.0]);
    
    gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
    // draw a grid made of xcount+ycount lines; 2 vertices per line.
    
    var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
    var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
    
    // First, step thru x values as we make vertical lines of constant-x:
    for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) { // YELLOW LINES
	if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
	    gndVerts[j  ] = -xymax + (v  )*xgap;	// x
	    gndVerts[j+1] = -xymax;			// y
	    gndVerts[j+2] = 0.0;		        // z
	}
	else {				// put odd-numbered vertices at (xnow, +xymax, 0).
	    gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
	    gndVerts[j+1] = xymax;			// y
	    gndVerts[j+2] = 0.0;			// z
	}
	gndVerts[j+3] = xColr[0];			// red
	gndVerts[j+4] = xColr[1];			// grn
	gndVerts[j+5] = xColr[2];			// blu
	gndVerts[j+6] = Norm[0];
	gndVerts[j+7] = Norm[1];
	gndVerts[j+8] = Norm[2];
    }
    // Second, step thru y values as wqe make horizontal lines of constant-y:
    // (don't re-initialize j--we're adding more vertices to the array)
    for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
	if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
	    gndVerts[j  ] = -xymax;								// x
	    gndVerts[j+1] = -xymax + (v  )*ygap;	// y
	    gndVerts[j+2] = 0.0;									// z
	}
	else {					// put odd-numbered vertices at (+xymax, ynow, 0).
	    gndVerts[j  ] = xymax;								// x
	    gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
	    gndVerts[j+2] = 0.0;									// z
	}
	gndVerts[j+3] = yColr[0];			// red
	gndVerts[j+4] = yColr[1];			// grn
	gndVerts[j+5] = yColr[2];			// blu
	gndVerts[j+6] = Norm[0];
	gndVerts[j+7] = Norm[1];
	gndVerts[j+8] = Norm[2];
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeAxes() {
    axesVerts = new Float32Array([
	0.0,  0.0,  0.0,		1.0,  0.0,  0.0,     0.0, 0.0, 0.0,	// X AXIS RED
	1.0,  0.0,  0.0,		1.0,  0.0,  0.0,     0.0, 0.0, 0.0,	 						 
	
	0.0,  0.0,  0.0,                0.0,  1.0,  0.0,     0.0, 0.0, 0.0,	// Y AXIS GREEN
	0.0,  1.0,  0.0,		0.0,  1.0,  0.0,     0.0, 0.0, 0.0,						
	
	0.0,  0.0,  0.0,		0.0,  0.0,  1.0,     0.0, 0.0, 0.0,	// Z AXIS BLUE
	0.0,  0.0,  1.0,		0.0,  0.0,  1.0,     0.0, 0.0, 0.0,	
    ]);
}

function makeStar() {

    var frontNorm = new Float32Array([0.0, 1.0, 1.0]);
    var backNorm = new Float32Array([0.0, -1.0, -1.0]);
    starVerts = new Float32Array([
	// 
	0.0,  0.7, 0.0,  	  1.0, 0.0, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	0.0,  0.0, 0.3, 	  1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
       -0.2,  0.2, 0.0, 	  0.5, 0.5, 0.0,    frontNorm[0], frontNorm[1], frontNorm[2],
	
       -0.2,  0.2, 0.0,  	  0.5, 0.5, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],// 1 10 2
	0.0,  0.0, 0.3,       1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
       -0.7,  0.2, 0.0, 	  0.0, 1.0, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],
		
       -0.7,  0.2, 0.0,  	  0.0, 1.0, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],// 2 10 3
	0.0,  0.0, 0.3,       1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
       -0.3,  0.0, 0.0, 	  0.0, 0.5, 0.5,     frontNorm[0], frontNorm[1], frontNorm[2],

       -0.3,  0.0, 0.0,  	  0.0, 0.5, 0.5,     frontNorm[0], frontNorm[1], frontNorm[2],// 3 10 4
        0.0,  0.0, 0.3,       1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
       -0.5, -0.5, 0.0,  	  0.0, 0.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	
       -0.5, -0.5, 0.0, 	  0.0, 0.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2], // 4 10 5
	0.0,  0.0, 0.3,       1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	0.0, -0.2, 0.0, 	  0.5, 0.0, 0.5,    frontNorm[0], frontNorm[1], frontNorm[2],

	0.0, -0.2, 0.0, 	  0.5, 0.0, 0.5,     frontNorm[0], frontNorm[1], frontNorm[2], // 5 10 6
	0.0,  0.0, 0.3,       1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	0.5, -0.5, 0.0, 	  1.0, 0.0, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],

	0.5, -0.5, 0.0,  	  1.0, 0.0, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],// 6 10 7
	0.0,  0.0, 0.3,       1.0, 1.0, 1.0,    frontNorm[0], frontNorm[1], frontNorm[2],
	0.3,  0.0, 0.0, 	  0.5, 0.5, 0.0,    frontNorm[0], frontNorm[1], frontNorm[2],

	0.3,  0.0, 0.0,  	  0.0, 1.0, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],// 7 10 8
	0.0,  0.0, 0.3,       1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	0.7,  0.2, 0.0, 	  0.0, 0.5, 0.5,     frontNorm[0], frontNorm[1], frontNorm[2],

	0.7,  0.2, 0.0, 	  0.0, 0.5, 0.5,    frontNorm[0], frontNorm[1], frontNorm[2], // 8 10 9
	0.0,  0.0, 0.3,       1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	0.2,  0.2, 0.0, 	  0.0, 0.0, 1.0,    frontNorm[0], frontNorm[1], frontNorm[2],
	
	0.2,  0.2, 0.0,  	  0.0, 0.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2], // 9 10 0
	0.0,  0.0, 0.3,       1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	0.0,  0.7, 0.0,  	  0.5, 0.0, 0.5,    frontNorm[0], frontNorm[1], frontNorm[2],

//--------------BACK HALF
	
	0.0,  0.7, 0.0,  	  1.0, 0.0, 0.0,     backNorm[0], backNorm[1], backNorm[2], // 0 11 1
	0.0,  0.0, -0.3,	  1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	    -0.2,  0.2, 0.0,	  0.5, 0.5, 0.0,     backNorm[0], backNorm[1], backNorm[2],
	
       -0.2,  0.2, 0.0, 	  0.5, 0.5, 0.0,     backNorm[0], backNorm[1], backNorm[2],// 1 11 2
	0.0,  0.0, -0.3,       1.0, 1.0, 1.0,    backNorm[0], backNorm[1], backNorm[2],
       -0.7,  0.2, 0.0, 	  0.0, 1.0, 0.0,     backNorm[0], backNorm[1], backNorm[2],
		
       -0.7,  0.2, 0.0, 	  0.0, 1.0, 0.0,     backNorm[0], backNorm[1], backNorm[2],// 2 11 3
	0.0,  0.0, -0.3,      1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
       -0.3,  0.0, 0.0,	  0.0, 0.5, 0.5,     backNorm[0], backNorm[1], backNorm[2],

       -0.3,  0.0, 0.0, 	  0.0, 0.5, 0.5,     backNorm[0], backNorm[1], backNorm[2],// 3 11 4
        0.0,  0.0, -0.3,      1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
       -0.5, -0.5, 0.0, 	  0.0, 0.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	
       -0.5, -0.5, 0.0, 	  0.0, 0.0, 1.0,     backNorm[0], backNorm[1], backNorm[2], // 4 11 5
	0.0,  0.0, -0.3,       1.0, 1.0, 1.0,    backNorm[0], backNorm[1], backNorm[2],
	0.0, -0.2, 0.0, 	  0.5, 0.0, 0.5,    backNorm[0], backNorm[1], backNorm[2],

	0.0, -0.2, 0.0, 	  0.5, 0.0, 0.5,     backNorm[0], backNorm[1], backNorm[2], // 5 11 6
	0.0,  0.0, -0.3,       1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	0.5, -0.5, 0.0, 	  1.0, 0.0, 0.0,     backNorm[0], backNorm[1], backNorm[2],

	0.5, -0.5, 0.0,  	  1.0, 0.0, 0.0,     backNorm[0], backNorm[1], backNorm[2],// 6 11 7
	0.0,  0.0, -0.3,       1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	0.3,  0.0, 0.0, 	  0.5, 0.5, 0.0,     backNorm[0], backNorm[1], backNorm[2],

	0.3,  0.0, 0.0,  	  0.0, 1.0, 0.0,     backNorm[0], backNorm[1], backNorm[2],// 7 11 8
	0.0,  0.0, -0.3,       1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	0.7,  0.2, 0.0, 	  0.0, 0.5, 0.5,     backNorm[0], backNorm[1], backNorm[2],

	0.7,  0.2, 0.0, 	  0.0, 0.5, 0.5,     backNorm[0], backNorm[1], backNorm[2], // 8 11 9
	0.0,  0.0, -0.3,       1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	0.2,  0.2, 0.0,	  0.0, 0.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	
	0.2,  0.2, 0.0,  	  0.0, 0.0, 1.0,    backNorm[0], backNorm[1], backNorm[2], // 9 11 0
	0.0,  0.0, -0.3,       1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	0.0,  0.7, 0.0,  	  0.5, 0.0, 0.5,     backNorm[0], backNorm[1], backNorm[2],
    ]);
}
