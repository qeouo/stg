"use strict"
var Main=(function(){
var 
	objman
	,ono3d
	,obj3d
	,envtex
	,imagedata
	,camerap=new Vec3()
	,cameraa=new Vec3()
	,bure=0
	,burep=new Vec3()
	,medalCount
	,medalLevel
	,font
	,zanki=1
	,sisa=0;
	;

var score=0;
var seBomb=document.createElement("audio");
//seBomb.src="./data/bomb.wav";
var seBullet=document.createElement("audio");
//seBullet.src="./data/bullet.wav";
var bgm=document.createElement("audio");
//bgm.src="./data/stage.mp3";
var scoreboard="";
var elemScore=null;
var scrollSpeed=-4;
var ret=function(){}
var rnd=Math.random;
var rnd2=function(){ return rnd()*2-1; }

var frame = 0
var viewscale=1
var light1;
var bufvec=new Vec3();

var model;
var fugo=function(v){
	if(v<0)return -1;
	return 1;
}
var playSound=function(s){
	//s.currentTime=0;
	//s.play();
//	if (navigator.userAgent.match(/iPhone/i)
//		||navigator.userAgent.match(/iPod/i) ){
//		return;
//	}
//	s.load();
//	s.addEventListener("canplay",function(e){
//		s.play();
//	},false);
}
var setParent=function(child,parent){
	child.parent=parent;
	child.parentid=parent.id;
}
var argb=function(a,r,g,b){
	return (a<<24) + (r<<16) + (g<<8) + b;
}
var argbz=function(a,r,g,b,z){
	if(z>50){
		z=50
	}
	if(z<-50){
		z=-50
	}
	a=0x7f;
	if(z<0){
		a*=(50+z)/50;
		if(a<0)a=0x0;
	}

	if(z>0){
		r*=(50-z)/50;
		g*=(50-z)/50;
		b*=(50-z)/50;
	}
	return (a<<24) + (r<<16) + (g<<8) + (b<<0);
}
var nerai=function(v){
	return Math.atan2(pJiki.p[1]-v[1],pJiki.p[0]-v[0])/Math.PI*2048|0;
}
var randvec=function(v,ang){ 
	if(v[1]*v[1]>=1){
		Vec3.set(tVec,0,0,1); 
	}else{
		var a=Math.sqrt(v[0]*v[2]*2);
		Vec3.set(tVec,-v[2],0,v[0]);
		Vec3.normalize(tVec);
	}
	Vec3.cross(sVec,v,tVec);
	var nr =(rnd())*ang;
	nr=Math.cos(nr);
	var u=Math.sqrt(1-nr*nr);
	var rr =rnd()*Math.PI*2.0; 
	Vec3.mult(v,v,nr);
	Vec3.mult(tVec,tVec,Math.sin(rr)*u);
	Vec3.mult(sVec,sVec,Math.cos(rr)*u);
	Vec3.add(v,v,tVec);
	Vec3.add(v,v,sVec);
} 

var drawText=function(str){
	var len=str.length;
	ono3d.push();
	for(var i=0;i<len;i++){
		ono3d.translate(-2,0,0);
		drawFont(str.charCodeAt(i)-0x20);
	}
	ono3d.pop();
}
var drawFont=function(n){
	var s=8/128;
	var x=(n%16)*s+0.3/128;
	var y=(n>>4)*s+0.3/128;
	s-=0.6/128;
	ono3d.color=0x7fffffff;
	ono3d.rf|=Ono3d.RF_TEXTURE;
	ono3d.texture=font;
	ono3d.begin(Ono3d.OP_TRIANGLES)
	ono3d.setUv(x,y);
	ono3d.setVertex(1,1,0);
	ono3d.setUv(x,y+s);
	ono3d.setVertex(1,-1,0);
	ono3d.setUv(x+s,y);
	ono3d.setVertex(-1,1,0);

	ono3d.setUv(x+s,y);
	ono3d.setVertex(-1,1,0);
	ono3d.setUv(x,y+s);
	ono3d.setVertex(1,-1,0);
	ono3d.setUv(x+s,y+s);
	ono3d.setVertex(-1,-1,0);
	ono3d.end();
}
var drawRect=function(){
	ono3d.texture=null;
	ono3d.begin(Ono3d.OP_TRIANGLES)
	ono3d.setVertex(1,1,0);
	ono3d.setVertex(1,-1,0);
	ono3d.setVertex(-1,1,0);

	ono3d.setVertex(-1,1,0);
	ono3d.setVertex(1,-1,0);
	ono3d.setVertex(-1,-1,0);
	ono3d.end();
}
var defObj=function(o,m,p){
	switch(m){
	case Objman.CREATE:
		break;
	case Objman.MOVE:
		Vec3.add(o.p,o.p,o.v);
		o.zz=o.z+o.id*0.0001;
		break;
	case Objman.HIT:
		o.hp--;
		break;
	case Objman.DESTROYED:
		break;
	case Objman.SETHITAREA:
		if(o.hitarea[3]>0){
			if(o.gflg){
				ono3d.loadIdentity();
				ono3d.translate(-camerap[0],-camerap[1],-camerap[2]);
				ono3d.rotate(-cameraa[1],0,1,0);
				ono3d.rotate(-cameraa[0],1,0,0);
				Mat43.dotMat43Vec3(o.hitarea,ono3d.transMat,o.p)
				o.hitarea[0] = o.hitarea[0]*(75/o.hitarea[2]);
				o.hitarea[1] = o.hitarea[1]*(75/o.hitarea[2]);
				o.hitarea[2] = 75;
				Vec3.add(o.hitarea,o.hitarea,camerap);
			}else{
				o.hitarea[0]=o.p[0]
				o.hitarea[1]=o.p[1]
				o.hitarea[2]=o.p[2]
			}
		}
		break;
	case Objman.DRAW:
//		ono3d.pop();
//		ono3d.push();
//
//
//		ono3d.translate(o.hitarea[0],o.hitarea[1],o.hitarea[2]-0.1);
//		ono3d.scale(o.hitarea[3],o.hitarea[3],1);
//		ono3d.color=0x7fff0000;
//		drawRect();
//		ono3d.pop();
//		ono3d.push();
		break;
	};
};
var oMedal = function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.z=+4;
		o.hitarea[3]=3;
		o.hp=medalLevel+1;
		o.kind=Objman.T_BULLET;
		o.hitarea[3]=o.hp+3;
		break;
	case Objman.MOVE:
		if(o.t==1){
			o.v[1]=1;
			o.v[0]=-o.p[0]*0.002;
		}
		if(o.v[1]>-1){
			o.v[1]-=0.04;
		}
		o.v[0]*=0.9;
		if(o.p[1]<-100){
			objman.deleteObj(o);
			medalLevel=0;
		}
		break;
	case Objman.HIT:
		if(medalLevel<4){
			medalLevel++;
		}
		score+=(1<<(o.hp-1))*100
		o.hp=0;
		break;
	case Objman.DRAW:
		ono3d.push();
		ono3d.translate(o.p[0],o.p[1],o.p[2]+o.z);
		ono3d.color=0x7fcccc00;
		ono3d.scale(2+o.hp,3+o.hp,1);
		ono3d.rotate(o.t*0.1,0,1,0);
		drawRect();
		ono3d.rotate(Math.PI,0,1,0);
		drawRect();
		ono3d.pop();
		var str=""+(1<<(o.hp-1))*100
		ono3d.color=0x7fffffff
		ono3d.translate(o.p[0],o.p[1],o.p[2]+o.z-2);
		ono3d.scale(2,2,1);
		ono3d.translate(str.length,0,1);
		drawText(str);

	}
	return defObj(o,m,p);
};
var oFlashJiki= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.z=-1;
		break;
	case Objman.MOVE:
		if(o.t>40){
			objman.deleteObj(o);
		}
		break;
	case Objman.DRAW:
		ono3d.translate(o.p[0],o.p[1],o.p[2]+o.z);
		ono3d.color=0x7fff0000;
		var s=1;
		if(o.t<=10){
			s=o.t
		}else{
			s=4*1/(o.t-10)
		}
		ono3d.scale(o.t,s,1);
		drawRect();
	}
	return defObj(o,m,p);
};
var oFlash= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.z=-0.01;
		break;
	case Objman.MOVE:
		if(o.t>8){
			objman.deleteObj(o);
		}
		break;
	case Objman.DRAW:
		ono3d.translate(o.p[0],o.p[1],o.p[2]+o.z);
		ono3d.color=0x7fffffff;
		var s=8.1-o.t;
		ono3d.scale(s,s,s);
		drawRect();
	}
	return defObj(o,m,p);
};
var oFlash2= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.gflg=1;
		break;
	case Objman.DRAW:
		ono3d.translate(o.p[0],o.p[1],o.p[2]);
		ono3d.color=0x7fffffff;
		var s=(8.1-o.t)*2;
		ono3d.scale(s,s,s);
		drawRect();
		return defObj(o,m,p);
	}
	return oFlash(o,m,p);
};
var oShogeki= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hitarea[3]=0;
		o.kind=Objman.T_BULLET;
		o.z=0.0;
		o.size=10;
		break;
	case Objman.MOVE:
		if(o.t>=10){
			objman.deleteObj(o);
		}
		o.hitarea[3]+=(o.size-o.hitarea[3])*0.5;
		break;
	case Objman.DRAW:
		ono3d.translate(o.p[0],o.p[1],o.p[2]);
		ono3d.color= argb(0x7f,0xff,0xff,0xff);
		ono3d.scale(o.hitarea[3],o.hitarea[3],1);
		drawRect();
	}
	return defObj(o,m,p);

}
var oCannon= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hitarea[3]=0;
		o.kind=Objman.T_NONE;
		o.z=0.0;
		break;
	case Objman.MOVE:
		if(o.t==1){
			createBullet(oFlash2,o.p,0,0);
		}
		if(o.p[2]<=0){
			createBullet(oShogeki,o.p,0,0);
			objman.deleteObj(o);
		}
		o.v[2]=(o.p2[2]-o.p[2])*0.05;
		break;
	case Objman.DRAW:
		ono3d.translate(o.p[0],o.p[1],o.p[2]);
		var s=(o.t&7)*0.5*0.33;
		ono3d.color= argb(0x7f,0xff,0xff*s,0);
		ono3d.scale(3,3,1);
		drawRect();
		ono3d.color= argb(0x7f,0x9f,0,0);
		ono3d.translate(0,0,0.01);
		ono3d.scale(1.1,1.1,1);
		drawRect();
	}
	return defObj(o,m,p);

}
var oBullet3D= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hitarea[3]=0;
		o.kind=Objman.T_NONE;
		o.z=0;
		break;
	case Objman.MOVE:
		if(Vec3.len(o.p)>100){
			objman.deleteObj(o);
		}
		if(o.ptn==0){
			if(o.t<8){
				o.ptn=1;
				o.t=0;
				playSound(seBullet);
			}
			Vec3.sub(o.p,o.p,o.v);
		}
		if((o.v[2]+o.p[2])*o.p[2]<0){
			var obj= createBullet(oShogeki,o.p,0,0);
			obj.size=4;
		}
			
		break;
	case Objman.DRAW:
		if(o.ptn==0){
			return;
		}
		ono3d.translate(o.p[0],o.p[1],o.p[2]+o.z);
		var s=(o.t&7)*0.5*0.33;
		ono3d.rotate(o.t*0.25,0,0,1);
		ono3d.color= argbz(0x7f,0xff-0x90*s,0x0,0xff-0x0*s,o.p[2]);
		ono3d.scale(2,1.25,1);
		ono3d.rotate(Math.PI*0.25,0,0,1);
		drawRect();
		ono3d.color= argbz(0x7f,0x0,0x0,0xf0,o.p[2]);
		var ss=1.3;
		ono3d.translate(0,0,0.01);
		ono3d.scale(ss,ss,ss);
		drawRect();
	}
	return defObj(o,m,p);
};
var oBullet= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hitarea[3]=2;
		o.kind=Objman.T_BULLET;
		o.z=-1;
		break;
	case Objman.MOVE:
		if(Vec3.len(o.p)>100){
			objman.deleteObj(o);
		}
		if(o.ptn==0){
			if(o.t<8){
				o.ptn=1;
				o.t=0;
				playSound(seBullet);
			}
			Vec3.sub(o.p,o.p,o.v);
		}
		if(o.t==1){
			createBullet(oFlash,o.p,0,0);
		}
		break;
	case Objman.DRAW:
		if(o.ptn==0){
			return;
		}
		ono3d.translate(o.p[0],o.p[1],o.p[2]+o.z);
		var s=(o.t&7)*0.5*0.33;
		ono3d.rotate(o.t*0.25,0,0,1);
		ono3d.color= argb(0x7f,0xff-0x90*s,0x0,0xff-0x0*s);
		ono3d.scale(2,1.25,1);
		ono3d.rotate(Math.PI*0.25,0,0,1);
		drawRect();
		ono3d.color= argb(0x7f,0x0,0x0,0xf0);
		var ss=1.3;
		ono3d.translate(0,0,0.01);
		ono3d.scale(ss,ss,ss);
		drawRect();
	}
	return defObj(o,m,p);
};
var oShot= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hitarea[3]=3;
		o.hp=1;
		o.kind=Objman.T_SHOT;
		break;
	case Objman.MOVE:
		if(o.p[1]>100){
			objman.deleteObj(o);
		}
		break;
	case Objman.DELETE:
		if(o.parent.fnc==oJiki){
			if(o.parent.zandan<4){
				o.parent.zandan++;
			}
		}
		break;
	case Objman.DRAW:
		ono3d.color=0x7f3366ff;
		ono3d.translate(o.p[0],o.p[1],o.p[2]+o.z);
		ono3d.scale(1,3,1);
		ono3d.translate(-2,0,0);
		drawRect();
		ono3d.translate(4,0,0);
		drawRect();
	}
	return defObj(o,m,p);
};
var oExplosion_1 = function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.z=1;
		break;
	case Objman.MOVE:
		Vec3.mult(o.v,o.v,0.4);
		if(o.t>=60){
			objman.deleteObj(o);
		}
		break;
	case Objman.DRAW:
		var rto=o.t/60;
		var a=0x7f
		if(o.t>20){
			a=0x7f+(0x00-0x7f)*(o.t-20)/40
		}
		var r=0xff+(0x33-0xff)*rto
		var g=0x33
		var b=0x33
		ono3d.color= (a<<24) + (r<<16) + (g<<8) + b;
		ono3d.translate(o.p[0],o.p[1],o.p[2]+o.z);
		ono3d.scale(1,1,1);
		drawRect();
		break;
	}
	return defObj(o,m,p);
}
var oExplosion2 = function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.kind=0;
		playSound(seBomb);
		break;
	case Objman.MOVE:
		o.v[2]+=0.3;
		
		Vec3.mult(o.v,o.v,0.95);
		if(o.t&1)createBullet(oExplosion_1,o.p,0,0);
		if(o.t>20){
			objman.deleteObj(o);
		}
		break;
	case Objman.DRAW:
		break;
	}
	return defObj(o,m,p);
};
var oExplosion = function(o,m,p){
	switch(m){
	case Objman.CREATE:
		break;
	case Objman.MOVE:
		if(o.t&1)createBullet(oExplosion_1,o.p,rnd()*4096,16);
		if(o.t>16){
			objman.deleteObj(o);
		}
		break;
	case Objman.DRAW:
		break;
	}
	return defObj(o,m,p);
};
var oEnemies= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hp=6;
		o.a=3072;
		Vec3.set(o.v,0,-4,0);
		break;
	case Objman.MOVE:
		if(o.t==1){
			o.ccc=o.hp;
			Vec3.set(o.p2,-o.v[0],-o.v[1],-o.v[2]);
			Vec3.set(o.v,0,0,0);
		}
		if(o.t%8==0 && o.ccc>0){
			o.ccc--;
			var obj;
			obj=createBullet(oSmallEnemy,o.p,o.a,4);
			Vec3.set(obj.p2,o.p[0],o.p[1],o.p[2]);
			Vec3.set(obj.p,-fugo(obj.p[0])*20,0,-40);
			setParent(obj,o);
			Vec3.add(o.p,o.p,o.p2);
		}
		break;
	case Objman.DELETE:
		if(o.parent){
			if(o.parent.id==o.parentid){
				o.parent.hp--;
			}
		}
		break;
	case Objman.DRAW:
		break;
	}
	return defObj(o,m,p);
};
var oEnemy = function(o,m,p){
	var ang=new Vec3();
	Vec3.set(ang,0,0,-1);
	switch(m){
	case Objman.CREATE:
		o.kind=Objman.T_ENEMY;
		break;
	case Objman.MOVE:
		break;
	case Objman.DESTROYED:
		createBullet(oExplosion,o.p,0,0);
		createPerticle(oExplosion2,o.p,ang,1.,4);
		score+=10;
		medalCount++;
		if(medalCount>=8){
			medalCount=0;
			createBullet(oMedal,o.hitarea,0,0);
		}
		break;
	case Objman.DELETE:
		if(o.parent){
			if(o.parent.id==o.parentid){
				o.parent.hp--;
			}
		}
		break;
	case Objman.DRAW:
		break;
	}
	return defObj(o,m,p);
};
var oSmallEnemy = function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hp=1;
		o.hitarea[3]=3;
		break;
	case Objman.MOVE:
		if(o.ptn==0){
			Vec3.mult(o.v,o.v,0.8);
			Vec3.sub(bufvec,o.p2,o.p);
			
			if(Math.abs(bufvec[2])<1){
				o.ptn=1;
				o.t=0;
				Vec3.set(o.v,Math.cos(o.a*Math.PI/2048),Math.sin(o.a*Math.PI/2048),0);
				Vec3.mult(o.v,o.v,0.4);
			}else{
				Vec3.mult(bufvec,bufvec,0.01);
				Vec3.add(o.v,o.v,bufvec);
			}
		}else{
			
			if(o.t==40){
				createBullet(oBullet,o.p,nerai(o.p)+rnd2()*256,1);
			}
			if(o.p[1]<-120){
				objman.deleteObj(o);
			}
		}
		break;
	case Objman.DESTROYED:
		break;
	case Objman.DRAW:
		ono3d.color=0x7f0099ff;
		var a=0x7f
			,r=0x0
			,g=0x99
			,b=0xff
			,z=1
			,zz=1
		;
		if(o.p[2]>0){
			z=1-o.p[2]/50;
			if(z<0)z=0;
		}
		if(o.p[2]<0){
			zz=1+o.p[2]/50;
			if(zz<0)zz=0;
		}

		ono3d.color=argb(a*zz,r*z,g*z,b*z);
		ono3d.translate(o.p[0],o.p[1],o.p[2]+o.z+Math.sin(o.t*0.15)*2);
		ono3d.rotate(-o.v[0]*0.1,0,1,0);
		ono3d.scale(3,3,1);
		drawRect();
		break;
	}
	return oEnemy(o,m,p);
};
var oMiddleEnemy = function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hp=10;
		o.hitarea[3]=8;
		break;
	case Objman.MOVE:
		if(o.ptn==0){
			Vec3.mult(o.v,o.v,0.4);
			Vec3.sub(bufvec,o.p2,o.p);
			
			if(o.t>60){
				o.ptn=1;
				o.t=0;
				Vec3.set(o.v,0,-0.2,0);
			}else{
				Vec3.mult(bufvec,bufvec,0.02);
				Vec3.add(o.v,o.v,bufvec);
			}
		}else{
			if(o.t%40==0 && o.t<200){
				for(var i=-1;i<2;i++){
					createBullet(oBullet,o.p,nerai(o.p)+64*i,1);
				}
			}
			if(Vec2.len(o.p)>120){
				objman.deleteObj(o);
			}
		}
		break;
	case Objman.DESTROYED:
		bure=10;
		break;
	case Objman.DRAW:
		ono3d.color=0x7f0099ff;
		var a=0x7f
			,r=0x0
			,g=0x99
			,b=0xff
			,z=1;
		;
		if(o.p[2]>0){
			z=1-o.p[2]/50;
			if(z<0)z=0;
		}

		ono3d.color= (a<<24) + (r*z*o.p[2]<<16) + (g*z<<8) + b*z;
		ono3d.translate(o.p[0],o.p[1],o.p[2]+o.z);
		ono3d.scale(8,8,1);
		drawRect();
		break;
	}
	return oEnemy(o,m,p);
};
var oBossSub= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hp=40;
		o.hitarea[3]=15;
		break;
	case Objman.DESTROYED:
		bure=20;
		break;
	case Objman.DRAW:
		ono3d.color=0x7fcccccc;
		ono3d.translate(o.p[0],o.p[1]-10,o.p[2]-0.5);
		ono3d.scale(20,10,1);
		drawRect();
		break;
	}
	return oEnemy(o,m,p);
}
var oLazerSub= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.kind=Objman.T_BULLET;
		o.hitarea[3]=6;
		break;
	case Objman.MOVE:
		if(o.t>80){
			objman.deleteObj(o);
		}
		break;
	}
	return defObj(o,m,p);
}
var oLazer= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hp=20;
		break;
	case Objman.MOVE:
		if(o.t==40){
			var obj;
			Vec3.set(o.p2,Math.cos(o.a*Math.PI/2048),Math.sin(o.a*Math.PI/2048),0);
			Vec3.mult(o.p2,o.p2,6*2);
			Vec3.set(bufvec,o.p[0],o.p[1],o.p[2]);
			for(var i=0;i<16;i++){
				obj=createBullet(oLazerSub,bufvec,0,0);
				Vec3.add(bufvec,bufvec,o.p2);
			}
		}
		if(o.t>=40){
			ldr=1;
		}
		if(o.t>120){
			objman.deleteObj(o);
		}
		break;
	case Objman.DRAW:
		ono3d.color=0x7fffffff;
		ono3d.translate(o.p[0],o.p[1],o.p[2]);
		ono3d.rotate(o.a*Math.PI/2048,0,0,1);
		if(o.t<40){
			ono3d.scale(100,1,1);
		}else{
			ono3d.scale(100,6+(o.t&2)*2,1);
		}
		ono3d.translate(1,0,0);
		drawRect();
		break;
	}
	return oEnemy(o,m,p);
}
var oBit= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hp=50;
		o.hitarea[3]=4;
		o.nerai= new Vec3();
		o.nv= new Vec3();
		break;
	case Objman.MOVE:
		var s=0.1;
		if(o.ptn==1){
			s=0.3;
			if(o.t%10==0){
				createBullet(oBullet,o.p,o.a,2);
			}
		}
		if(o.ptn==2 || o.ptn==3){
			if(o.t<60){
				o.a2+=o.t*0.004;
				o.a=nerai(o.p2);
			}else{
				o.a2+=120*0.004;
			}
			
			if(o.ptn==3){
				if(o.t==60){
					createBullet(oLazer,o.p,o.a,0);
				}
			}
			s=0.05;
		}
		if(o.ptn==4){
				s=0.05;
			if(o.t==1){
				Vec3.set(o.p2,rnd2()*30,rnd2()*30,(rnd()+1)*20*fugo(rnd2()));
			}
			if(o.t==30){
				ono3d.loadIdentity();
				ono3d.translate(pJiki.p[0],pJiki.p[1],pJiki.p[2]);
				ono3d.rotate(rnd()*2*Math.PI,0,0,1);
				ono3d.translate(40,0,0);
				Vec3.set(bufvec,0,0,0);
				Mat43.dotMat43Vec3(o.nerai,ono3d.transMat,bufvec)
				Vec3.set(o.nv,0,0,0);
			}
			if(o.t>=30){
				Vec3.sub(bufvec,o.nerai,o.p);
				o.a=Math.atan2(bufvec[1],bufvec[0])*2048/Math.PI;
				o.a2=Math.atan2(bufvec[2],Vec2.len(bufvec));
				if(o.t%10==0){
					Vec3.normalize(bufvec,bufvec);
					createPerticle(oBullet3D,o.p,bufvec,0,3);
				}
				Vec3.sub(bufvec,pJiki.p,o.nerai);
				Vec3.normalize(bufvec,bufvec);
				Vec3.mult(bufvec,bufvec,0.08);
				Vec3.add(o.nv,o.nv,bufvec);
				//Vec3.normalize(o.nv,o.nv);
				Vec3.mult(o.nv,o.nv,0.98);
				Vec3.add(o.nerai,o.nerai,o.nv);

			}
		}
		Vec3.sub(o.v,o.p2,o.p);
		Vec3.mult(o.v,o.v,s);
		break;
	case Objman.DESTROYED:
		bure=20;
		break;
	case Objman.DRAW:
		ono3d.color=argbz(0x7f,0xcc,0xcc,0xcc,o.p[2]);
		ono3d.translate(o.p[0],o.p[1],o.p[2]);
		ono3d.rotate(o.a/2048*Math.PI,0,0,1);
		if(o.ptn==2 || o.ptn==3){
			ono3d.rotate(o.a2,1,0,0);
			ono3d.translate(0,0,7);
		}
		if(o.ptn==4){
			ono3d.rotate(-o.a2,0,1,0);
		}
		ono3d.scale(4,1.5,1);
		ono3d.translate(0,1.5,0);
		ono3d.push();
			drawRect();
			ono3d.rotate(Math.PI,1,0,0);
			drawRect();
		ono3d.pop();
		ono3d.translate(0,-3,0);
		ono3d.push();
			drawRect();
			ono3d.rotate(Math.PI,1,0,0);
			drawRect();
		ono3d.pop();
		break;
	}
	return oEnemy(o,m,p);
}
var oBoss= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hp=120;
		o.hitarea[3]=10;
		o.sub=objman.createObj(oBossSub);
		o.subid=o.sub.id;
		o.bit=new Array(4);
		break;
	case Objman.MOVE:
		switch(o.ptn){
		case 0:
			Vec3.mult(o.v,o.v,0.4);
			Vec3.sub(bufvec,o.p2,o.p);
			
			if(o.t>60){
				o.ptn=1;
				o.t=0;
				Vec3.set(o.v,0,-0.2,0);
			}else{
				Vec3.mult(bufvec,bufvec,0.02);
				Vec3.add(o.v,o.v,bufvec);
			}
		break; case 1:
			var obj;
			Vec3.set(o.v,Math.cos(o.t*0.02)*0.5,Math.sin(o.t*0.02*4)*0.5,0);
			if(o.t%120<30){
				if(o.t%10==0){
					for(var i=-1;i<2;i++){
						Vec3.set(bufvec,o.p[0]-16,o.p[1]-8,o.p[2]);
						obj=createBullet(oBullet,bufvec,nerai(bufvec)-i*256,1.5);
						Vec3.set(bufvec,o.p[0]+16,o.p[1]-8,o.p[2]);
						obj=createBullet(oBullet,bufvec,nerai(bufvec)-i*256,1.5);
					}
				}
			}
			if(o.sub.id!=o.subid){
				o.ptn=2;
				o.t=0;
				o.sub=null;
			}
		break; case 2:
			if(o.t==1){
				Vec3.set(o.p2,0,50,0);
			}
			if(o.t%30==0 && o.t<130){
				o.bit[(o.t/30|0)-1]=createBullet(oBit,o.p,1024,3);
			}
			if(o.t>130){
				o.ptn=3;
				o.t=0;
			}
			for(var i=0;i<4;i++){
				var obj=o.bit[i];
				if(!obj)continue;

				obj.a=-o.t*19+1024*i;
				ono3d.loadIdentity();
				ono3d.translate(o.p[0],o.p[1],o.p[2]);
				ono3d.rotate(obj.a/2048*Math.PI,0,0,1);
				ono3d.translate(25,0,0);
				Vec3.set(bufvec,0,0,0);
				Mat43.dotMat43Vec3(obj.p2,ono3d.transMat,bufvec)
			}
		break; case 3:
			if(o.t>90){
				var a=-Math.sin((o.t-90)*0.01);
				o.a+=a*Math.abs(a)*123;
			}
			if(o.t==1){
				o.a=2048-512;
				for(var i=0;i<4;i++){
					var obj=o.bit[i];
					if(!obj)continue;
					obj.ptn=1;
					obj.t=0;
				}
			}

			for(var i=0;i<4;i++){
				var obj=o.bit[i];
				if(!obj)continue;
				obj.a=o.a+1024*i;
				ono3d.loadIdentity();
				ono3d.translate(o.p[0],o.p[1],o.p[2]);
				ono3d.rotate(obj.a/2048*Math.PI,0,0,1);
				ono3d.translate(20,0,0);
				Vec3.set(bufvec,0,0,0);
				Mat43.dotMat43Vec3(obj.p2,ono3d.transMat,bufvec)
			}
			if(o.t>600){
				o.ptn++;
				o.t=0;
			}
		break;case 4:
			Vec3.set(o.v,Math.cos(o.t*0.02)*0.3,Math.sin(o.t*0.02*4)*0.5,0);
			Vec3.add(o.p2,o.v,o.p2);
			if(o.t%60==0){
				createBullet(oBullet,o.p,nerai(o.p),1);
				createBullet(oBullet,o.p,nerai(o.p),1.5);
				createBullet(oBullet,o.p,nerai(o.p),2);
			}
			if(o.t==1 || o.t==220){
				for(var i=0;i<4;i++){
					var obj=o.bit[i];
					if(!obj)continue;
					obj.ptn=0;
					obj.t=0;
				}
				//Vec3.set(o.p2,o.p[0],o.p[1],50);
				var flg=0;
				for(var i=0;i<4;i++){
					var obj=o.bit[i];
					if(!obj)continue;
					if(!(flg&1)){
						Vec3.set(bufvec,rnd2()*50,rnd2()*50+30,0);
						obj.a2=0;
						obj.ptn=2;
					}else{
						obj.a2=Math.PI;
						obj.ptn=3;
					}
					flg=1-flg;
					obj.a=0;
					obj.t=0;
					Vec3.set(obj.p2,bufvec[0],bufvec[1],bufvec[2]);
					
				}
			}
			if(o.t==440){
				o.ptn++;
				o.t=0;
			}
			Vec3.sub(o.v,o.p2,o.p);
			Vec3.mult(o.v,o.v,0.05);
		break;case 5:
			if(o.t==1){
				Vec3.set(o.p2,0,150,0);
				for(var i=0;i<4;i++){
					var obj=o.bit[i];
					if(!obj)continue;
					obj.ptn=4;
					obj.t=0;
				}
			}
			if(o.t==300){
				for(var i=0;i<4;i++){
					var obj=o.bit[i];
					if(!obj)continue;
					obj.ptn=0;
					obj.t=0;
				}
				o.ptn++;
				o.t=0;
			}
		break;case 6:
			if(o.t==1){
				Vec3.set(o.p2,0,150,0);
				for(var i=0;i<4;i++){
					var obj=o.bit[i];
					if(!obj)continue;
					obj.ptn=0;
					obj.t=0;
				}
			}
			if(o.t==50){
				for(var i=0;i<4;i++){
					var obj=o.bit[i];
					if(!obj)continue;
					obj.p2[0]=-rnd2()*50;
					obj.p2[1]=-rnd2()*50;
					obj.p2[2]=-50;
				}
			}
			if(o.t==100){
				Vec3.set(o.p2,0,50,0);
				for(var i=0;i<4;i++){
					var obj=o.bit[i];
					if(!obj)continue;
					obj.p2[2]=0;
					obj.p2[1]=150;
				}
			}
			if(o.t==160){
				for(var i=0;i<4;i++){
					var obj=o.bit[i];
					if(!obj)continue;
					obj.a=2048-512+1024*i;
					ono3d.loadIdentity();
					ono3d.translate(o.p2[0],o.p2[1],o.p2[2]);
					ono3d.rotate(obj.a/2048*Math.PI,0,0,1);
					ono3d.translate(20,0,0);
					Vec3.set(bufvec,0,0,0);
					Mat43.dotMat43Vec3(obj.p2,ono3d.transMat,bufvec)
				}
			}
			if(o.t==200){
				o.ptn=3;
				o.t=0;
			}
		break;}

		if(o.sub){
			Vec3.set(o.sub.p,o.p[0],o.p[1],o.p[2]);
		}
		if(o.ptn>=2){
			Vec3.sub(o.v,o.p2,o.p);
			Vec3.mult(o.v,o.v,0.05);
		}
		break;
	case Objman.DESTROYED:
		bure=20;
		objman.createObj(oClear);
		for(var i=0;i<4;i++){
			var obj=o.bit[i];
			if(!obj)continue;
			objman.deleteObj(obj);
		}
		for(var i=0;i<8;i++){
			var obj=objman.createObj(oMedal);
			Vec3.set(obj.p,o.p[0]+rnd2()*25,o.p[1]+rnd2()*10,o.p[2]);
		}
		break;
	case Objman.DELETE:
		break;
	case Objman.DRAW:
		ono3d.color=0x7f0099ff;
		var a=0x7f
			,r=0xff
			,g=0xff
			,b=0xff
			,z=1;
		;
		ono3d.color=argb(a,r,g,b);
		ono3d.translate(o.p[0],o.p[1],o.p[2]);
		ono3d.scale(10,10,1);
		drawRect();
		break;
	}
	return oEnemy(o,m,p);
};
var oSmoke = function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hp=1;
		Vec3.set(o.v,0,scrollSpeed,0);
		break;
	case Objman.MOVE:

		if(o.t>=40){
			objman.deleteObj(o);
		}
		break;
	case Objman.DESTROYED:
		break;
	case Objman.DRAW:
		var s=o.t/40;
		ono3d.color=argb(0x7f-(0x7f*s),0x66,0x33,0x00);
		ono3d.rotate(-cameraa[1],0,1,0);
		ono3d.rotate(-cameraa[0],1,0,0);
		ono3d.translate(o.p[0],o.p[1],o.p[2]);
		ono3d.rotate(s+o.a*0.1,0,0,1);
		ono3d.scale(2,2,1);
		drawRect();
		break;
	}
	return defObj(o,m,p);
};
var oTank = function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hp=3;
		o.z=0;
		o.hitarea[3]=8;
		Vec3.set(o.v,0,0,0);
		o.kind=Objman.T_NONE;
		o.a=1024;
		o.gflg=1;
		return defObj(o,m,p);
		break;
	case Objman.MOVE:
		if(o.ptn==0){
			Vec3.mult(o.v,o.v,0.8);
			Vec3.sub(bufvec,o.p2,o.p);
			
			if(o.t>60){
				o.ptn=1;
				o.t=0;
				Vec3.set(o.v,0,-0.8,0);
				o.kind=Objman.T_G_ENEMY;
			}else{
				Vec3.mult(bufvec,bufvec,0.01);
				Vec3.add(o.v,o.v,bufvec);
			}
		}else{
			if(Vec2.len(o.hitarea)>120){
				objman.deleteObj(o);
			}

			Vec3.set(o.v,Math.sin(o.t*0.05)*0.5,0,0);
			var da=(nerai(o.p)-o.a+4096)%4096;
			if(da>2048)da-=4096;
			if(da<-2048)da+=4096;
			o.a+=da*0.05;

			if(o.t%120==0){
				ono3d.loadIdentity();
				ono3d.translate(-camerap[0],-camerap[1],-camerap[2]);
				ono3d.rotate(-cameraa[1],0,1,0);
				ono3d.rotate(-cameraa[0],1,0,0);
				Mat43.dotMat43Vec3(bufvec,ono3d.transMat,o.p)
				var obj=createBullet(oCannon,bufvec,nerai(bufvec),3);
				Vec3.set(obj.p2,pJiki.p[0],pJiki.p[1],pJiki.p[2]-10);
				Vec2.sub(bufvec,obj.p2,obj.p);
				Vec2.mult(obj.v,bufvec,0.018);

				
			}
		}
		o.v[1]=-scrollSpeed;
		o.p[1]+=scrollSpeed;
		if(o.t&1){
			var obj=objman.createObj(oSmoke);
			obj.a=o.t
			if(o.t&2){
				Vec3.set(obj.p,o.p[0]+7,o.p[1]-4,o.p[2]+2);
			}else{
				Vec3.set(obj.p,o.p[0]-7,o.p[1]-4,o.p[2]+2);
			}
		}
		break;
	case Objman.DESTROYED:
		Vec3.set(o.p,o.p[0],o.p[1],o.p[2]);
		break;
	case Objman.DRAW:
		var ss=1;
		var r=Math.atan2(o.v[1],o.v[0]);
		if(o.ptn==0){
			ss=o.t/60;
			o.a=r*2048/Math.PI;
		}
		ono3d.color=argb(0x7f,0x33*ss,0x99*ss,0x33*ss);
		ono3d.rotate(-cameraa[1],0,1,0);
		ono3d.rotate(-cameraa[0],1,0,0);
		ono3d.translate(o.p[0],o.p[1],o.p[2]+(o.t&1)*2);
		ono3d.push();
		ono3d.rotate(r,0,0,1);
		ono3d.translate(4,0,2);
		ono3d.scale(16,10,1);
		drawRect();
		ono3d.pop();
		
		ono3d.color=argb(0x7f,0x99*ss,0xcc*ss,0x99*ss);
		ono3d.rotate(o.a/2048*Math.PI,0,0,1);
		ono3d.translate(-4,0,0);
		ono3d.push();
		ono3d.scale(10,7,1);
		drawRect();
		ono3d.pop();

		ono3d.translate(0,0,0.1);
		ono3d.color=argb(0x7f,0x0*ss,0x33*ss,0x33*ss);
		ono3d.scale(5,2,1);
		ono3d.translate(3,0,0);
		drawRect();
		break;
	}
	return oEnemy(o,m,p);
};
var pJiki
,pSystem
	;
