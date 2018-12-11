// GOURAUD SHADING = CALCULATE V_COLOR IN VERTEX SHADER
// WITH PHONG LIGHTING
// I'M SNEAKING THE MATERIAL INDEX FOR VERTICES IN THE COLOR.X POSITION, USING FOR LOOP TO AVOID DYNAMIC INDEX ISSUES
// IDEA OF FOR LOOP FROM: http://stackoverflow.com/questions/6247572/variable-array-index-not-possible-in-webgl-shaders

function VBObox4() {
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
	'uniform MatlT u_MatlSet[3];\n' +
	'attribute vec3 matSelect;\n' +
	//'varying float v_Mat;\n' +
	'uniform vec3 u_eyePosWorld; \n' +
	'attribute vec4 a_Position;\n' +
	'attribute vec3 a_Color;\n' +
	'uniform mat4 u_MvpMatrix;\n' +
	'uniform mat4 u_NormalMatrix;\n' +
	'uniform mat4 u_ModelMatrix;\n' +
	'varying vec4 v_Color;\n' +
	'attribute vec4 a_Normal;\n' +
    // ---
	'void main() {\n' +
	'  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
	'  vec4 position = u_ModelMatrix * a_Position;\n' +
	'  vec3 lightDirection = normalize(u_LampSet[0].pos - position.xyz);\n' +
	'  vec3 eyeDirection = normalize(u_eyePosWorld - position.xyz); \n' +
	'  float nDotL = max(dot(lightDirection, normal), 0.0); \n' +

    // CHANGED THIS SECTION FROM VBOBOX1 FOR PHONG LIGHTING
	
	'  vec3 C = normal * max(dot(lightDirection, normal), 0.0);\n' +
	'  vec3 reflectDirection = normalize(2.0*C - lightDirection);\n' +
	'  float lDotR = max(dot(lightDirection, reflectDirection), 0.0);\n' +
	'  for(int i = 0; i < 3; i++){\n' +
	'  if(i == int(matSelect.x)) {\n' +
	'  float e64 = pow(lDotR, float(u_MatlSet[i].shiny));\n'+
	'  vec3 lightDirection1 = normalize(u_LampSet[1].pos - position.xyz);\n' +
	'  float nDotL1 = max(dot(lightDirection1, normal), 0.0); \n' +
	'  vec3 C1 = normal * max(dot(lightDirection1, normal), 0.0);\n' +
	'  vec3 reflectDirection1 = normalize(2.0*C1 - lightDirection1);\n' +
	'  float lDotR1 = max(dot(lightDirection1, reflectDirection1), 0.0);\n' +
	'  float e641 = pow(lDotR1, float(u_MatlSet[i].shiny));\n'+
	
	'  vec3 emissive = u_MatlSet[i].emit;\n' +
	'  vec3 ambient = u_LampSet[0].ambi * u_MatlSet[i].ambi;\n' +
	'  vec3 diffuse = u_LampSet[0].diff * u_MatlSet[i].diff * nDotL;\n' +
	'  vec3 speculr = u_LampSet[0].spec * u_MatlSet[i].spec * e64;\n' +
	'  vec3 ambient1 = u_LampSet[1].ambi * u_MatlSet[i].ambi;\n' +
	'  vec3 diffuse1 = u_LampSet[1].diff * u_MatlSet[i].diff * nDotL1;\n' +
	'  vec3 speculr1 = u_LampSet[1].spec * u_MatlSet[i].spec * e641;\n' +
	'  v_Color = vec4(emissive + ambient + diffuse + speculr + ambient1 + diffuse1 + speculr1, 1.0);\n' +
	'  gl_Position = u_MvpMatrix * a_Position;\n' +
	'  }}\n' +
	//'  v_Color = vec4((0.3 + 0.7*nDotL)*a_Color, 1.0);\n' +
	'}\n';
    
    // FRAGMENT SHADER
    this.FRAG_SRC = 
	'precision mediump float;\n' +
	'varying vec4 v_Color;\n' +
	'void main() {\n' +
	'  gl_FragColor = v_Color;\n' +
	'}\n';

    this.uLoc_eyePosWorld 	= false;
    this.uLoc_ModelMatrix 	= false;
    this.uLoc_MvpMatrix 	= false;
    this.uLoc_NormalMatrix      = false;
    this.eyePosWorld = new Float32Array(3);

    this.uLoc_Ke = false;
    this.uLoc_Ka = false;
    this.uLoc_Kd = false;
    this.uLoc_Kd2 = false;			// for K_d within the MatlSet[0] element.l
    this.uLoc_Ks = false;
    this.uLoc_Kshiny = false;
    
    
    this.lamp0 = new LightsT();
    this.lamp1 = new LightsT();

    this.vboContents = fillVerticesArray();
    this.vboVerts = arraySize();
    this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;

    this.vboLoc;
    this.shaderLoc;						
    this.a_PosLoc;									// GPU location for 'a_Pos1' attribute
    //this.a_ColrLoc;									// GPU location for 'a_Colr1' attribute
    this.a_NormLoc;
    this.a_MatLoc;

    this.modelMatrix = new Matrix4();
    this.viewMatrix = new Matrix4();
    this.projMatrix = new Matrix4();
    this.mvpMatrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    
    this.u_MvpMatrix;								// GPU location for u_ModelMat uniform
    this.u_NormalMatrix;
}

