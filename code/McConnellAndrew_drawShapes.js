function fillVerticesArray() {
    makeStar();
    makeSphere();
    makeSphere2();
    makeSphere3();
    makeAxes();
    makeGroundGrid();
    
    mySiz = 3.0*sphVerts.length + starVerts.length + gndVerts.length + axesVerts.length;
    
    // How many vertices total?
    var nn = mySiz / floatsPerVertex;
    console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
    
    // Copy all shapes into one big Float32 array:
    var verticesColors = new Float32Array(mySiz);
    star1Start = 0;							// we store the forest first.
    for(i=0,j=0; j< starVerts.length; i++,j++) {
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
    sphStart = i;
    for(j=0; j < sphVerts.length; i++, j++){
	verticesColors[i] = sphVerts[j];
    }
    sph2Start = i;
    for(j=0; j < sphVerts.length; i++, j++){
	verticesColors[i] = sphVerts2[j];
    }
    sph3Start = i;
    for(j=0; j < sphVerts.length; i++, j++){
	verticesColors[i] = sphVerts3[j];
    }
    return verticesColors;
}

function arraySize() {
    return (3.0*sphVerts.length + starVerts.length + gndVerts.length + axesVerts.length)/floatsPerVertex;
}

function makeGroundGrid() {
    var xcount = 100;			// # of lines to draw in x,y to make the grid.
    var ycount = 100;		
    var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
    var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
    var yColr = new Float32Array([0.5, 1.0, 0.5]);	// bright green.
    var Norm = new Float32Array([0.0, 0.0, 1.0]);
    gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
    var xgap = xymax/(xcount-1);		
    var ygap = xymax/(ycount-1);		
    for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) { // YELLOW LINES
	if(v%2==0) {
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

function makeAxes() {
    axesVerts = new Float32Array([
	0.0,  0.0,  0.0,		1.0,  0.0,  0.0,     0.0, 0.0, 0.0,	// X AXIS RED
	1.0,  0.0,  0.0,		1.0,  0.0,  0.0,     1.0, 0.0, 0.0,	 						 
	0.0,  0.0,  0.0,                0.0,  1.0,  0.0,     0.0, 0.0, 0.0,	// Y AXIS GREEN
	0.0,  1.0,  0.0,		0.0,  1.0,  0.0,     0.0, 1.0, 0.0,						
	0.0,  0.0,  0.0,		0.0,  0.0,  1.0,     0.0, 0.0, 0.0,	// Z AXIS BLUE
	0.0,  0.0,  1.0,		0.0,  0.0,  1.0,     0.0, 0.0, 1.0,	
    ]);
}

function makeStar() {
    var frontNorm = new Float32Array([0.0, 0.0, 1.0]);
    var backNorm = new Float32Array([0.0, 0.0, -1.0]);
    starVerts = new Float32Array([
	0.0,  0.7, 0.0,  	  1.0, 0.0, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	0.0,  0.0, 0.3, 	  1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
       -0.2,  0.2, 0.0, 	  0.5, 0.5, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	
       -0.2,  0.2, 0.0,  	  0.5, 0.5, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],// 1 10 2
	0.0,  0.0, 0.3,           1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
       -0.7,  0.2, 0.0, 	  0.0, 1.0, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],
		
       -0.7,  0.2, 0.0,  	  0.0, 1.0, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],// 2 10 3
	0.0,  0.0, 0.3,           1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
       -0.3,  0.0, 0.0, 	  0.0, 0.5, 0.5,     frontNorm[0], frontNorm[1], frontNorm[2],

       -0.3,  0.0, 0.0,  	  0.0, 0.5, 0.5,     frontNorm[0], frontNorm[1], frontNorm[2],// 3 10 4
        0.0,  0.0, 0.3,           1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
       -0.5, -0.5, 0.0,  	  0.0, 0.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	
       -0.5, -0.5, 0.0, 	  0.0, 0.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2], // 4 10 5
	0.0,  0.0, 0.3,           1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	0.0, -0.2, 0.0, 	  0.5, 0.0, 0.5,     frontNorm[0], frontNorm[1], frontNorm[2],

	0.0, -0.2, 0.0, 	  0.5, 0.0, 0.5,     frontNorm[0], frontNorm[1], frontNorm[2], // 5 10 6
	0.0,  0.0, 0.3,           1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	0.5, -0.5, 0.0, 	  1.0, 0.0, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],

	0.5, -0.5, 0.0,  	  1.0, 0.0, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],// 6 10 7
	0.0,  0.0, 0.3,           1.0, 1.0, 1.0,    frontNorm[0], frontNorm[1], frontNorm[2],
	0.3,  0.0, 0.0, 	  0.5, 0.5, 0.0,    frontNorm[0], frontNorm[1], frontNorm[2],

	0.3,  0.0, 0.0,  	  0.0, 1.0, 0.0,     frontNorm[0], frontNorm[1], frontNorm[2],// 7 10 8
	0.0,  0.0, 0.3,           1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	0.7,  0.2, 0.0, 	  0.0, 0.5, 0.5,     frontNorm[0], frontNorm[1], frontNorm[2],

	0.7,  0.2, 0.0, 	  0.0, 0.5, 0.5,    frontNorm[0], frontNorm[1], frontNorm[2], // 8 10 9
	0.0,  0.0, 0.3,           1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	0.2,  0.2, 0.0, 	  0.0, 0.0, 1.0,    frontNorm[0], frontNorm[1], frontNorm[2],
	
	0.2,  0.2, 0.0,  	  0.0, 0.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2], // 9 10 0
	0.0,  0.0, 0.3,           1.0, 1.0, 1.0,     frontNorm[0], frontNorm[1], frontNorm[2],
	0.0,  0.7, 0.0,  	  0.5, 0.0, 0.5,    frontNorm[0], frontNorm[1], frontNorm[2],