var oClear=function(o,m,p){
	switch(m){
	case Objman.MOVE:
		if(o.t>=600){
			objman.deleteObj(o);
			pSystem.ptn=1;
		}
		break;
	case Objman.DRAW:
		ono3d.loadIdentity();
		ono3d.translate(sisa,0,0);
		ono3d.scale(2,2,1);
		ono3d.translate(4,0,60);
		drawText("CLEAR");
		break;
	}
}
var oGameOver=function(o,m,p){
	switch(m){
	case Objman.MOVE:
		if(o.t>=120){
			objman.deleteObj(o);
			pSystem.ptn=1;
		}
		break;
	case Objman.DRAW:
		ono3d.loadIdentity();
		ono3d.translate(sisa,0,0);
		ono3d.scale(2,2,1);
		ono3d.translate(8,0,60);
		drawText("GAME OVER");
		break;
	}
}
var oJiki=function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.z=3
		o.kind=Objman.T_JIKI;
		o.hitarea[3]=2;
		pJiki=o;
		Vec3.set(o.p,0,-100,0);
		o.zandan=4;
		o.shotdelay=0;

		break;
	case Objman.MOVE:
		if(o.ptn==0){
			if(o.t==1){
				Vec3.set(o.v,0,0,0);
			}

			if(o.t==40){
				Vec3.set(o.v,0,3,0);
			}
			Vec3.mult(o.v,o.v,0.95);
			
			o.kind=Objman.T_NONE;
			if(o.t>=80){
				o.ptn=1;
				o.t=0;
			}
		}else if(o.ptn==1){
			if(o.t==60){
				o.kind=Objman.T_JIKI;
			}
			Vec3.set(o.v,0,0,0);
			if(Util.keyflag[0]){ o.v[0]=1; }
			if(Util.keyflag[2]){ o.v[0]=-1; }
			if(Util.keyflag[1]){ o.v[1]=1; }
			if(Util.keyflag[3]){ o.v[1]=-1; }
			if(Util.pressCount>0){
				o.v[0]=Util.cursorX-Util.oldcursorX;
				o.v[1]=Util.cursorY-Util.oldcursorY;
				o.v[2]=0;
				Vec3.mult(o.v,o.v,-0.2);
			}
			if(o.p[0]*o.p[0]>50*50){
				o.p[0]=fugo(o.p[0])*50;
			}
			if(o.p[1]*o.p[1]>70*70){
				o.p[1]=fugo(o.p[1])*70;
			}


			if(o.shotdelay<=0 && o.zandan>0 && Util.keyflag[4]){
				o.zandan--;
				o.shotdelay=4;
				var obj=createBullet(oShot,o.p,1024,3);
				obj.p[2]+=0.1
				setParent(obj,o);
			}
			if(o.shotdelay>0){
				o.shotdelay--;
			}
		}
		camerap[0]=pJiki.p[0]*0.25;
		cameraa[1]=pJiki.p[0]*0.01;
		break;
	case Objman.HIT:
		if(p.fnc==oMedal){
			return;
		}
		
		break;
	case Objman.DESTROYED:
		createBullet(oFlashJiki,o.p,0,0);
		if(zanki==1){
			objman.createObj(oGameOver);
		}else{
			zanki--;
			var obj=objman.createObj(oJiki);
			obj.p[0]=o.p[0]
		}
		break;

	case Objman.DRAW:
		if(o.kind == Objman.T_NONE){
			if(o.t&2){
				return;
			}
		}
		ono3d.translate(o.p[0],o.p[1],o.p[2]);
		ono3d.rotate(-o.v[0]*0.1,0,1,0);
		ono3d.scale(3,3,1);

		ono3d.color=0x7f00ff00;
		drawRect();
		break;
	}
	return defObj(o,m,p);
};
var tVec=new Vec3();
var sVec=new Vec3();
var createPerticle= function(fnc,p,a,ang,s){
	var obj = objman.createObj(fnc);
	if(obj==null)return;
	Vec3.set(obj.p,p[0],p[1],p[2]);
	if(a){
		Vec3.set(obj.v,a[0],a[1],a[2]);
	}

	randvec(obj.v,ang);
	Vec3.mult(obj.v,obj.v,s);
	return obj;

}
var createBullet = function(fnc,p,a,s){
	var obj = objman.createObj(fnc);
	if(obj==null)return;
	Vec3.set(obj.p,p[0],p[1],p[2]);
	obj.v[0] = Math.cos(a/2048*Math.PI)
	obj.v[1] = Math.sin(a/2048*Math.PI)
	obj.v[2] = 0;
	obj.a=a;
	Vec3.mult(obj.v,obj.v,s);
	return obj;
}
var objTree= function(o,m,p){
	switch(m){
	case Objman.MOVE:
		if(o.p[1]<-150){
			objman.deleteObj(o);
		}
		break;
	case Objman.DRAW:
		ono3d.color=0x7f663300;
		ono3d.rotate(-cameraa[1],0,1,0);
		ono3d.rotate(-cameraa[0],1,0,0);
		ono3d.translate(o.p[0],o.p[1],o.p[2]);
		ono3d.scale(8,8,1);
		drawRect();
		ono3d.color=0x7f996600;
		ono3d.translate(0,0,-20);
		drawRect();
		ono3d.color=0x7f99ff00;
		ono3d.translate(0,0,-20);
		drawRect();
		break;
	}
	return defObj(o,m,p);
}
var count0,count1;
var count0id,count1id;