VBObox4.prototype.init = function(myGL) {
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

    this.uLoc_eyePosWorld  = myGL.getUniformLocation(myGL.program, 'u_eyePosWorld');
    this.uLoc_ModelMatrix  = myGL.getUniformLocation(myGL.program, 'u_ModelMatrix');
    this.uLoc_MvpMatrix    = myGL.getUniformLocation(myGL.program, 'u_MvpMatrix');
    this.uLoc_NormalMatrix = myGL.getUniformLocation(myGL.program, 'u_NormalMatrix');
    if (!this.uLoc_eyePosWorld ||!this.uLoc_ModelMatrix	|| !this.uLoc_MvpMatrix || !this.uLoc_NormalMatrix) {console.log('Failed to get GPUs matrix storage locations');return;}

    this.uLoc_Ke = myGL.getUniformLocation(myGL.program, 'u_MatlSet[0].emit');
    this.uLoc_Ka = myGL.getUniformLocation(myGL.program, 'u_MatlSet[0].ambi');
    this.uLoc_Kd = myGL.getUniformLocation(myGL.program, 'u_MatlSet[0].diff');
    this.uLoc_Ks = myGL.getUniformLocation(myGL.program, 'u_MatlSet[0].spec');
    this.uLoc_Kshiny = myGL.getUniformLocation(myGL.program, 'u_MatlSet[0].shiny');
    this.uLoc_Ke1 = myGL.getUniformLocation(myGL.program, 'u_MatlSet[1].emit');
    this.uLoc_Ka1 = myGL.getUniformLocation(myGL.program, 'u_MatlSet[1].ambi');
    this.uLoc_Kd1 = myGL.getUniformLocation(myGL.program, 'u_MatlSet[1].diff');
    this.uLoc_Ks1 = myGL.getUniformLocation(myGL.program, 'u_MatlSet[1].spec');
    this.uLoc_Kshiny1 = myGL.getUniformLocation(myGL.program, 'u_MatlSet[1].shiny');
    this.uLoc_Ke2 = myGL.getUniformLocation(myGL.program, 'u_MatlSet[2].emit');
    this.uLoc_Ka2 = myGL.getUniformLocation(myGL.program, 'u_MatlSet[2].ambi');
    this.uLoc_Kd2 = myGL.getUniformLocation(myGL.program, 'u_MatlSet[2].diff');
    this.uLoc_Ks2 = myGL.getUniformLocation(myGL.program, 'u_MatlSet[2].spec');
    this.uLoc_Kshiny2 = myGL.getUniformLocation(myGL.program, 'u_MatlSet[2].shiny');

    if(!this.uLoc_Ke || !this.uLoc_Ka || !this.uLoc_Kd  || !this.uLoc_Ks || !this.uLoc_Kshiny) {console.log('Failed to get GPUs Reflectance storage locations');return;}

    this.lamp0.u_pos  = myGL.getUniformLocation(myGL.program, 'u_LampSet[0].pos');	
    this.lamp0.u_ambi = myGL.getUniformLocation(myGL.program, 'u_LampSet[0].ambi');
    this.lamp0.u_diff = myGL.getUniformLocation(myGL.program, 'u_LampSet[0].diff');
    this.lamp0.u_spec = myGL.getUniformLocation(myGL.program, 'u_LampSet[0].spec');
    if( !this.lamp0.u_pos || !this.lamp0.u_ambi	|| !this.lamp0.u_diff || !this.lamp0.u_spec) {console.log('Failed to get GPUs Lamp0 storage locations');return; }
    this.lamp1.u_pos  = myGL.getUniformLocation(myGL.program, 'u_LampSet[1].pos');	
    this.lamp1.u_ambi = myGL.getUniformLocation(myGL.program, 'u_LampSet[1].ambi');
    this.lamp1.u_diff = myGL.getUniformLocation(myGL.program, 'u_LampSet[1].diff');
    this.lamp1.u_spec = myGL.getUniformLocation(myGL.program, 'u_LampSet[1].spec');
    if( !this.lamp1.u_pos || !this.lamp1.u_ambi	|| !this.lamp1.u_diff || !this.lamp1.u_spec) {console.log('Failed to get GPUs Lamp1 storage locations');return; }

    this.eyePosWorld.set([g_EyeX, g_EyeY, g_EyeZ]);
    myGL.uniform3fv(this.uLoc_eyePosWorld, this.eyePosWorld);
  							 
    this.a_PosLoc = myGL.getAttribLocation(this.shaderLoc, 'a_Position');
    if(this.a_PosLoc < 0) {console.log(this.constructor.name + '.init() Failed to get GPU location of attribute a_Position'); return -1;}
    
    //this.a_ColrLoc = myGL.getAttribLocation(this.shaderLoc, 'a_Color');
    //if(this.a_ColrLoc < 0) {console.log(this.constructor.name + '.init() failed to get the GPU location of attribute a_Color');return -1;}

    this.a_NormLoc = myGL.getAttribLocation(this.shaderLoc, 'a_Normal');
    if(this.a_NormLoc < 0) {console.log(this.constructor.name + '.init() failed to get the GPU location of attribute a_Normal');return -1;}

    this.a_MatLoc = myGL.getAttribLocation(this.shaderLoc, 'matSelect');
    if(this.a_MatLoc < 0) {console.log(this.constructor.name + '.init() Failed to get GPU location of attribute matSelect'); return -1;}
    
    myGL.vertexAttribPointer(
	this.a_PosLoc,                  //index == ID# for the attribute var in your GLSL shaders;
	3,				// size == how many dimensions for this attribute: 1,2,3 or 4?
	myGL.FLOAT,			// type == what data type did we use for those numbers?
	false,				// isNormalized == are these fixed-point values that we need
	9*this.FSIZE,	
	0);				// Offset == how many bytes from START of buffer to the first value we will actually use? 
    myGL.vertexAttribPointer(this.a_MatLoc, 3, myGL.FLOAT, false, 
  			   9*this.FSIZE, 3*this.FSIZE);
    myGL.vertexAttribPointer(this.a_NormLoc, 3, myGL.FLOAT, false, 
  			   9*this.FSIZE, 6*this.FSIZE);
    
    
    myGL.enableVertexAttribArray(this.a_PosLoc);
    myGL.enableVertexAttribArray(this.a_MatLoc);
    myGL.enableVertexAttribArray(this.a_NormLoc);
    
    this.u_MvpMatLoc = myGL.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
    if (!this.u_MvpMatLoc) {console.log(this.constructor.name + '.init() failed to get GPU location for u_MvpMatrix uniform');return;}
    this.u_NormMatLoc = myGL.getUniformLocation(this.shaderLoc, 'u_NormalMatrix');
    if (!this.u_NormMatLoc) {console.log(this.constructor.name + '.init() failed to get GPU location for u_NormalMatrix uniform');return;}

    document.onkeydown = function(ev){keydown(ev, myGL, this.u_MvpMatrix, this.mvpMatrix); };
}

