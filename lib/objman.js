"use strict"
var Objman=(function(){

	var OBJ_NUM = 1024
	var Obj = (function(){
		var ret=function(){
			this.fnc=null;
			this.t =0;
			this.p = new Vec3();
			this.p2 = new Vec3();
			this.v = new Vec3();
			this.a = 0;
			this.hitarea=[0,0,0,0];
			this.ptn=0
			this.flg=0
			this.id=0
			this.z = 0
			this.kind=0;
			this.g=false;
		}
		return ret
	})()

	var i=0
		,CREATE=i++
		,MOVE=i++
		,MOVE2=i++
		,DRAW=i++
		,HIT=i++
		,DESTROYED=i++
		,SETHITAREA=i++
		,DELETE=i++
	;
	i=0
	var T_NONE=i++
		,T_JIKI=i++
		,T_SHOT=i++
		,T_ENEMY=i++
		,T_G_ENEMY=i++
		,T_BULLET=i++
	;
	var hitmap=[0
		,(1<<T_ENEMY)|(1<<T_BULLET)
		,(1<<T_ENEMY)|(1<<T_G_ENEMY)
		,(1<<T_SHOT)|(1<<T_JIKI)
		,(1<<T_SHOT)
		,(1<<T_JIKI)
		];
	var ret = function(){
		var i
		var objs=null
		var ID=0
		objs= new Array(OBJ_NUM)
		for(i = objs.length;i--;){
			objs[i] = new Obj()
		}
		this.objs=objs
		
		
		this.createObj = function(fnc){
			var i
			var obj
			var objs=this.objs
			for(i=OBJ_NUM;i--;){
				if(objs[i].flg)continue
				obj=objs[i]
				obj.flg=1
				obj.t=0
				obj.ptn=0
				obj.id=ID
				obj.val=0
				obj.z=0
				obj.hp=1
				obj.fnc=fnc;
				obj.kind=T_NONE;
				Vec3.set(obj.hitarea,0,0,0);
				obj.hitarea[3]=0;
				Vec3.set(obj.p,0,0,0);
				Vec3.set(obj.p2,0,0,0);
				Vec3.set(obj.v,0,0,0);
				obj.gflg=0;
				obj.id=ID;
				obj.fnc(obj,CREATE,0)
				ID++
				if(ID>=10000)ID=1;
				return objs[i]
			}
			return null
		}
		this.deleteObj = function(obj){
			obj.fnc(obj,DELETE,0);
			obj.fnc=null
			obj.flg = 0
			obj.kind=0
			obj.id=-1;
		}
		this.move = function(){
			var obj,i,j,obj2
			var objs=this.objs

			qSort(objs,0,OBJ_NUM-1)
			for(i=OBJ_NUM;i--;){
				obj=objs[i]
				if(!obj.flg)continue
				obj.fnc(obj,SETHITAREA,0)
			}
			for(i=OBJ_NUM;i--;){
				obj=objs[i]
				if(!obj.kind)continue
				var bit=1<<obj.kind;
				for(j=i;j--;){
					obj2=objs[j]
					if(!(hitmap[obj2.kind]&bit))continue
					if(Vec3.distance(obj.hitarea,obj2.hitarea)>obj.hitarea[3]+obj2.hitarea[3])continue
					obj.fnc(obj,HIT,obj2)
					obj2.fnc(obj2,HIT,obj)
				}
			}
			for(i = 0;i < OBJ_NUM ;i++){
				obj=objs[i]
				if(!obj.flg)continue
				obj.t++
				obj.fnc(obj,MOVE,0)
			}
			for(i = 0;i < OBJ_NUM ;i++){
				obj=objs[i]
				if(!obj.flg)continue
				if(obj.hp<=0){
					obj.fnc(obj,DESTROYED,0)
					this.deleteObj(obj);
				}
			}
		}
		this.draw =function (){
			var obj,i,j,obj2
			var objs=this.objs
			for(i = OBJ_NUM; i--;){
				obj=objs[i]
				if(!obj.flg)continue
				obj.fnc(obj,DRAW,0)
			}
		}
	}

	ret.Obj=Obj
	var qSort = function(target,first,last){
		if(last<=first)return
		
		var 
		i=first
		,j=last
		,p=target[last+1+first>>1].zz
		,buf
	
		while(1){
			while(target[i].zz<p)i++
			while(target[j].zz>p)j--
			if(i>=j)break
			buf=target[i]
			target[i]=target[j]
			target[j]=buf
			i++,j--
			if(i>last || j<first)break
		}
	
		qSort(target,first,i-1)
		qSort(target,j+1,last)
		return
	}
	ret.CREATE=CREATE;
	ret.MOVE=MOVE;
	ret.MOVE2=MOVE2;
	ret.DRAW=DRAW;
	ret.HIT=HIT;
	ret.DESTROYED=DESTROYED;
	ret.SETHITAREA=SETHITAREA;
	ret.DELETE=DELETE;

	ret.T_NONE=T_NONE;
	ret.T_ENEMY=T_ENEMY;
	ret.T_G_ENEMY=T_G_ENEMY;
	ret.T_SHOT=T_SHOT;
	ret.T_BULLET=T_BULLET;
	ret.T_JIKI=T_JIKI;

	ret.OBJ_NUM = OBJ_NUM;
	return ret
})()
