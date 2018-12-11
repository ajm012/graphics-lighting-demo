// GOURAUD SHADING = CALCULATE V_COLOR IN VERTEX SHADER

function VBObox0() {
    // VERTEX SHADER
    this.VERT_SRC = 
	'precision highp float;\n' +				
	'struct MatlT {\n' +		
	'		vec3 emit;\n' +			
	'		vec3 ambi;\n' +			
	'		vec3 diff;\n' +		
	'		vec3 spec;\n' + 		
	'		int shiny;\n' +			
	'		};\n' +
	'struct LampT {\n' +		
	'	vec3 pos;\n' +			
	' 	vec3 ambi;\n' +			// Ia ==  ambient light source strength (r,g,b)
	' 	vec3 diff;\n' +			// Id ==  diffuse light source strength (r,g,b)
	'	vec3 spec;\n' +			// Is == specular light source strength (r,g,b)
	'}; \n' +
	'uniform LampT u_LampSet[2];\n' +
	'uniform MatlT u_MatlSet[1];\n' +
	'attribute vec4 a_Position;\n' +
	'attribute vec3 a_Color;\n' +
	'uniform mat4 u_MvpMatrix;\n' +
	'uniform mat4 u_NormalMatrix;\n' +
	'varying vec4 v_Color;\n' +
	'attribute vec4 a_Normal;\n' +
    // ---
	'void main() {\n' +
	'  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
	'  vec4 position = u_ModelMatrix * a_Position;\n' +
	//'  vec4 transVec = u_NormalMatrix * a_Normal;\n' +
	//'  vec3 normVec = normalize(transVec.xyz);\n' +
	//'  vec3 lightVec = normalize(vec3(1.0, 1.0, 1.0));\n' +
	//'  float nDotL = clamp(dot(normVec, lightVec), 0.0, 1.0);' +
	'  gl_Position = u_MvpMatrix * a_Position;\n' +
	//'  v_Color = vec4((0.3 + 0.7*nDotL)*a_Color, 1.0);\n' +
	'}\n';
    
    // FRAGMENT SHADER
    this.FRAG_SRC = 
	'precision mediump float;\n' +
	'varying vec4 v_Color;\n' +
	'void main() {\n' +
	'  gl_FragColor = v_Color;\n' +
	'}\n';

    this.uLoc_Ke = false;
    this.uLoc_Ka = false;
    this.uLoc_Kd = false;
    this.uLoc_Kd2 = false;			// for K_d within the MatlSet[0] element.l
    this.uLoc_Ks = false;
    this.uLoc_Kshiny = false;
    this.matlSel= MATL_RED_PLASTIC;				// see keypress(): 'm' key changes matlSel
    this.matl0 = new Material(this.matlSel);

    this.vboContents = fillVerticesArray();
    this.vboVerts = arraySize();
    this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;

    this.vboLoc;
    this.shaderLoc;						
    this.a_PosLoc;									// GPU location for 'a_Pos1' attribute
    this.a_ColrLoc;									// GPU location for 'a_Colr1' attribute
    this.a_NormLoc;

    this.modelMatrix = new Matrix4();
    this.viewMatrix = new Matrix4();
    this.projMatrix = new Matrix4();
    this.mvpMatrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    
    this.u_MvpMatrix;								// GPU location for u_ModelMat uniform
    this.u_NormalMatrix;
}