var oStage= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		//Vec3.set(camerap,0,0,0);
		//Vec3.set(cameraa,0,0,0);
		Vec3.set(o.p,0,0,0);
		playSound(bgm);
		count0id=-2;
		count1id=-2;
		count0=o
		count1=o
	//	o.ptn=6;
		o.t=0;
		o.p[1]=0;
		cameraa[0]=0;
		break;
	case Objman.MOVE:
		var cnt=0;
		o.p[1]++;
		if(o.ptn==cnt++){
			if(o.t==1){
			}
			if(o.t>120 && count0.id!=count0id){
				count0=objman.createObj(function(o,m,p){
					switch(m){
					case Objman.CREATE:
						o.hp=2;
						break;
					case Objman.MOVE:
						var obj;
						if(o.t==20){
							obj=objman.createObj(oEnemies);
							Vec3.set(obj.p,-20,40,0);
							setParent(obj,o);
						}
						if(o.t==60){
							obj=objman.createObj(oEnemies);
							Vec3.set(obj.p,20,40,0);
							setParent(obj,o);
						}
						break;
					}
					return defObj(o,m,p);
				});
				count0id=count0.id;
			}
			if(o.t>=400){
				o.ptn++;
				o.t=0;
				o.count=0;
			}
		}else if(o.ptn==cnt++){
			if(o.t>120 && count0.id!=count0id){
				count0=objman.createObj(function(o,m,p){
					switch(m){
					case Objman.CREATE:
						o.hp=2;
						break;
					case Objman.MOVE:
						var obj;
						if(o.t==1){
							obj=objman.createObj(oMiddleEnemy);
							Vec3.set(obj.p2,o.p[0],50,0);
							Vec3.set(obj.p,obj.p[0],0,30);
							setParent(obj,o);
						}
						if(o.t==60){
							obj=objman.createObj(oEnemies);
							Vec3.set(obj.p,-o.p[0],60,0);
							setParent(obj,o);
						}
						break;
					}
					return defObj(o,m,p);
				});
				count0id=count0.id;
				count0.p[0]=(((o.count&1)<<1)-1)*30;
				o.count++;
			}
			if(o.t>=800){
				o.ptn++;
				o.t=0;
			}
		}else if(o.ptn==cnt++){
			if(o.t==120){
				obj=objman.createObj(oEnemies);
				Vec3.set(obj.p,0,60,0);
				obj.hp=3
			}
			if(o.t==180){
				obj=objman.createObj(oEnemies);
				Vec3.set(obj.p,10,70,0);
				obj.hp=3
				obj=objman.createObj(oEnemies);
				Vec3.set(obj.p,-10,70,0);
				obj.hp=3
			}
			if(o.t==240){
				obj=objman.createObj(oEnemies);
				Vec3.set(obj.p,20,70,0);
				obj.hp=3
				obj=objman.createObj(oEnemies);
				Vec3.set(obj.p,-20,70,0);
				obj.hp=3
			}
			if(o.t==400){
				o.ptn++;
				o.t=0;
			}
		}else if(o.ptn==cnt++){
			if(o.t>120 && count0.id!=count0id){
				count0=objman.createObj(function(o,m,p){
					switch(m){
					case Objman.CREATE:
						o.hp=1;
						break;
					case Objman.MOVE:
						var obj;
						if(o.t==60){
							obj=objman.createObj(oTank);
							Vec3.set(obj.p2,rnd2()*40,80+rnd2()*20,90);
							Vec3.set(obj.p,-fugo(obj.p2[0])*100,obj.p2[1],obj.p2[2]);
							setParent(obj,o);
						}
						break;
					}
					return defObj(o,m,p);
				});
				count0id=count0.id;
			}

			if(o.t>240 && count1.id!=count1id){
				count1=objman.createObj(function(o,m,p){
					switch(m){
					case Objman.CREATE:
						o.hp=2;
						break;
					case Objman.MOVE:
						var obj;
						if(o.t==60){
							obj=objman.createObj(oEnemies);
							Vec3.set(obj.p,30,70,0);
							setParent(obj,o);
							obj=objman.createObj(oEnemies);
							Vec3.set(obj.p,-30,70,0);
							setParent(obj,o);
						}
						break;
					}
					return defObj(o,m,p);
				});
				count1id=count1.id;
			}

			if(o.t>=1200){
				o.t=0;
				o.ptn++;
			}
		}else if(o.ptn==cnt++){
			if(o.t>100 && o.t%30==0 && o.t<300){
				obj=objman.createObj(oTank);
				Vec3.set(obj.p2,rnd2()*60,60+rnd2()*60,90);
				Vec3.set(obj.p,-fugo(obj.p2[0])*100,obj.p2[1],obj.p2[2]);
			}
//			if(o.t>=300){
//				cameraa[0]-=0.002;
//			}
			if(o.t>=600){
				o.ptn++;
				o.t=0;
			}
		}else if(o.ptn==cnt++){
			if(o.t==100){
				obj=createBullet(oEnemies,o.p,3072+512,4);
				Vec3.set(obj.p,-30,50,0);
				obj=createBullet(oEnemies,o.p,3072-512,4);
				Vec3.set(obj.p,30,50,0);
			}
			if(o.t==200){
				obj=createBullet(oEnemies,o.p,3072+512,4);
				Vec3.set(obj.p,-30,70,0);
				obj=createBullet(oEnemies,o.p,3072-512,4);
				Vec3.set(obj.p,30,70,0);
			}
			if(o.t>=600){
				o.ptn++;
				o.t=0;
			}
		}else if(o.ptn==cnt++){
			if(o.t==200){
				var obj=objman.createObj(oBoss);
				Vec3.set(obj.p2,0,50,0);
				Vec3.set(obj.p,obj.p[0],0,30);
			}
		}
		if(o.t%40==0){
			var obj;
			for(var i=1;i<4;i++){
				obj=objman.createObj(objTree);
				Vec3.set(obj.p,-20-40*i,150,70);
				Vec3.set(obj.v,0,scrollSpeed,0);
				obj=objman.createObj(objTree);
				Vec3.set(obj.p,20+40*i,150,70);
				Vec3.set(obj.v,0,scrollSpeed,0);
			}
		}
		break;
	case Objman.DRAW:
		ono3d.rotate(-cameraa[1],0,1,0);
		ono3d.rotate(-cameraa[0],1,0,0);
		ono3d.translate(0,0,100);
		ono3d.translate(0,o.p[1]*scrollSpeed%64,0);
		ono3d.scale(160,16,1);
		ono3d.translate(0,2*10,0);
		for(i=0;i<10;i++){
			ono3d.color=0x7f336633;
			ono3d.translate(0,-2,0);
			drawRect();
			ono3d.color=0x7f225522;
			ono3d.translate(0,-2,0);
			drawRect();
		}

		if(ldr){
			ono3d.loadIdentity();
			ono3d.translate(0,0,100);
			ono3d.scale(100,100,1);
			ono3d.color=0x40000000;
			drawRect();
		}
		ldr=0;
		break;
	}
	return defObj;
}
var pStage=null;
var ldr=0;
var oSystem=function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.z=-10;
		pStage=objman.createObj(oStage);
		objman.createObj(oJiki);
		zanki=3;
		score=0;
		medalCount=0;
		medalLevel=0;
		break;
	case Objman.MOVE:
		if(bure>0){
			bure--;
			Vec3.set(burep,rnd2(),rnd2(),rnd2());
			Vec3.mult(burep,burep,4);
		}else{
			Vec3.set(burep,0,0,0);
		}
		Vec3.add(burep,burep,camerap);
		if(o.ptn==1){
			var objs=objman.objs;
			var obj;
			for(i = Objman.OBJ_NUM; i--;){
				obj=objs[i]
				if(!obj.flg)continue
				objman.deleteObj(obj);
			}
			loadScore(global_param["id"],document.getElementById("name").value,score);
			objman.createObj(oTitle);
		}
		break;
	case Objman.DRAW:
		//ono3d.translate(camerap[0],camerap[1],camerap[2])
		ono3d.loadIdentity();
		ono3d.translate(sisa,0,0);
		ono3d.scale(2,2,1);
		ono3d.translate(15,30,70);
		var str="        "+score;
		drawText(str.substr(str.length-6,6));
		ono3d.translate(0,-5,0);
		ono3d.color=0x7f00ff00;
		for(var i=1;i<zanki;i++){
			drawRect();
			ono3d.translate(-3,0,0);
		}
		break;
	}
	return defObj;
}

