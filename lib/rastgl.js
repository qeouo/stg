"use strict"
var Rastgl= (function(){
	var ret=function(){}
	var i;
	var OP_DOT=i=1
		,OP_LINE=++i
		,OP_LINES=++i
		,OP_TRIANGLES=++i
		,OP_POLYGON=++i
		,OP_POINT=++i
		,OP_LINELOOP=++i
		,RF_SHADE=1<<(i=0)
		,RF_SMOOTH=1<<(++i)
		,RF_TOON=1<<(++i)
		,RF_LINE=1<<(++i)
		,RF_TEXTURE=1<<(++i)
		,RF_OUTLINE=1<<(++i)
		,RF_ENVMAP=1<<(++i)
		,RF_DOUBLE_SIDED = 1<<(++i)
		,RF_DEPTHTEST = 1<<(++i)
		,RF_PERSCOLLECT = 1<<(++i)
		,RF_PHONGSHADING= 1<<(++i)

		,LT_DIRECTION=i=1
		,LT_AMBIENT=++i

	var bV0 = new Vec3()
	,bV1=new Vec3()
	,bV2=new Vec3()

var gl;
var calcLighting;
var calcSpc;
var posArray = new Float32Array(3*3);
var colorArray = new Float32Array(4*3);
var uvArray = new Float32Array(2*3);
var normalArray = new Float32Array(3*3);
var matT= new Float32Array(4*4);
var nowTexture=null;
var flg;

var uniSampler;
var uniEnvSampler;
var uniEnv;
var uniFlg;
var uniLight;
var uniAmb;
var uniPersW;
var uniPersH;
var uniNrmSampler;
var uniMatT;
var uniNrmMap;
var uniSpc;
var uniSpca;

var vertexshader=" \
attribute vec3 aPos; \
attribute vec4 aColor; \
attribute vec2 aUv; \
attribute vec3 aNormal; \
varying lowp vec4 vColor; \
varying highp vec2 vUv; \
varying lowp vec3 vNormal; \
varying lowp vec3 vEye; \
uniform lowp float uPersW; \
uniform lowp float uPersH; \
void main(void){ \
	gl_Position = vec4(-aPos.x*uPersW,aPos.y*uPersH,-1.0, aPos.z); \
	vColor = aColor; \
	vUv = aUv; \
	vNormal = aNormal; \
	vEye = aPos; \
} \
";
var fragmentshader=" \
varying lowp vec4 vColor; \
varying highp vec2 vUv; \
varying lowp vec3 vNormal; \
varying lowp vec3 vEye; \
uniform sampler2D uSampler; \
uniform int iFlg; \
uniform lowp vec3 uLight; \
uniform lowp float uAmb; \
uniform sampler2D uEnvSampler; \
uniform lowp float uEnv; \
uniform sampler2D uNrmSampler; \
uniform int  uNrmMap; \
uniform lowp mat4 uMatT; \
uniform lowp float uSpc; \
uniform lowp float uSpca; \
void main(void){ \
	lowp vec3 nrm = vNormal; \
	if(uNrmMap == 1){ \
		lowp vec3 nrmcol = (texture2D(uNrmSampler,vec2(vUv.s,vUv.t))*2.0 -1.0).rgb; \
		nrmcol.x=-nrmcol.x; \
		lowp vec3 nn= -cross(nrm,uMatT[2].xyz); \
		nrm = (uMatT * vec4(nrmcol,0)).xyz; \
		lowp float SIN=nn.x*nn.x+nn.y*nn.y+nn.z*nn.z; \
		if(SIN != 0.0){ \
			lowp float COS=sqrt(1.0-SIN); \
			lowp float COS1=1.0-COS; \
			SIN=sqrt(SIN); \
			nn=normalize(nn); \
			lowp mat3 m = mat3(1.0); \
			m[0][0] =nn.x*nn.x*COS1+COS;m[1][0]=nn.x*nn.y*COS1-nn.z*SIN;m[2][0]=nn.z*nn.x*COS1+nn.y*SIN; \
			m[0][1]=nn.x*nn.y*COS1+nn.z*SIN;m[1][1]=nn.y*nn.y*COS1+COS;m[2][1]=nn.y*nn.z*COS1-nn.x*SIN; \
			m[0][2]=nn.z*nn.x*COS1-nn.y*SIN;m[1][2]=nn.y*nn.z*COS1+nn.x*SIN;m[2][2]=nn.z*nn.z*COS1+COS; \
			nrm = m *nrm; \
		}  \
		nrm = normalize(nrm); \
	} \
	lowp float diffuse = clamp(-dot(nrm,uLight),0.0,1.0); \
	diffuse = clamp(diffuse + uAmb,0.0,1.0); \
	if(iFlg == 2 ){ \
		diffuse=1.0; \
	} \
	lowp vec4 vColor2 = vec4(vColor.xyz * diffuse,vColor.w); \
	if(iFlg==1){ \
		gl_FragColor = vColor2 * texture2D(uSampler,vec2(vUv.s,vUv.t)); \
	}else{ \
		gl_FragColor = vColor2; \
	} \
	lowp vec3 vE  = normalize(vEye); \
	if(uSpc >0.0){ \
		lowp float d1=-dot(uLight,nrm); \
		if(d1>0.0){ \
			lowp vec3 bv =nrm * (2.0 * d1); \
			bv = uLight + bv; \
			lowp float d =-dot(vE,bv); \
			if(d>0.0){ \
				d = pow(d,uSpca)*uSpc*d1; \
				gl_FragColor = gl_FragColor +vec4(d,d,d,0.0); \
			} \
		} \
	} \
	if(uEnv > 0.0){ \
		lowp vec3 ref = normalize(nrm) - vE * dot(vE,normalize(nrm)) ; \
		lowp vec2 uv = ref.xy * 0.5 + vec2(0.5,0.5); \
		gl_FragColor = gl_FragColor + uEnv * vec4(texture2D(uEnvSampler,uv).xyz,0); \
	} \
} \
";
var createShader = function(){
	var program = setShaderProgram(vertexshader,fragmentshader);
	gl.useProgram(program);

	posBuffer = createBuffer(program,"aPos",3,gl.FLOAT);
	colorBuffer = createBuffer(program,"aColor",4,gl.FLOAT);
	uvBuffer  = createBuffer(program,"aUv",2,gl.FLOAT);
	uvBuffer.itemSize=2;
	uvBuffer.numltems=3;
	normalBuffer = createBuffer(program,"aNormal",3,gl.FLOAT);
	//uniform
	uniNrmMap = gl.getUniformLocation(program,"uNrmMap");
	uniFlg = gl.getUniformLocation(program,"iFlg");
	uniSampler = gl.getUniformLocation(program,"uSampler");
	uniEnvSampler= gl.getUniformLocation(program,"uEnvSampler");
	uniEnv= gl.getUniformLocation(program,"uEnv");
	uniNrmSampler= gl.getUniformLocation(program,"uNrmSampler");
	uniAmb = gl.getUniformLocation(program,"uAmb");
	uniLight = gl.getUniformLocation(program,"uLight");
	uniPersW= gl.getUniformLocation(program,"uPersW");
	uniPersH= gl.getUniformLocation(program,"uPersH");
	uniMatT= gl.getUniformLocation(program,"uMatT");
	uniSpc= gl.getUniformLocation(program,"uSpc");
	uniSpca= gl.getUniformLocation(program,"uSpca");
}	

var colorBuffer =null; 
var posBuffer =null; 
var uvBuffer=null; 
var normal= new Float32Array(3*3);
var normalBuffer=null; 

ret.drawMethod =  function(ono3d,renderFace,drawMethod){
	var vertices=renderFace.vertices
	,lightSources
	,uv
	,u0,v0,u1,v1,u2,v2
	,normal=renderFace.normal
	,pos=renderFace.pos
	,nx,ny,nz
	,smoothing=renderFace.smoothing
	,shading=renderFace.rf & RF_SHADE
	,light=renderFace.light
	,r=renderFace.r
	,g=renderFace.g
	,b=renderFace.b
	,a=renderFace.a
	,vnormal0,vnormal1,vnormal2
	,ior
	,rf = renderFace.rf
	,spc=renderFace.spc
	,spchard=renderFace.spchard
	
	,vtx0=vertices[0]
	,vtx1=vertices[1]
	,vtx2=vertices[2]
	if(renderFace.operator != OP_TRIANGLES){
		vtx2=vertices[1];
	}
	var 
	p0=vtx0.pos
	,p1=vtx1.pos
	,p2=vtx2.pos
	,texture=renderFace.texture
	,uv=renderFace.uv
	,lightSources=ono3d.lightSources
	,normalmap=renderFace.normalmap


	posArray[0]=p0[0];
	posArray[1]=p0[1];
	posArray[2]=p0[2];
	posArray[3]=p1[0];
	posArray[4]=p1[1];
	posArray[5]=p1[2];
	posArray[6]=p2[0];
	posArray[7]=p2[1];
	posArray[8]=p2[2];
	flg=0;
	
	Vec3.copy(bV0,vtx0.normal)
	Vec3.copy(bV1,vtx1.normal)
	Vec3.copy(bV2,vtx2.normal)

	vnormal0=bV0
	vnormal1=bV1
	vnormal2=bV2
	if(smoothing==0){
		vnormal0= normal
		vnormal1= vnormal0
		vnormal2= vnormal0
	}else{
		nx=normal[0]*(1-smoothing)
		ny=normal[1]*(1-smoothing)
		nz=normal[2]*(1-smoothing)
		vnormal0[0]= nx+vnormal0[0]* smoothing
		vnormal0[1]= ny+vnormal0[1]* smoothing
		vnormal0[2]= nz+vnormal0[2]* smoothing
		vnormal1[0]= nx+vnormal1[0]* smoothing
		vnormal1[1]= ny+vnormal1[1]* smoothing
		vnormal1[2]= nz+vnormal1[2]* smoothing
		vnormal2[0]= nx+vnormal2[0]* smoothing
		vnormal2[1]= ny+vnormal2[1]* smoothing
		vnormal2[2]= nz+vnormal2[2]* smoothing
		Vec3.norm(vnormal0)
		Vec3.norm(vnormal1)
		Vec3.norm(vnormal2)
	}
	if(texture){
		r=1,g=1,b=1;
		texture=texture.gltexture;
	}
	normalArray[0]=vnormal0[0];
	normalArray[1]=vnormal0[1];
	normalArray[2]=vnormal0[2];
	normalArray[3]=vnormal1[0];
	normalArray[4]=vnormal1[1];
	normalArray[5]=vnormal1[2];
	normalArray[6]=vnormal2[0];
	normalArray[7]=vnormal2[1];
	normalArray[8]=vnormal2[2];
	colorArray[0]=r;
	colorArray[1]=g;
	colorArray[2]=b;
	colorArray[3]=a;
	colorArray[4]=r;
	colorArray[5]=g;
	colorArray[6]=b;
	colorArray[7]=a;
	colorArray[8]=r;
	colorArray[9]=g;
	colorArray[10]=b;
	colorArray[11]=a;
	if(shading){
	}else{
		flg |=2;
	}
	if(texture){
			uvArray[0]=uv[0][0];
			uvArray[1]=uv[0][1];
			uvArray[2]=uv[1][0];
			uvArray[3]=uv[1][1];
			uvArray[4]=uv[2][0];
			uvArray[5]=uv[2][1];

			gl.uniform1i(uniFlg,1);
			if(nowTexture != texture){
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D,texture);
				gl.uniform1i(uniSampler,0);
				nowTexture = texture;
			}
		flg=1;
	}else{
	}

	if(normalmap){
		uv=renderFace.uv
		uvArray[0]=uv[0][0];
		uvArray[1]=uv[0][1];
		uvArray[2]=uv[1][0];
		uvArray[3]=uv[1][1];
		uvArray[4]=uv[2][0];
		uvArray[5]=uv[2][1];

		setNormalMap(p0,p1,p2,uv[0][0],uv[0][1],uv[1][0],uv[1][1],uv[2][0],uv[2][1]);
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D,normalmap.gltexture);

		gl.uniform1i(uniNrmSampler,2);
		gl.uniform1i(uniNrmMap,1);
	}else{
		gl.uniform1i(uniNrmMap,0);
	}
	gl.uniform1f(uniSpc,renderFace.spc);
	gl.uniform1f(uniSpca,renderFace.spchard);
	gl.uniform1f(uniEnv,renderFace.mrr);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, posArray, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, colorArray, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, uvArray, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, normalArray, gl.STATIC_DRAW);
  	gl.uniform1i(uniFlg,flg);
	if(renderFace.operator == OP_TRIANGLES){
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}else{
		gl.drawArrays(gl.LINES, 0, 2);
	}