VBObox0.prototype.init = function(myGL) {
    this.shaderLoc = createProgram(myGL, this.VERT_SRC, this.FRAG_SRC);
    if (!this.shaderLoc) {console.log(this.constructor.name + '.init() failed to create executable Shaders on the GPU. Bye!');return;}

    myGL.program = this.shaderLoc;		
    this.vboLoc = myGL.createBuffer();	
    if (!this.vboLoc) {console.log(this.constructor.name + '.init() failed to create VBO in GPU. Bye!'); return;}

    myGL.bindBuffer(myGL.ARRAY_BUFFER,	
  		    this.vboLoc);			
  											
    myGL.bufferData(myGL.ARRAY_BUFFER, 		// GLenum target(same as 'bindBuffer()')
 		    this.vboContents, 		// JavaScript Float32Array
  		    myGL.STATIC_DRAW);		// Usage hint.

    this.uLoc_Ke = myGL.getUniformLocation(myGL.program, 'u_MatlSet[0].emit');
    this.uLoc_Ka = myGL.getUniformLocation(myGL.program, 'u_MatlSet[0].ambi');
    this.uLoc_Kd = myGL.getUniformLocation(myGL.program, 'u_MatlSet[0].diff');
    this.uLoc_Ks = myGL.getUniformLocation(myGL.program, 'u_MatlSet[0].spec');
    this.uLoc_Kshiny = myGL.getUniformLocation(myGL.program, 'u_MatlSet[0].shiny');

    if(!this.uLoc_Ke || !this.uLoc_Ka || !this.uLoc_Kd  || !this.uLoc_Ks || !this.uLoc_Kshiny) {console.log('Failed to get GPUs Reflectance storage locations');return;}
  							 
    this.a_PosLoc = myGL.getAttribLocation(this.shaderLoc, 'a_Position');
    if(this.a_PosLoc < 0) {console.log(this.constructor.name + '.init() Failed to get GPU location of attribute a_Position'); return -1;}
    
    this.a_ColrLoc = myGL.getAttribLocation(this.shaderLoc, 'a_Color');
    if(this.a_ColrLoc < 0) {console.log(this.constructor.name + '.init() failed to get the GPU location of attribute a_Color');return -1;}

    this.a_NormLoc = myGL.getAttribLocation(this.shaderLoc, 'a_Normal');
    if(this.a_NormLoc < 0) {console.log(this.constructor.name + '.init() failed to get the GPU location of attribute a_Normal');return -1;}
    
    myGL.vertexAttribPointer(
	this.a_PosLoc,                  //index == ID# for the attribute var in your GLSL shaders;
	3,				// size == how many dimensions for this attribute: 1,2,3 or 4?
	myGL.FLOAT,			// type == what data type did we use for those numbers?
	false,				// isNormalized == are these fixed-point values that we need
	9*this.FSIZE,	
	0);				// Offset == how many bytes from START of buffer to the first value we will actually use? 
    myGL.vertexAttribPointer(this.a_ColrLoc, 3, myGL.FLOAT, false, 
  			   9*this.FSIZE, 3*this.FSIZE);
    myGL.vertexAttribPointer(this.a_NormLoc, 3, myGL.FLOAT, false, 
  			   9*this.FSIZE, 6*this.FSIZE);
    
    
    myGL.enableVertexAttribArray(this.a_PosLoc);
    myGL.enableVertexAttribArray(this.a_ColrLoc);
    myGL.enableVertexAttribArray(this.a_NormLoc);
    
    this.u_MvpMatLoc = myGL.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
    if (!this.u_MvpMatLoc) {console.log(this.constructor.name + '.init() failed to get GPU location for u_MvpMatrix uniform');return;}
    this.u_NormMatLoc = myGL.getUniformLocation(this.shaderLoc, 'u_NormalMatrix');
    if (!this.u_NormMatLoc) {console.log(this.constructor.name + '.init() failed to get GPU location for u_NormalMatrix uniform');return;}

    document.onkeydown = function(ev){keydown(ev, myGL, this.u_MvpMatrix, this.mvpMatrix); };
}

VBObox0.prototype.adjust = function(myGL, canvas) {
    myGL.useProgram(this.shaderLoc);
    myGL.viewport(0,  							// Viewport lower-left corner
		0,							// (x,y) location(in pixels)
  		myGL.drawingBufferWidth, 				// viewport width, height.
  		myGL.drawingBufferHeight);
    this.projMatrix.setPerspective(35, canvas.width/canvas.height, 1, 100);

    gl.uniform3fv(this.uLoc_Ke, this.matl0.K_emit.slice(0,3));				// Ke emissive
    gl.uniform3fv(this.uLoc_Ka, this.matl0.K_ambi.slice(0,3));				// Ka ambient
    gl.uniform3fv(this.uLoc_Kd, this.matl0.K_diff.slice(0,3));				// Kd	diffuse
    gl.uniform3fv(this.uLoc_Ks, this.matl0.K_spec.slice(0,3));				// Ks specular
    gl.uniform1i(this.uLoc_Kshiny, parseInt(this.matl0.K_shiny, 10));     // Kshiny 
    
    this.viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, // eye position
  			 focusX, focusY, focusZ, 									// look-at point 
  			 0, 1, 0);
    
    //this.mvpMatrix.set(this.projMatrix).multiply(this.viewMatrix).multiply(this.modelMatrix);
    //this.normalMatrix.setInverseOf(this.mvpMatrix);
    //this.normalMatrix.transpose();
    myGL.uniformMatrix4fv(this.u_MvpMatLoc, false, this.mvpMatrix.elements);
    myGL.uniformMatrix4fv(this.u_NormMatLoc, false, this.normalMatrix.elements);
}