//--------------BACK HALF
	
	0.0,  0.7, 0.0,  	  1.0, 0.0, 0.0,     backNorm[0], backNorm[1], backNorm[2], // 0 11 1
	0.0,  0.0,-0.3,	          1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
       -0.2,  0.2, 0.0,	          0.5, 0.5, 0.0,     backNorm[0], backNorm[1], backNorm[2],
	
       -0.2,  0.2, 0.0, 	  0.5, 0.5, 0.0,     backNorm[0], backNorm[1], backNorm[2],// 1 11 2
	0.0,  0.0,-0.3,           1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
       -0.7,  0.2, 0.0, 	  0.0, 1.0, 0.0,     backNorm[0], backNorm[1], backNorm[2],
		
       -0.7,  0.2, 0.0, 	  0.0, 1.0, 0.0,     backNorm[0], backNorm[1], backNorm[2],// 2 11 3
	0.0,  0.0,-0.3,           1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
       -0.3,  0.0, 0.0,	          0.0, 0.5, 0.5,     backNorm[0], backNorm[1], backNorm[2],

       -0.3,  0.0, 0.0, 	  0.0, 0.5, 0.5,     backNorm[0], backNorm[1], backNorm[2],// 3 11 4
        0.0,  0.0,-0.3,           1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
       -0.5, -0.5, 0.0, 	  0.0, 0.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	
       -0.5, -0.5, 0.0, 	  0.0, 0.0, 1.0,     backNorm[0], backNorm[1], backNorm[2], // 4 11 5
	0.0,  0.0,-0.3,           1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	0.0, -0.2, 0.0, 	  0.5, 0.0, 0.5,     backNorm[0], backNorm[1], backNorm[2],

	0.0, -0.2, 0.0, 	  0.5, 0.0, 0.5,     backNorm[0], backNorm[1], backNorm[2], // 5 11 6
	0.0,  0.0,-0.3,           1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	0.5, -0.5, 0.0, 	  1.0, 0.0, 0.0,     backNorm[0], backNorm[1], backNorm[2],

	0.5, -0.5, 0.0,  	  1.0, 0.0, 0.0,     backNorm[0], backNorm[1], backNorm[2],// 6 11 7
	0.0,  0.0,-0.3,           1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	0.3,  0.0, 0.0, 	  0.5, 0.5, 0.0,     backNorm[0], backNorm[1], backNorm[2],

	0.3,  0.0, 0.0,  	  0.0, 1.0, 0.0,     backNorm[0], backNorm[1], backNorm[2],// 7 11 8
	0.0,  0.0,-0.3,           1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	0.7,  0.2, 0.0, 	  0.0, 0.5, 0.5,     backNorm[0], backNorm[1], backNorm[2],

	0.7,  0.2, 0.0, 	  0.0, 0.5, 0.5,     backNorm[0], backNorm[1], backNorm[2], // 8 11 9
	0.0,  0.0,-0.3,           1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	0.2,  0.2, 0.0,	          0.0, 0.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	
	0.2,  0.2, 0.0,  	  0.0, 0.0, 1.0,     backNorm[0], backNorm[1], backNorm[2], // 9 11 0
	0.0,  0.0,-0.3,           1.0, 1.0, 1.0,     backNorm[0], backNorm[1], backNorm[2],
	0.0,  0.7, 0.0,  	  0.5, 0.0, 0.5,     backNorm[0], backNorm[1], backNorm[2],
    ]);
}