//	while(shading && spc){
//		smoothing=renderFace.smoothing
//
//		if(smoothing){
//			setColor(1,1,1,calcSpc(vnormal0,vtx0.angle,spchard,lightSources)*spc
//					,1,1,1,calcSpc(vnormal1,vtx1.angle,spchard,lightSources)*spc
//					,1,1,1,calcSpc(vnormal2,vtx2.angle,spchard,lightSources)*spc);
//		}
//		if(!smoothing){
//			light = calcSpc(normal,renderFace.angle,spchard,lightSources)*spc;
//			setColor(1,1,1,light
//					,1,1,1,light
//					,1,1,1,light);
//			
//		}
//		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
//		gl.bufferData(gl.ARRAY_BUFFER, colorArray, gl.STATIC_DRAW);
// 		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
//  		gl.uniform1i(uniFlg,2);
//		if(renderFace.operator == OP_TRIANGLES){
//			gl.drawArrays(gl.TRIANGLES, 0, 3);
//		}else{
//			gl.drawArrays(gl.LINES, 0, 2);
//		}
//		break
//	}
}

var ttt=false;
var NUVec=new Vec3()
	,NVVec=new Vec3()
		,NTVec=new Vec3()
var setNormalMap = function(p0,p1,p2,u0,v0,u1,v1,u2,v2){
	var du1=u1-u0
	var dv1=v1-v0
	var du2=u2-u0
	var dv2=v2-v0
	var dx1=p1[0]-p0[0]
	var dy1=p1[1]-p0[1]
	var dz1=p1[2]-p0[2]
	var dx2=p2[0]-p0[0]
	var dy2=p2[1]-p0[1]
	var dz2=p2[2]-p0[2]

	var d=1/(du1*dv2-du2*dv1)
	NUVec[0]=(dv1*dx2-dv2*dx1)
	NUVec[1]=(dv1*dy2-dv2*dy1)
	NUVec[2]=(dv1*dz2-dv2*dz1)
	NVVec[0]=(du1*dx2-du2*dx1)
	NVVec[1]=(du1*dy2-du2*dy1)
	NVVec[2]=(du1*dz2-du2*dz1)
	d=1/Math.sqrt(NVVec[0]*NVVec[0]
	+NVVec[1]*NVVec[1]
	+NVVec[2]*NVVec[2])
	NVVec[0]*=d
	NVVec[1]*=d
	NVVec[2]*=d
	d=1/Math.sqrt(NUVec[0]*NUVec[0]
	+NUVec[1]*NUVec[1]
	+NUVec[2]*NUVec[2])
	NUVec[0]*=d
	NUVec[1]*=d
	NUVec[2]*=d
		
	Vec3.cross(NTVec,NUVec,NVVec);
	d=1/Math.sqrt(NTVec[0]*NTVec[0]
	+NTVec[1]*NTVec[1]
	+NTVec[2]*NTVec[2])
	NTVec[0]*=d
	NTVec[1]*=d
	NTVec[2]*=d

	matT[0]=NUVec[0]
	matT[1]=NUVec[1]
	matT[2]=NUVec[2]
	matT[3]=0;
	matT[4]=NVVec[0]
	matT[5]=NVVec[1]
	matT[6]=NVVec[2]
	matT[7]=0
	matT[8]=NTVec[0]
	matT[9]=NTVec[1]
	matT[10]=NTVec[2]
	matT[11]=0
	matT[12]=0
	matT[13]=0
	matT[14]=0
	matT[11]=1
	gl.uniformMatrix4fv(uniMatT,0,matT);
	gl.uniform1i(uniNrmMap,1);
}
var setShaderProgram = function(vs,fs){
  // Vertex shader
  var vshader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vshader, vs);
  gl.compileShader(vshader);
  if(!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)){
    alert(gl.getShaderInfoLog(vshader));
    return null;
  }

  // Fragment shader
  var fshader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fshader, fs);
  gl.compileShader(fshader);
  if(!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)){
    alert(gl.getShaderInfoLog(fshader));
    return null;
  }
  // Create shader program
  var program = gl.createProgram();
  gl.attachShader(program, vshader);
  gl.attachShader(program, fshader);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    alert(gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}
