var floatsPerVertex = 9;
var currentAngle = 0.0;
var ANGLE_STEP = 90.0;

var canvas;
var gl;

var jointLen = 0.0;

ViewBase = new VBObox1();
View1 = new VBObox0();
View2 = new VBObox2();
View3 = new VBObox3();
View4 = new VBObox4();

see1 = true;
see2 = false;
see3 = false;
see4 = false;

matlSel = MATL_RED_PLASTIC;
matlSel2 = MATL_BLU_PLASTIC;
matlSel3 = MATL_GRN_PLASTIC;

a0 = 1;
d0 = 1;
s0 = 1;
a1 = 1;
d1 = 1;
s1 = 1;

x = 0;
y = 0;
z = 0;

var coordx = 6;
var coordy = 5;
var coordz = 5;
    

function main() {
    canvas = document.getElementById('webgl');
    gl = getWebGLContext(canvas);
    if (!gl) {console.log('Failed to get the rendering context for WebGL');	return;}

    ViewBase.init(gl);
    View1.init(gl);
    View2.init(gl);
    View3.init(gl);
    View4.init(gl);
    gl.clearColor(0.25, 0.2, 0.25, 1.0);
    gl.enable(gl.DEPTH_TEST);
    var tick = function() {
	currentAngle = animate(currentAngle);
	drawResize();
	requestAnimationFrame(tick, canvas);
    }
    tick();
}

var g_EyeX = 0.0, g_EyeY = 4.0, g_EyeZ = 25.0;
var focusX = 1.0, focusY = 3.75, focusZ = 25.0;
var theta = 0.0;
var theta2 = 0.0;
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
	focusY += 0.05;
    }
    else if (ev.keyCode == 83) { // S -- look down
	focusY -= 0.05;
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
    else if (ev.keyCode == 77) { // M -- change material
	matlSel = (matlSel +1)%MATL_DEFAULT;		// see materials_Ayerdi.js for list
	matlSel2 = (matlSel2 +1)%MATL_DEFAULT;
	matlSel3 = (matlSel3 +1)%MATL_DEFAULT;
	console.log('MatlSel=', matlSel, '\n');
	//drawResize();
    }
    else if (ev.keyCode == 49) { // 1 -- switch a0
	if (a0 == 1) a0 = 0;
	else a0 = 1;
    }
    else if (ev.keyCode == 50) { // 2 -- switch d0
	if(d0 == 1) d0 = 0;
	else d0 = 1;
    }
    else if (ev.keyCode == 51) { // 3 -- switch s0
	if(s0 == 1) s0 = 0;
	else s0 = 1;
    }
    else if (ev.keyCode == 52) { // 4 -- switch a1
	if(a1 == 1) a1 = 0;
	else a1 = 1;
    }
    else if (ev.keyCode == 53) { // 5 -- switch d1
	if(d1 == 1) d1 = 0;
	else d1 = 1;
	console.log(d1);
    }
    else if (ev.keyCode == 54) { // 6 -- switch s1
	if(s1 == 1) s1 = 0;
	else s1 = 1;
    }
    else if (ev.keyCode == 73) { // I -- move light +y
	y += 1.0;
    }
    else if (ev.keyCode == 74) { // J -- move light -x
	x -= 1.0;
    }
    else if (ev.keyCode == 75) { // K -- move light -y
	y -= 1.0;
    }
    else if (ev.keyCode == 76) { // L -- move light +x
	x += 1.0;
    }
    else if (ev.keyCode == 89) { // Y -- move light -z
	z -= 1.0;
    }
    else if (ev.keyCode == 85) { // U -- move light +z
	z += 1.0;
    }
    else { return; } // Prevent the unnecessary drawing

    //var light = document.getElementById("light");
    document.getElementById('light').innerHTML='X='+(coordx+x).toString()+', Y='+(coordy+y).toString()+', Z='+(coordz+z).toString();
    
    console.log("EyeX: ",g_EyeX," EyeY: ",g_EyeY," EyeZ: ",g_EyeZ," focusX: ",focusX," focusY: ",focusY," focusZ: ",focusZ);
    drawResize();
}

function draw(nugl, currentAngle) {
    // Clear <canvas> color AND DEPTH buffer
    nugl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    ViewBase.adjust(nugl, canvas);
    ViewBase.draw(nugl);
    if (see1) {
	View1.adjust(nugl, canvas);
	View1.draw(nugl);
    }
    if (see2) {
	View2.adjust(nugl, canvas);
	View2.draw(nugl);
    }
    if (see3) {
	View3.adjust(nugl, canvas);
	View3.draw(nugl);
    }
    if (see4) {
	View4.adjust(nugl, canvas);
	View4.draw(nugl);
    }
}

function drawResize() {
    var nuCanvas = document.getElementById('webgl');
    var nuGL = getWebGLContext(nuCanvas);
    nuCanvas.width = innerWidth;
    nuCanvas.height = innerHeight*7/8; 
    currentAngle = animate(currentAngle);
    draw(nuGL);			
}

var g_last = Date.now();
function animate(angle) {
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    if(angle >   358.0 && ANGLE_STEP > 0) {angle %= 360;}
    //if(angle <  0.0 && ANGLE_STEP < 0) {ANGLE_STEP = -ANGLE_STEP;}
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}

function VBO1toggle() {
    if(!see1) {
	see1 = true;
	see2 = false;
	see3 = false;
	see4 = false;
    }// hide.
  console.log('see1: '+see1);
}

function VBO2toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO1'.
    if(!see2) {see2 = true;
	       see1 = false;
	       see3 = false;
	       see4 = false;}// hide.
  console.log('see2: '+see2);
}

function VBO3toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO1'.
    if(!see3) {see3 = true;
	       see1 = false;
	       see2 = false;
	       see4 = false;}// hide.
  console.log('see3: '+see3);
}

function VBO4toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO1'.
    if(!see4) {see4 = true;
	       see1 = false;
	       see2 = false;
	       see3 = false;}// hide.
  console.log('see4: '+see4);
}

//Modal code adapted from https://www.w3schools.com/howto/howto_css_modals.asp
// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