VBObox4.prototype.adjust = function(myGL, canvas) {
    myGL.useProgram(this.shaderLoc);
    myGL.viewport(0,  							// Viewport lower-left corner
		0,							// (x,y) location(in pixels)
  		myGL.drawingBufferWidth, 				// viewport width, height.
  		myGL.drawingBufferHeight);
    this.projMatrix.setPerspective(35, canvas.width/canvas.height, 1, 100);

    //this.matlSel= MATL_RED_PLASTIC;				// see keypress(): 'm' key changes matlSel
    this.matl0 = new Material(matlSel);
    //this.matlSel2 = MATL_BLU_PLASTIC;
    this.matl1 = new Material(matlSel2);
    //this.matlSel3 = MATL_GRN_PLASTIC;
    this.matl2 = new Material(matlSel3);

    this.lamp0.I_pos.elements.set( [g_EyeX, g_EyeY, g_EyeZ]);
    this.lamp0.I_ambi.elements.set([0.4*a0, 0.4*a0, 0.4*a0]);
    this.lamp0.I_diff.elements.set([1.0*d0, 1.0*d0, 1.0*d0]);
    this.lamp0.I_spec.elements.set([1.0*s0, 1.0*s0, 1.0*s0]);
    this.lamp1.I_pos.elements.set( [6.0 + x, 5.0 + y, 5.0 + z]);
    this.lamp1.I_ambi.elements.set([0.4*a1, 0.4*a1, 0.4*a1]);
    this.lamp1.I_diff.elements.set([1.0*d1, 1.0*d1, 1.0*d1]);
    this.lamp1.I_spec.elements.set([1.0*s1, 1.0*s1, 1.0*s1]);
    
    gl.uniform3fv(this.lamp0.u_pos,  this.lamp0.I_pos.elements.slice(0,3));
    gl.uniform3fv(this.lamp0.u_ambi, this.lamp0.I_ambi.elements);		// ambient
    gl.uniform3fv(this.lamp0.u_diff, this.lamp0.I_diff.elements);		// diffuse
    gl.uniform3fv(this.lamp0.u_spec, this.lamp0.I_spec.elements);		// Specular

    gl.uniform3fv(this.lamp1.u_pos,  this.lamp1.I_pos.elements.slice(0,3));
    gl.uniform3fv(this.lamp1.u_ambi, this.lamp1.I_ambi.elements);		// ambient
    gl.uniform3fv(this.lamp1.u_diff, this.lamp1.I_diff.elements);		// diffuse
    gl.uniform3fv(this.lamp1.u_spec, this.lamp1.I_spec.elements);		// Specular

    gl.uniform3fv(this.uLoc_Ke, this.matl0.K_emit.slice(0,3));				// Ke emissive
    gl.uniform3fv(this.uLoc_Ka, this.matl0.K_ambi.slice(0,3));				// Ka ambient
    gl.uniform3fv(this.uLoc_Kd, this.matl0.K_diff.slice(0,3));				// Kd	diffuse
    gl.uniform3fv(this.uLoc_Ks, this.matl0.K_spec.slice(0,3));				// Ks specular
    gl.uniform1i(this.uLoc_Kshiny, parseInt(this.matl0.K_shiny, 10));     // Kshiny

    gl.uniform3fv(this.uLoc_Ke1, this.matl1.K_emit.slice(0,3));				// Ke emissive
    gl.uniform3fv(this.uLoc_Ka1, this.matl1.K_ambi.slice(0,3));				// Ka ambient
    gl.uniform3fv(this.uLoc_Kd1, this.matl1.K_diff.slice(0,3));				// Kd	diffuse
    gl.uniform3fv(this.uLoc_Ks1, this.matl1.K_spec.slice(0,3));				// Ks specular
    gl.uniform1i(this.uLoc_Kshiny1, parseInt(this.matl1.K_shiny, 10));     // Kshiny
    
    gl.uniform3fv(this.uLoc_Ke2, this.matl2.K_emit.slice(0,3));				// Ke emissive
    gl.uniform3fv(this.uLoc_Ka2, this.matl2.K_ambi.slice(0,3));				// Ka ambient
    gl.uniform3fv(this.uLoc_Kd2, this.matl2.K_diff.slice(0,3));				// Kd	diffuse
    gl.uniform3fv(this.uLoc_Ks2, this.matl2.K_spec.slice(0,3));				// Ks specular
    gl.uniform1i(this.uLoc_Kshiny2, parseInt(this.matl2.K_shiny, 10));     // Kshiny 
    
    this.viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, // eye position
  			 focusX, focusY, focusZ, 									// look-at point 
  			 0, 1, 0);
    
    //this.mvpMatrix.set(this.projMatrix).multiply(this.viewMatrix).multiply(this.modelMatrix);
    //this.normalMatrix.setInverseOf(this.mvpMatrix);
    //this.normalMatrix.transpose();
    myGL.uniformMatrix4fv(this.u_MvpMatLoc, false, this.mvpMatrix.elements);
    myGL.uniformMatrix4fv(this.u_NormMatLoc, false, this.normalMatrix.elements);
}