function makeSphere() {
    var slices = 49;		
    var sliceVerts	= 27;
    var matSet = new Float32Array([0.0, 1.0, 2.0]);
    var sliceAngle = Math.PI/slices;	
    sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
    var cos0 = 0.0;				
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;	
    var j = 0;						
    var isLast = 0;
    var isFirst = 1;
    for(s=0; s<slices; s++) {
	if(s==0) {
	    isFirst = 1;	
	    cos0 = 1.0; 
	    sin0 = 0.0;
	}
	else {					
	    isFirst = 0;	
	    cos0 = cos1;
	    sin0 = sin1;
	}								
	cos1 = Math.cos((s+1)*sliceAngle);
	sin1 = Math.sin((s+1)*sliceAngle);
	if(s==slices-1) isLast=1;	
	for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {	
	    if(v%2==0)
	    {				 
		sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); sphVerts[j+6] = sphVerts[j];	
		sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts); sphVerts[j+7] = sphVerts[j+1];	
		sphVerts[j+2] = cos0;	                                 sphVerts[j+8] = sphVerts[j+2];		
	    }
	    else { 	
		sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);	sphVerts[j+6] = sphVerts[j];	// x
		sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);	sphVerts[j+7] = sphVerts[j+1];	// y
		sphVerts[j+2] = cos1;						sphVerts[j+8] = sphVerts[j+2];	
	    }
	    if(s==0) {
		sphVerts[j+3]=matSet[0]; 
		sphVerts[j+4]=matSet[1]; 
		sphVerts[j+5]=matSet[2];	
	    }
	    else if(s==slices-1) {
		sphVerts[j+3]=matSet[0]; 
		sphVerts[j+4]=matSet[1]; 
		sphVerts[j+5]=matSet[2];	
	    }
	    else {
		sphVerts[j+3]=matSet[0];
		sphVerts[j+4]=matSet[1];
		sphVerts[j+5]=matSet[2];				
	    }
	}
    }
}