var oTitle= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		bgm.volume=0.1;
		bgm.pause();
		break;
	case Objman.MOVE:
		if(Util.keyflag[4] && !Util.keyflagOld[4]){
			objman.deleteObj(o);
			pSystem=objman.createObj(oSystem);
		}
		break;
	case Objman.DRAW:
		ono3d.color=0x7fffffff;
		ono3d.loadIdentity();
		ono3d.translate(5.5,3,12);
		drawText("TESTG");
		if(o.t>>5&1){
			ono3d.translate(0,-20,16);
			drawText("PUSH Z");
		}
		ono3d.pop();
		ono3d.push();
		break;
	}
	return defObj;
}
var cons
,canvasr
,ctxr;
var mainfunc=(function(){
	var oldTime = 0
		,mseccount=0
		,mspf =0
		,framecount=0
		,fps=0
	return function(){
		Util.canvas.hidden=true
		var nowTime = new Date()
		var n=2,i
		if(global_param.fps==60){
			n=1;
		}
	
		ono3d.rf=0;
		ono3d.rf|=Ono3d.RF_DEPTHTEST | Ono3d.RF_PERSCOLLECT;
		for(i=n;i--;){
			objman.move()
		}
		Ono3d.setDrawMethod(global_param.drawmethod)

		ono3d.setPers(9/16*viewscale,1*viewscale);

		var objs=objman.objs;
		var obj;
		if(global_param.sisa=="cross"){
			sisa=4;
		}else if(global_param.sisa=="parallel"){
			sisa=-4;
		}else{
			sisa=0;
		}
		if(sisa!=0){
			ono3d.clear()
			ono3d.loadIdentity()
			ono3d.translate(-burep[0]+sisa,-burep[1],-burep[2])
			for(i = Objman.OBJ_NUM; i--;){
				obj=objs[i]
				if(!obj.flg)continue
				ono3d.push();
				obj.fnc(obj,Objman.DRAW,0)
				ono3d.pop();
			}
			ono3d.render(ctxr);
			if(global_param.drawmethod==9){
				ctxr.putImageData(imagedata,0,0);
			}
		}
		if(global_param.sisa=="cross"){
			sisa=-4;
		}else if(global_param.sisa=="parallel"){
			sisa=4;
		}else{
			sisa=0;
		}
		ono3d.clear()
		ono3d.loadIdentity()
		ono3d.translate(-burep[0]+sisa,-burep[1],-burep[2])
		for(i = Objman.OBJ_NUM; i--;){
			obj=objs[i]
			if(!obj.flg)continue
			ono3d.push();
			obj.fnc(obj,Objman.DRAW,0)
			ono3d.pop();
		}
		ono3d.render(Util.ctx);
		if(global_param.drawmethod==9){
			Util.ctx.putImageData(imagedata,0,0);
		}


		mseccount += (new Date() - nowTime)
		framecount++
		if(nowTime-oldTime > 1000){
			fps = framecount*1000/(nowTime-oldTime)
			if(framecount!=0)mspf = mseccount/framecount
			
			Util.setText(cons,fps.toFixed(2) + "fps " + mspf.toFixed(2) + "msec")
	
			framecount = 0
			mseccount=0
			oldTime = nowTime
		}
		Util.canvas.hidden=false
	}
})()
	var deleteModel=ret.deleteModel=function(f){
		if(objcube)objman.deleteObj(objcube)
	}

	ret.init=function(){
		var cookie=document.cookie;
		var args;
		var i;
		if(cookie != null){
			args=cookie.split(";")
			for(i=args.length;i--;){
				args[i]=args[i].replace(/^\s+|\s+$/g, "");
				var arg=args[i].split("=")
				if(arg.length >1){
					if(!isNaN(arg[1]) && arg[1]!=""){
						global_param[arg[0]] = +arg[1]
					}else{
						global_param[arg[0]] = decodeURIComponent(arg[1]) ;
					}
				}else{
					global_param["no"]=arg[0]
				}
			}
		}
		if(global_param["id"] == null){
			var id="";
			var chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			var charslen=chars.length;
			for(i=30;i--;){
				id+=chars.charAt(rnd()*charslen|0);
			}
			document.cookie="id="+id;
			global_param["id"]=id;
		}
		if(global_param["nm"]!=null){
			document.getElementById("name").value=global_param["nm"];
		}

		var url=location.search.substring(1,location.search.length)
		args=url.split("&")

		for(i=args.length;i--;){
			var arg=args[i].split("=")
			if(arg.length >1){
				if(!isNaN(arg[1]) && arg[1]!=""){
					global_param[arg[0]] = +arg[1]
				}else{
					global_param[arg[0]] = arg[1]
				}
			}else{
				global_param["no"]=arg[0]
			}
		}
		cons = document.getElementById("cons")
		elemScore=document.getElementById("score");
		canvasr=document.getElementById("maincanvasR");
		ctxr=canvasr.getContext("2d");

		loadScore();
		
		objman= new Objman()
		ono3d = new Ono3d()
		O3o.setOno3d(ono3d)

		camerap[2]=-75;
		viewscale=2;
		if(global_param.sisa){
			var width=document.getElementById("maincanvas").width;
			document.getElementById("rittai").style.display="inline";
			document.getElementById("maincanvas").width=width>>1;
			document.getElementById("maincanvasR").width=width>>1;
			Util.ctx=document.getElementById("maincanvas").getContext("2d");
			ctxr=document.getElementById("maincanvasR").getContext("2d");
		}else{
			document.getElementById("rittai").style.display="none";
		}
		//imagedata = Util.ctx.createImageData(Util.canvas.width,Util.canvas.height)
		imagedata = Util.ctx.createImageData(Util.canvas.width*2,Util.canvas.height)
		ono3d.targetImageData=imagedata;
		ono3d.init(Util.canvas,Util.ctx)
		ono3d.rendercanvas=Util.canvas;
		Ono3d.setDrawMethod(global_param.drawmethod);

		font=Util.loadImage("./data/font.png");
		
		var light = new ono3d.LightSource()
		light.type =Ono3d.LT_DIRECTION
		light.angle[0] = -0.3
		light.angle[1] = -0.4
		light.angle[2] = -0.4
		light.power=1
		Vec3.normalize(light.angle)
		ono3d.lightSources.push(light)
		light1=light;
		light = new ono3d.LightSource()
		light.type =Ono3d.LT_AMBIENT
		light.power = 0.4
		ono3d.lightSources.push(light)


		//ono3d.backTexture=back
	
	//	if(global_param.enableGL){
	//		envtex = Util.loadImage("lib/envtex.png",1);
	//	}else{
	//		envtex = Util.loadImage("lib/envtex.png");	
	//	}

	//	onoPhy = new OnoPhy()

		objman.createObj(oTitle);

		if(global_param.fps!=60){
			global_param.fps=30;
		}

		Util.setFps(global_param.fps,mainfunc)
		Util.fpsman()
	}
	return ret;
})()
var jsonobj;
var loadScore=function(id,name,score){

	var url="http://qeouo.5com.info/stg/score.php?"+ new Date()
	if(id){
		url+="&id="+id;
	}
	if(name){
		name=name.replace(/,/g,"");
		name = encodeURIComponent(name);
		url+="&name="+name;
		document.cookie="nm="+name;
	}
	if(score){
		url+="&score="+score;
	}

	jsonobj= document.createElement("script");
	jsonobj.type="text/javascript";
	jsonobj.src=url;

	document.head.appendChild(jsonobj);
}
var scoreboard=function(v){
	var name;
	var scorestr= "";
	scorestr= "<BR>SCORE BOARD<BR>";
	for(i=0;i<v.length;i++){
		var s=v[i];
		if(s.id==global_param["id"]){
			scorestr+="<span style='color:red;font-weight:bold;'>";
		}else{
			scorestr+="<span>";
		}
		name=decodeURIComponent(s.name) ;
		name=name.replace(/</g,"&lt;");
		name=name.replace(/>/g,"&gt;");
		name=name.replace(/\"/g,"&quot;");
		name=name.replace(/'/g,"&lsquo;");
		scorestr+=""+(i+1) + "_" + name+"_" + s.score; 
		scorestr+="</span>";
		scorestr+="<br>"; 
	}
	var elemScore=document.getElementById("score");
	elemScore.innerHTML=scorestr;

	document.head.removeChild(jsonobj);
};