VBObox4.prototype.draw = function(myGL) {
    myGL.useProgram(this.shaderLoc);
    myGL.bindBuffer(myGL.ARRAY_BUFFER,	// GLenum 'target' for this GPU buffer 
		    this.vboLoc);

    myGL.vertexAttribPointer(this.a_PosLoc, 3, myGL.FLOAT, false, 9*this.FSIZE, 0);
    myGL.vertexAttribPointer(this.a_MatLoc, 3, myGL.FLOAT, false, 
  			   9*this.FSIZE, 3*this.FSIZE);
    myGL.vertexAttribPointer(this.a_NormLoc, 3, myGL.FLOAT, false, 
  			   9*this.FSIZE, 6*this.FSIZE);
    
    myGL.enableVertexAttribArray(this.a_PosLoc);
    myGL.enableVertexAttribArray(this.a_MatLoc);
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

    pushMatrix(this.modelMatrix);
    pushMatrix(this.ModelMatrix);

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
    pushMatrix(this.modelMatrix);

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
  		    sphStart/floatsPerVertex,	
  		    sphVerts.length/floatsPerVertex);

    // SPHERE 3
    this.modelMatrix = popMatrix();
    this.modelMatrix.scale(2, 2, 2);
    this.modelMatrix.translate(0, 0, -2.0);
    this.modelMatrix.rotate(currentAngle, 0, 1, 0);
    this.mvpMatrix.set(this.projMatrix).multiply(this.viewMatrix).multiply(this.modelMatrix);
    myGL.uniformMatrix4fv(this.u_MvpMatLoc, false, this.mvpMatrix.elements);

    this.normalMatrix.setInverseOf(this.modelMatrix);
    this.normalMatrix.transpose();
    myGL.uniformMatrix4fv(this.u_NormMatLoc, false, this.normalMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, 				
  		    sphStart/floatsPerVertex,	
  		    sphVerts.length/floatsPerVertex);

     // SPHERE 4
    this.modelMatrix = popMatrix();
    this.modelMatrix.scale(2, 2, 2);
    this.modelMatrix.translate(9.0, 0.0, 0.0);
    this.modelMatrix.rotate(currentAngle, 0, 1, 0);
    this.mvpMatrix.set(this.projMatrix).multiply(this.viewMatrix).multiply(this.modelMatrix);
    myGL.uniformMatrix4fv(this.u_MvpMatLoc, false, this.mvpMatrix.elements);

    this.normalMatrix.setInverseOf(this.modelMatrix);
    this.normalMatrix.transpose();
    myGL.uniformMatrix4fv(this.u_NormMatLoc, false, this.normalMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, 				
  		    sph2Start/floatsPerVertex,	
  		    sphVerts.length/floatsPerVertex);

    // SPHERE 5
    //this.modelMatrix.scale(2, 2, 2);
    this.modelMatrix.translate(0, 0, 2.0);
    //this.modelMatrix.rotate(currentAngle, 1, 0, 0);
    this.mvpMatrix.set(this.projMatrix).multiply(this.viewMatrix).multiply(this.modelMatrix);
    myGL.uniformMatrix4fv(this.u_MvpMatLoc, false, this.mvpMatrix.elements);

    this.normalMatrix.setInverseOf(this.modelMatrix);
    this.normalMatrix.transpose();
    myGL.uniformMatrix4fv(this.u_NormMatLoc, false, this.normalMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, 				
  		    sph2Start/floatsPerVertex,	
  		    sphVerts.length/floatsPerVertex);
    

    // SPHERE 6
    //this.modelMatrix.scale(2, 2, 2);
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

    // SPHERE 7
    this.modelMatrix = popMatrix();
    this.modelMatrix.scale(2, 2, 2);
    this.modelMatrix.translate(-15.0, 0.0, 5.0);
    this.modelMatrix.rotate(currentAngle, 1, 0, 0);
    this.mvpMatrix.set(this.projMatrix).multiply(this.viewMatrix).multiply(this.modelMatrix);
    myGL.uniformMatrix4fv(this.u_MvpMatLoc, false, this.mvpMatrix.elements);

    this.normalMatrix.setInverseOf(this.modelMatrix);
    this.normalMatrix.transpose();
    myGL.uniformMatrix4fv(this.u_NormMatLoc, false, this.normalMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, 				
  		    sph3Start/floatsPerVertex,	
  		    sphVerts.length/floatsPerVertex);

    // SPHERE 8
    this.modelMatrix.scale(2, 2, 2);
    this.modelMatrix.translate(0, 0, 2.0);
    this.modelMatrix.rotate(currentAngle, 1, 1, 0);
    this.mvpMatrix.set(this.projMatrix).multiply(this.viewMatrix).multiply(this.modelMatrix);
    myGL.uniformMatrix4fv(this.u_MvpMatLoc, false, this.mvpMatrix.elements);

    this.normalMatrix.setInverseOf(this.modelMatrix);
    this.normalMatrix.transpose();
    myGL.uniformMatrix4fv(this.u_NormMatLoc, false, this.normalMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, 				
  		    sph3Start/floatsPerVertex,	
  		    sphVerts.length/floatsPerVertex);
    

    // SPHERE 9
    this.modelMatrix.scale(0.2, 0.2, 0.2);
    this.modelMatrix.translate(0, 0, 12.5);
    this.modelMatrix.rotate(2*currentAngle, 0, 1, 0);
    this.mvpMatrix.set(this.projMatrix).multiply(this.viewMatrix).multiply(this.modelMatrix);
    myGL.uniformMatrix4fv(this.u_MvpMatLoc, false, this.mvpMatrix.elements);

    this.normalMatrix.setInverseOf(this.modelMatrix);
    this.normalMatrix.transpose();
    myGL.uniformMatrix4fv(this.u_NormMatLoc, false, this.normalMatrix.elements);
    myGL.drawArrays(myGL.TRIANGLE_STRIP, 				
  		    sph3Start/floatsPerVertex,	
  		    sphVerts.length/floatsPerVertex);
}