function makeSphere2() {
    var slices = 49;		
    var sliceVerts	= 27;	
    var matSet = new Float32Array([1.0, 1.0, 2.0]);
    var sliceAngle = Math.PI/slices;	
    sphVerts2 = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
    var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;	
    var j = 0;							// initialize our array index
    var isLast = 0;
    var isFirst = 1;
    for(s=0; s<slices; s++) {	// for each slice of the sphere,
	// find sines & cosines for top and bottom of this slice
	if(s==0) {
	    isFirst = 1;	// skip 1st vertex of 1st slice.
	    cos0 = 1.0; 	// initialize: start at north pole.
	    sin0 = 0.0;
	}
	else {					// otherwise, new top edge == old bottom edge
	    isFirst = 0;	
	    cos0 = cos1;
	    sin0 = sin1;
	}								// & compute sine,cosine for new bottom edge.
	cos1 = Math.cos((s+1)*sliceAngle);
	sin1 = Math.sin((s+1)*sliceAngle);
	if(s==slices-1) isLast=1;	// skip last vertex of last slice.
	for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {	
	    if(v%2==0)
	    {				 
		sphVerts2[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); sphVerts2[j+6] = sphVerts2[j];	
		sphVerts2[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts); sphVerts2[j+7] = sphVerts2[j+1];	
		sphVerts2[j+2] = cos0;	                                 sphVerts2[j+8] = sphVerts2[j+2];		
	    }
	    else { 	
		sphVerts2[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);	sphVerts2[j+6] = sphVerts2[j];	// x
		sphVerts2[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);	sphVerts2[j+7] = sphVerts2[j+1];	// y
		sphVerts2[j+2] = cos1;						sphVerts2[j+8] = sphVerts2[j+2];	
	    }
	    if(s==0) {	// finally, set some interesting colors for vertices:
		sphVerts2[j+3]=matSet[0]; 
		sphVerts2[j+4]=matSet[1]; 
		sphVerts2[j+5]=matSet[2];	
	    }
	    else if(s==slices-1) {
		sphVerts2[j+3]=matSet[0]; 
		sphVerts2[j+4]=matSet[1]; 
		sphVerts2[j+5]=matSet[2];	
	    }
	    else {
		sphVerts2[j+3]=matSet[0];// equColr[0]; 
		sphVerts2[j+4]=matSet[1];// equColr[1]; 
		sphVerts2[j+5]=matSet[2];// equColr[2];					
	    }
	}
    }
}

function makeSphere3() {
    var slices = 49;		
    var sliceVerts	= 27;	// # of vertices around the top edge of the slice
    // (same number of vertices on bottom of slice, too)
    var matSet = new Float32Array([2.0, 1.0, 2.0]);
    var sliceAngle = Math.PI/slices;	
    sphVerts3 = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
    var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;	
    var j = 0;							// initialize our array index
    var isLast = 0;
    var isFirst = 1;
    for(s=0; s<slices; s++) {	// for each slice of the sphere,
	// find sines & cosines for top and bottom of this slice
	if(s==0) {
	    isFirst = 1;	// skip 1st vertex of 1st slice.
	    cos0 = 1.0; 	// initialize: start at north pole.
	    sin0 = 0.0;
	}
	else {					// otherwise, new top edge == old bottom edge
	    isFirst = 0;	
	    cos0 = cos1;
	    sin0 = sin1;
	}								// & compute sine,cosine for new bottom edge.
	cos1 = Math.cos((s+1)*sliceAngle);
	sin1 = Math.sin((s+1)*sliceAngle);
	if(s==slices-1) isLast=1;	// skip last vertex of last slice.
	for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {	
	    if(v%2==0)
	    {				 
		sphVerts3[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); sphVerts3[j+6] = sphVerts3[j];	
		sphVerts3[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts); sphVerts3[j+7] = sphVerts3[j+1];	
		sphVerts3[j+2] = cos0;	                                 sphVerts3[j+8] = sphVerts3[j+2];		
	    }
	    else { 	
		sphVerts3[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);	sphVerts3[j+6] = sphVerts3[j];	// x
		sphVerts3[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);	sphVerts3[j+7] = sphVerts3[j+1];	// y
		sphVerts3[j+2] = cos1;						sphVerts3[j+8] = sphVerts3[j+2];	
	    }
	    if(s==0) {	// finally, set some interesting colors for vertices:
		sphVerts3[j+3]=matSet[0]; 
		sphVerts3[j+4]=matSet[1]; 
		sphVerts3[j+5]=matSet[2];	
	    }
	    else if(s==slices-1) {
		sphVerts3[j+3]=matSet[0]; 
		sphVerts3[j+4]=matSet[1]; 
		sphVerts3[j+5]=matSet[2];	
	    }
	    else {
		sphVerts3[j+3]=matSet[0];// equColr[0]; 
		sphVerts3[j+4]=matSet[1];// equColr[1]; 
		sphVerts3[j+5]=matSet[2];// equColr[2];					
	    }
	}
    }
}