var createBuffer=function(program,attName,size,type){
  var att = gl.getAttribLocation(program,attName); 
  var buffer = gl.createBuffer();
  gl.enableVertexAttribArray(att);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(att , size, type, false, 0, 0);
  return buffer;
}

ret.set=function(ono3d){
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER);
	var lightSources=ono3d.lightSources
	var amb=0;

	for(var i=0;i<lightSources.length;i++){
		var lightSource = lightSources[i]
		if(lightSource.type ==LT_DIRECTION){
			gl.uniform3fv(uniLight,new Float32Array(lightSource.viewAngle));
		}else if(lightSource.type == LT_AMBIENT){
			amb=lightSource.power;
		}
	}
	gl.uniform1f(uniAmb,amb);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D,ono3d.envTexture.gltexture);
	gl.uniform1i(uniEnvSampler,1);
}
var pixels = new Uint8Array(4);
ret.flush=function(){
	gl.flush();
	gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
}
ret.setPers=function(w,h){
	gl.uniform1f(uniPersW,w);
	gl.uniform1f(uniPersH,h);
}
ret.setTexture= function(image){
	var neheTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, neheTexture);
	//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return neheTexture;
}

ret.init=function(canvas){

	gl = null;
	try{
		gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
		if(gl){

			createShader();

			gl.clearColor(0.0, 0.0, 0.0, 0.0);
			gl.clearDepth(1.0);
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER);
			gl.enable(gl.CULL_FACE);

			calcLighting=Ono3d.calcLighting;
			calcSpc=Ono3d.calcSpc;
		}else{
			return true;
		}
	}
	catch(e){
		return true;
	}
	return false;

}

	return ret;
})();
