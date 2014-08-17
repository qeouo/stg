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
	;

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
var rgb=function(a,r,g,b){
	return (a<<24) + (r<<16) + (g<<8) + b;
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

var drawRect=function(){
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
		if(o.kind==Objman.T_G_ENEMY){
			ono3d.loadIdentity();
			ono3d.translate(-camerap[0],-camerap[1],-camerap[2]);
			ono3d.rotate(-cameraa[1],0,1,0);
			Mat43.dotMat43Vec3(o.hitarea,ono3d.transMat,o.p)
			o.hitarea[0] = o.hitarea[0]*(75/o.hitarea[2]);
			o.hitarea[1] = o.hitarea[1]*(75/o.hitarea[2]);
			o.hitarea[2] = 75;
			Vec3.add(o.hitarea,o.hitarea,camerap);
		}else if(o.kind != Objman.T_NONE){
			o.hitarea[0]=o.p[0]
			o.hitarea[1]=o.p[1]
			o.hitarea[2]=o.p[2]
		}
		break;
	case Objman.HIT:
		o.hp--;
		break;
	case Objman.DESTROYED:
		break;
	};
};
var oFlash= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.z=-0.01;
		break;
	case Objman.MOVE:
		if(o.t>4){
			objman.deleteObj(o);
		}
		break;
	case Objman.DRAW:
		ono3d.translate(o.p[0],o.p[1],o.p[2]+o.z);
		ono3d.color=0x7fffffff;
		var s=4.1-o.t;
		ono3d.scale(s,s,s);
		drawRect();
	}
	return defObj(o,m,p);
};
var oBullet= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hitarea[3]=2;
		o.kind=Objman.T_BULLET;
		o.z=-0.01;
		break;
	case Objman.MOVE:
		if(o.p[1]*o.p[1]+o.p[0]*o.p[0]>(80*80)){
			objman.deleteObj(o);
		}
		if(o.ptn==0){
			if(o.t<4){
				o.ptn=1;
				o.t=0;
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
		var s=(o.t&3)*0.33;
		ono3d.rotate(o.t*0.5,0,0,1);
		ono3d.color= rgb(0x7f,0xff-0x90*s,0x0,0xff-0x0*s);
		ono3d.scale(2,1.25,1);
		ono3d.rotate(Math.PI*0.25,0,0,1);
		drawRect();
		ono3d.color= rgb(0x7f,0x0,0x0,0xf0);
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
		Vec3.mult(o.v,o.v,0.8);
		if(o.t>=30){
			objman.deleteObj(o);
		}
		break;
	case Objman.DRAW:
		var rto=o.t/30;
		var a=0x7f
		if(o.t>10){
			a=0x7f+(0x00-0x7f)*(o.t-10)/20
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
		break;
	case Objman.MOVE:
		o.v[2]+=1;
		
		Vec3.mult(o.v,o.v,0.9);
		createBullet(oExplosion_1,o.p,0,0);
		if(o.t>10){
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
		createBullet(oExplosion_1,o.p,rnd()*4096,4);
		if(o.t>4){
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
		break;
	case Objman.MOVE:
		if(o.t%4==0){
			o.hp--;
			var obj;
			if(o.p[0]<0){
				obj=createBullet(oSmallEnemy,o.p,0,4);
			}else{
				obj=createBullet(oSmallEnemy,o.p,2048,4);
			}
			Vec3.set(obj.p2,o.p2[0],o.p2[1],o.p2[2]);
			o.p2[1]+=4
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
		createPerticle(oExplosion2,o.p,ang,1.,8);
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
			Vec3.mult(o.v,o.v,0.9);
			Vec3.sub(bufvec,o.p2,o.p);
			
			if(Math.abs(bufvec[2])<1){
				o.ptn=1;
				o.t=0;
				Vec3.set(o.v,0,-0.8,0);
			}else{
				Vec3.mult(bufvec,bufvec,0.01);
				Vec3.add(o.v,o.v,bufvec);
			}
		}else{
			
			if(o.t==20){
				createBullet(oBullet,o.p,nerai(o.p)+rnd2()*256,2);
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

		ono3d.color=rgb(a*zz,r*z,g*z,b*z);
		ono3d.translate(o.p[0],o.p[1],o.p[2]+o.z+Math.sin(o.t*0.3)*2);
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
			Vec3.mult(o.v,o.v,0.6);
			Vec3.sub(bufvec,o.p2,o.p);
			
			if(Math.abs(bufvec[2])<1){
				o.ptn=1;
				o.t=0;
				Vec3.set(o.v,0,-0.4,0);
			}else{
				Vec3.mult(bufvec,bufvec,0.03);
				Vec3.add(o.v,o.v,bufvec);
			}
		}else{
			if(o.t%20==0 && o.t<100){
				for(var i=-1;i<2;i++){
					createBullet(oBullet,o.p,nerai(o.p)+64*i,2);
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
var oSmoke = function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.hp=1;
		Vec3.set(o.v,0,scrollSpeed,0);
		break;
	case Objman.MOVE:

		if(o.t>=20){
			objman.deleteObj(o);
		}
		break;
	case Objman.DESTROYED:
		break;
	case Objman.DRAW:
		var s=o.t/20;
		ono3d.color=rgb(0x7f-(0x7f*s),0x66,0x33,0x00);
		ono3d.rotate(-cameraa[1],0,1,0);
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
		return defObj(o,m,p);
		break;
	case Objman.MOVE:
		if(o.ptn==0){
			Vec3.mult(o.v,o.v,0.9);
			Vec3.sub(bufvec,o.p2,o.p);
			
			if(Vec3.scalar(bufvec)<1){
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

			Vec3.set(o.v,Math.sin(o.t*0.1),0,0);

			var obj=objman.createObj(oSmoke);
			Vec3.set(obj.p,o.p[0]+7,o.p[1]-16,o.p[2]+2);
			obj.a=o.t
			obj=objman.createObj(oSmoke);
			Vec3.set(obj.p,o.p[0]-7,o.p[1]-16,o.p[2]+2);
			obj.a=o.t

			var da=(nerai(o.p)-o.a+4096)%4096;
			if(da>2048)da-=4096;
			if(da<-2048)da+=4096;
			o.a+=da*0.1;
		}
		break;
	case Objman.DESTROYED:
		Vec3.set(o.p,o.p[0],o.p[1],o.p[2]);
		break;
	case Objman.DRAW:
		ono3d.color=0x7f339933;
		ono3d.rotate(-cameraa[1],0,1,0);
		ono3d.translate(o.p[0],o.p[1],o.p[2]+(o.t&1)*2);
		ono3d.push();
		ono3d.translate(0,4,2);
		ono3d.scale(10,16,1);
		drawRect();
		ono3d.pop();
		
		ono3d.color=0x7f99cc99;
		ono3d.rotate(o.a/2048*Math.PI,0,0,1);
		ono3d.push();
		ono3d.scale(6,6,1);
		drawRect();
		ono3d.pop();

		ono3d.translate(0,0,0.1);
		ono3d.color=0x7f006633;
		ono3d.scale(4,2,1);
		ono3d.translate(2,0,0);
		drawRect();
		break;
	}
	return oEnemy(o,m,p);
};
var pJiki
,pSystem
	;
var objJiki=function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.z=3
		o.kind=Objman.T_JIKI;
		break;
	case Objman.MOVE:
		if(o.ptn==0){
			if(o.t==1){
				o.p[1]=-60;
				Vec3.set(o.v,0,0,0);
			}

			if(o.t==20){
				Vec3.set(o.v,0,3,0);
			}
			Vec3.mult(o.v,o.v,0.95);
			
			o.kind=Objman.T_NONE;
			if(o.t>=40){
				o.ptn=1;
				o.t=0;
			}
		}else if(o.ptn==1){
			if(o.t==30){
				o.kind=Objman.T_JIKI;
			}
			Vec3.set(o.v,0,0,0);
			if(Util.keyflag[0]){ o.v[0]=2; }
			if(Util.keyflag[2]){ o.v[0]=-2; }
			if(Util.keyflag[1]){ o.v[1]=2; }
			if(Util.keyflag[3]){ o.v[1]=-2; }

			if(o.t%4==0 && Util.keyflag[4]){
				var obj=createBullet(oShot,o.p,1024,6);
				obj.p[2]+=0.1
			}
		}
		break;
	case Objman.HIT:
		o.ptn=0;
		o.t=0;
		o.p[1]=-50;
		if(o.hp==1){
			pSystem.ptn=1;
		}
		break;
	case Objman.DRAW:
		if(o.kind == Objman.T_NONE){
			if(o.t&1){
				return;
			}
		}
		ono3d.translate(o.p[0],o.p[1],o.p[2]);
		ono3d.rotate(-o.v[0]*0.1,0,1,0);
		ono3d.scale(3,3,1);

		ono3d.color=0x7fff0000;
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

}
var createBullet = function(fnc,p,a,s){
	var obj = objman.createObj(fnc);
	if(obj==null)return;
	Vec3.set(obj.p,p[0],p[1],p[2]);
	obj.v[0] = Math.cos(a/2048*Math.PI)
	obj.v[1] = Math.sin(a/2048*Math.PI)
	obj.v[2] = 0;
	Vec3.mult(obj.v,obj.v,s);
	return obj;
}
var scrollSpeed=-8;
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
var oStage= function(o,m,p){
	switch(m){
	case Objman.CREATE:
		//Vec3.set(camerap,0,0,0);
		//Vec3.set(cameraa,0,0,0);
		Vec3.set(o.p,0,0,0);
		break;
	case Objman.MOVE:
		if(o.t%20==0){
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
		if(o.t%60==0){
			var obj;
			obj=objman.createObj(oTank);
			Vec3.set(obj.p2,rnd2()*30,100+rnd2()*30,90);
			Vec3.set(obj.p,-fugo(obj.p2[0])*100,obj.p2[1]-20,90);
		}
		if(o.t%150==0){
			var obj=objman.createObj(oEnemies);
			Vec3.set(obj.p,fugo(rnd()-0.5)*50,0,-50);
			if(obj.p[0]<0){
				Vec3.set(obj.p2,rnd()*30,50,0);
			}else{
				Vec3.set(obj.p2,rnd()*-30,50,0);
			}
			obj.hp=6;
		}
		if(o.t%400==1){
			var obj=objman.createObj(oMiddleEnemy);
			Vec3.set(obj.p2,rnd2()*50,50,0);
			Vec3.set(obj.p,-fugo(obj.p2[0])*50,50,50);
		}
		break;
	case Objman.DRAW:
		ono3d.rotate(-cameraa[1],0,1,0);
		ono3d.translate(0,0,100);
		ono3d.translate(0,o.t*scrollSpeed%64,0);
		ono3d.scale(160,16,1);
		ono3d.translate(0,2*10,0);
		for(i=0;i<10;i++){
			ono3d.color=0x7f336633;
			ono3d.translate(0,-2,0);
			drawRect();
			ono3d.color=0x7f666633;
			ono3d.translate(0,-2,0);
			drawRect();
		}
		break;
	}
	return defObj;
}
var oSystem=function(o,m,p){
	switch(m){
	case Objman.CREATE:
		o.z=-10;
		objman.createObj(oStage);
		pJiki=objman.createObj(objJiki);
		Vec3.set(pJiki.p,0,-50,0);
		pJiki.hp=3;
		break;
	case Objman.MOVE:
		camerap[0]=pJiki.p[0]*0.5;
		cameraa[1]=pJiki.p[0]*0.005;
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
			objman.createObj(objTitle);
		}
		break;
	case Objman.DRAW:
		ono3d.translate(camerap[0],camerap[1],camerap[2])
		ono3d.translate(25,55,70);
		ono3d.scale(2,2,1);
		ono3d.color=0x7fffffff;
		for(var i=1;i<pJiki.hp;i++){
			drawRect();
			ono3d.translate(-3,0,0);
		}

		break;
	}
	return defObj;
}

var objTitle= function(o,m,p){
	switch(m){
	case Objman.CREATE:
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
		ono3d.translate(0,2,9);
		ono3d.scale(2,0.5,1);
		drawRect();
		ono3d.pop();
		ono3d.push();
		ono3d.translate(0,0,10+0.1);
		ono3d.color=0x7f000000;
		drawRect();
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
		var n=1,i
	
		ono3d.rf=0;
		ono3d.rf|=Ono3d.RF_DEPTHTEST | Ono3d.RF_PERSCOLLECT;
		for(i=n;i--;){
			objman.move()
		}
		Ono3d.setDrawMethod(global_param.drawmethod)

		ono3d.setPers(9/16*viewscale,1*viewscale);
		ono3d.clear()
		ono3d.loadIdentity()
		ono3d.translate(-burep[0],-burep[1],-burep[2])
		var objs=objman.objs;
		var obj;
		for(i = Objman.OBJ_NUM; i--;){
			obj=objs[i]
			if(!obj.flg)continue
			ono3d.push();
			obj.fnc(obj,Objman.DRAW,0)
			ono3d.pop();
		}
		ono3d.render(Util.ctx);
		Util.ctx.putImageData(imagedata,0,0);

//		ono3d.clear()
//		ono3d.loadIdentity()
//		ono3d.translate(-camerap[0]-4,-camerap[1],-camerap[2])
//		var objs=objman.objs;
//		var obj;
//		for(i = Objman.OBJ_NUM; i--;){
//			obj=objs[i]
//			if(!obj.flg)continue
//			ono3d.push();
//			obj.fnc(obj,Objman.DRAW,0)
//			ono3d.pop();
//		}
//		ono3d.render(Util.ctx);
//		ctxr.putImageData(imagedata,0,0);

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
		cons = document.getElementById("cons")
		canvasr=document.getElementById("maincanvas_R");
		ctxr=canvasr.getContext("2d");
		
		objman= new Objman()
		ono3d = new Ono3d()
		O3o.setOno3d(ono3d)
		ono3d.init(Util.canvas,Util.ctx)
		ono3d.rendercanvas=Util.canvas;

		camerap[2]=-75;
		viewscale=2;
		Ono3d.setDrawMethod(global_param.drawmethod)
		if(global_param.drawmethod==3){
			document.getElementById("maincanvas2").style.display="inline";
			document.getElementById("maincanvas").style.display="none";
		}else{
			document.getElementById("maincanvas").style.display="inline";
			document.getElementById("maincanvas2").style.display="none";
		}
		//model=O3o.load("./data/dice.mqo");
		
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

		imagedata = Util.ctx.createImageData(300,400)
		ono3d.targetImageData=imagedata;

		//ono3d.backTexture=back
	
	//	if(global_param.enableGL){
	//		envtex = Util.loadImage("lib/envtex.png",1);
	//	}else{
	//		envtex = Util.loadImage("lib/envtex.png");	
	//	}

	//	onoPhy = new OnoPhy()

		objman.createObj(objTitle);

		Util.setFps(global_param.fps,mainfunc)
		Util.fpsman()
	}


	return ret;
})()