VBObox0.prototype.draw = function(myGL) {
    myGL.useProgram(this.shaderLoc);
    myGL.bindBuffer(myGL.ARRAY_BUFFER,	// GLenum 'target' for this GPU buffer 
		    this.vboLoc);

    myGL.vertexAttribPointer(this.a_PosLoc, 3, myGL.FLOAT, false, 9*this.FSIZE, 0);
    myGL.vertexAttribPointer(this.a_ColrLoc, 3, myGL.FLOAT, false, 
  			   9*this.FSIZE, 3*this.FSIZE);
    myGL.vertexAttribPointer(this.a_NormLoc, 3, myGL.FLOAT, false, 
  			   9*this.FSIZE, 6*this.FSIZE);
    
    myGL.enableVertexAttribArray(this.a_PosLoc);
    myGL.enableVertexAttribArray(this.a_ColrLoc);
    myGL.enableVertexAttribArray(this.a_NormLoc);

    this.modelMatrix.setRotate(-90.0, 1,0,0);	// +Z UPWARDS AXIS
    this.mvpMatrix.set(this.projMatrix).multiply(this.viewMatrix).multiply(this.modelMatrix);
    myGL.uniformMatrix4fv(this.u_MvpMatLoc, false, this.mvpMatrix.elements);
    
    this.normalMatrix.setInverseOf(this.modelMatrix);
    this.normalMatrix.transpose();
    myGL.uniformMatrix4fv(this.u_NormMatLoc, false, this.normalMatrix.elements);

    // GROUND PLANE
    this.modelMatrix.translate(0.0, 0.0, -0.6);	
    this.modelMatrix.scale(0.4, 0.4,0.4);
    this.mvpMatrix.set(this.projMatrix).multiply(this.viewMatrix).multiply(this.modelMatrix);
    myGL.uniformMatrix4fv(this.u_MvpMatLoc, false, this.mvpMatrix.elements);
    
    this.normalMatrix.setInverseOf(this.modelMatrix);
    this.normalMatrix.transpose();
    myGL.uniformMatrix4fv(this.u_NormMatLoc, false, this.normalMatrix.elements);

    // SPHERE
    this.modelMatrix.scale(3, 3, 3);
    this.modelMatrix.translate(0.0, 3.0, 0.5);
    this.modelMatrix.rotate(currentAngle, 1, 0, 0);
    this.mvpMatrix.set(this.projMatrix).multiply(this.viewMatrix).multiply(this.modelMatrix);
    myGL.uniformMatrix4fv(this.u_MvpMatLoc, false, this.mvpMatrix.elements);

    this.normalMatrix.setInverseOf(this.modelMatrix);
    this.normalMatrix.transpose();
    myGL.uniformMatrix4fv(this.u_NormMatLoc, false, this.normalMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, 				
  		    sphStart/floatsPerVertex,	
  		    sphVerts.length/floatsPerVertex);

    // SPHERE 2
    this.modelMatrix.scale(2, 2, 2);
    this.modelMatrix.translate(0, 0, 2.0);
    this.modelMatrix.rotate(currentAngle, 0, 1, 0);
    this.mvpMatrix.set(this.projMatrix).multiply(this.viewMatrix).multiply(this.modelMatrix);
    myGL.uniformMatrix4fv(this.u_MvpMatLoc, false, this.mvpMatrix.elements);

    this.normalMatrix.setInverseOf(this.modelMatrix);
    this.normalMatrix.transpose();
    myGL.uniformMatrix4fv(this.u_NormMatLoc, false, this.normalMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, 				
  		    sph2Start/floatsPerVertex,	
  		    sphVerts.length/floatsPerVertex);
}
