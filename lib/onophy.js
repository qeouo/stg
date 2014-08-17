"use strict"

var OnoPhy = (function(){
	var PhyObj = function(){
		this.matrix = new Mat43()
		this.v = new Vec3()
		this.type = 0
		this.fix=0
	}
	var SpringMesh =  function(vertexsize){
		this.type=SPRING_MESH
		var pos = new Array(vertexsize)
		var v = new Array(vertexsize)
		var fixes= new Array(vertexsize)
		for(var i=vertexsize;i--;){
			v[i] = new Vec3()
			pos[i] = new Vec3()
			fixes[i]=0
		}
		this.v = v
		this.pos = pos
		this.fixes = fixes
		this.mesh
	}
	var Collision =  function(type){
		this.type=type
		this.v=new Vec3()
		this.pos=new Vec3()
		this.matrix =new Mat43()
		this.imatrix = new Mat43()
		this.fix=0
	}
	var ret = function(){
		this.phyObjs = new Array()
	}
	var i=1
	var SPRING_MESH= i++
	,CUBOID = i++
	,SPHERE = i++
	,ELLIPSE = i++
	,ELLIPSOLID = i++
	,CAPSULE = i++
	,ELLIPSOLID_CAPSULE = i++
	
	ret.SPRING_MESH	= SPRING_MESH
	ret.CUBOID		= CUBOID
	ret.CAPSULE		= CAPSULE
	ret.SPHERE		= SPHERE
	ret.ELLIPSE		= ELLIPSE
	ret.ELLIPSOLID_CAPSULE = ELLIPSOLID_CAPSULE
	
	ret.SpringMesh	= SpringMesh
	ret.Collision	= Collision
	
	var bV0 = new Vec3()
	,bV1 = new Vec3()
	,bV2 = new Vec3()
	,bV3 = new Vec3()
	,bV4 = new Vec3()
	,bM = new Mat43()
	
	,Z_VECTOR=Geono.Z_VECTOR
	,Z_VECTOR_NEG=Geono.Z_VECTOR_NEG
	,ZERO_VECTOR = Geono.ZERO_VECTOR

	ret.prototype= {
		init:function(){
		}
		,createCollision:function(type){
			var res=new Collision(type)
			this.phyObjs.push(res)
			return res
		}		
		,createSpringMesh:function(num){
			var res=new SpringMesh(num)
			this.phyObjs.push(res)
			return res
		}
		,deletePhyObject:function(object){
			phyObjs=this.phyObjs
			for(i=phyObjs.length;i--;){
				if(phyObjs[i]==object){
					splice(i,1)
					break
				}
			}
		}

		,calc:function(dt){
			var i,j,k
			,AIR_DAMPER=Math.pow(0.9,dt) 
			,REFLECT_DAMPER=1-Math.pow(0.01,dt)
			,PENALTY=1000*dt*(1/dt/30)
			,CLOTH_TENSION = 200*dt
			,CLOTH_DAMPER = Math.pow(0.01,dt)
			,GRAVITY = 9.8*dt
			,RESISTANCE = 100*dt
			
			,obj,obj2
			,len
			,x,y,z,nx,ny,nz
			,p0,p1,p2
			,matrix
			,velocity,velocities
			,position,positions
			,vertex,vertices
			,fixes
			,mesh
			,face,faces
			,edges,edge
			,retio,retio2,retiox,retioy,retioz
			,phyObjs=this.phyObjs
			
			for(i = phyObjs.length;i--;){

				obj = phyObjs[i]
				if(obj.type==SPRING_MESH)continue
				if(obj.fix)continue
				matrix=obj.matrix
				matrix[12]+=obj.v[0]*dt
				matrix[13]+=obj.v[1]*dt
				matrix[14]+=obj.v[2]*dt
				Vec3.mult(obj.v,obj.v,AIR_DAMPER)
				obj.v[1]-=GRAVITY

			}
			
			for(i = phyObjs.length;i--;){
				

				var func=this.func
				obj = phyObjs[i]
				if(obj.type==SPRING_MESH){

					mesh = obj.mesh
					vertices = mesh.vertices
					velocities = obj.v
					positions=obj.pos
					fixes=obj.fixes
					edges=mesh.edges
					faces=mesh.faces
	
					for(j=edges.length;j--;){
						edge=edges[j]
						p0=edge.v0
						p1=edge.v1
						Vec3.sub(bV3,positions[p1],positions[p0])
						x=bV3[0]
						y=bV3[1]
						z=bV3[2]
							
						len=x*x+y*y+z*z
						if(!len)continue
						len= (1-
							Math.sqrt(Vec3.len2(vertices[p0].pos,vertices[p1].pos)/len))
							*CLOTH_TENSION
						x*=len
						y*=len
						z*=len
						velocity=velocities[p0]
						velocity[0]+=x
						velocity[1]+=y
						velocity[2]+=z
						velocity=velocities[p1]
						velocity[0]-=x
						velocity[1]-=y
						velocity[2]-=z
						
					}
					for(k = this.phyObjs.length;k--;){
						obj2 = this.phyObjs[k]
						switch(obj2.type){
						case SPHERE:
							matrix=obj2.matrix
							retio2 = matrix[0]*matrix[0]+matrix[1]*matrix[1]+matrix[2]*matrix[2]
							retio=Math.sqrt(retio2)
							
							for(j = faces.length;j--;){
								face = faces[j]
								p0=face.idx[0]
								p1=face.idx[1]
								p2=face.idx[2]
								
								bV0[0] = obj2.matrix[12]
								bV0[1] = obj2.matrix[13]
								bV0[2] = obj2.matrix[14]
								Geono.P2T(bV0,positions[p0],positions[p1],positions[p2])
								x=Geono.sPoint2[0]-Geono.sPoint[0]
								y=Geono.sPoint2[1]-Geono.sPoint[1]
								z=Geono.sPoint2[2]-Geono.sPoint[2]
								len = x*x+y*y+z*z
								if(len>retio2)continue
								
								len = Math.sqrt(len)
								nx=x/len
								ny=y/len
								nz=z/len
								
								len= (retio - len) * PENALTY
								x=nx*len
								y=ny*len
								z=nz*len
								
								velocity = velocities[p0]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len
								
								velocity = velocities[p1]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len
								
								velocity = velocities[p2]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len

							}
							break
						case ELLIPSOLID:
							matrix=obj2.matrix
							retiox = Math.sqrt(matrix[0]*matrix[0]+matrix[1]*matrix[1]+matrix[2]*matrix[2])
							retioy = Math.sqrt(matrix[4]*matrix[4]+matrix[5]*matrix[5]+matrix[6]*matrix[6])
							retioz = Math.sqrt(matrix[8]*matrix[8]+matrix[9]*matrix[9]+matrix[10]*matrix[10])
							
							for(j = faces.length;j--;){
								face = faces[j]
								p0=face.idx[0]
								p1=face.idx[1]
								p2=face.idx[2]
								matrix=obj2.imatrix
								Mat43.dotMat43Vec3(bV0,matrix,positions[p0])
								Mat43.dotMat43Vec3(bV1,matrix,positions[p1])
								Mat43.dotMat43Vec3(bV2,matrix,positions[p2])
							
								Geono.P2T(ZERO_VECTOR,bV0,bV1,bV2)
								x=Geono.sPoint2[0]
								y=Geono.sPoint2[1]
								z=Geono.sPoint2[2]
								len = x*x+y*y+z*z
								if(len>1)continue
								x*=retiox
								y*=retioy
								z*=retioz
								
								Geono.PointEllipsolid(x,y,z,retiox,retioy,retioz)
								nx=Geono.sPoint2[0]
								ny=Geono.sPoint2[1]
								nz=Geono.sPoint2[2]
								
								bV0[0]=(nx- x) /retiox
								bV0[1]=(ny- y) /retioy
								bV0[2]=(nz -z) /retioz
							
								Mat43.dotMat33Vec3(bV0,obj2.matrix,bV0)
								
								x=bV0[0]
								y=bV0[1]
								z=bV0[2]
								
								len = Math.sqrt(x*x+y*y+z*z)
								nx=x/len
								ny=y/len
								nz=z/len
								
								x*=PENALTY*0.1
								y*=PENALTY*0.1
								z*=PENALTY*0.1
								
								velocity = velocities[p0]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len
								
								velocity = velocities[p1]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len
								
								velocity = velocities[p2]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len

							}
							break
						case CAPSULE:

							matrix=obj2.matrix
							Mat43.dotMat43Vec3(bV0,matrix,Z_VECTOR)
							Mat43.dotMat43Vec3(bV1,matrix,Z_VECTOR_NEG)
							retio2=(matrix[0]*matrix[0]+matrix[1]*matrix[1]+matrix[2]*matrix[2])
							retio=Math.sqrt(retio2)
							
							for(j = faces.length;j--;){
								face = faces[j]
								p0=face.idx[0]
								p1=face.idx[1]
								p2=face.idx[2]
								if(Geono.L2T(bV0,bV1,positions[p0],positions[p1],positions[p2])){
									x=Geono.sPoint[0]-Geono.sPoint2[0]
									y=Geono.sPoint[1]-Geono.sPoint2[1]
									z=Geono.sPoint[2]-Geono.sPoint2[2]
									len = x*x+y*y+z*z
									len = Math.sqrt(len)
									nx=x/len
									ny=y/len
									nz=z/len
									len= (retio + len) * PENALTY*0.1
									x=nx*len
									y=ny*len
									z=nz*len
									
								}else{
									x=Geono.sPoint2[0]-Geono.sPoint[0]
									y=Geono.sPoint2[1]-Geono.sPoint[1]
									z=Geono.sPoint2[2]-Geono.sPoint[2]

									len = x*x+y*y+z*z
									if(len>retio2)continue
									len = Math.sqrt(len)
									nx=x/len
									ny=y/len
									nz=z/len
									
									len= (retio - len) * PENALTY*0.1
									x=nx*len
									y=ny*len
									z=nz*len
								}
								

								
								velocity = velocities[p0]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len
								
								velocity = velocities[p1]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len
								
								velocity = velocities[p2]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len
							}
							break
						case ELLIPSOLID_CAPSULE:

							matrix=obj2.matrix
							retiox=Math.sqrt(matrix[0]*matrix[0]+matrix[1]*matrix[1]+matrix[2]*matrix[2])
							retioy=Math.sqrt(matrix[4]*matrix[4]+matrix[5]*matrix[5]+matrix[6]*matrix[6])
							retioz=Math.sqrt(matrix[8]*matrix[8]+matrix[9]*matrix[9]+matrix[10]*matrix[10])
							bM[0]=matrix[0]/retiox
							bM[1]=matrix[1]/retiox
							bM[2]=matrix[2]/retiox
							bM[4]=matrix[4]/retioy
							bM[5]=matrix[5]/retioy
							bM[6]=matrix[6]/retioy
							bM[8]=matrix[8]/retioz
							bM[9]=matrix[9]/retioz
							bM[10]=matrix[10]/retioz
							
							for(j = faces.length;j--;){
								face = faces[j]
								p0=face.idx[0]
								p1=face.idx[1]
								p2=face.idx[2]
								
								matrix=obj2.imatrix
								Mat43.dotMat43Vec3(bV0,matrix,positions[p0])
								Mat43.dotMat43Vec3(bV1,matrix,positions[p1])
								Mat43.dotMat43Vec3(bV2,matrix,positions[p2])
								
								if(Geono.L2T(Z_VECTOR,Z_VECTOR_NEG,bV0,bV1,bV2)){
									Vec3.sub(bV0,Geono.sPoint,Geono.sPoint2)
									bV0[0]*=retiox
									bV0[1]*=retioy
									bV0[2]*=retioz
								}else{
									z=Geono.sPoint2[2]
								
									if(z>1){
										x=Geono.sPoint2[0]
										y=Geono.sPoint2[1]
										z=(z-1)*retioz/retiox
										
										len = x*x+y*y+z*z
										if(len>1)continue
										x*=retiox
										y*=retioy
										z*=retiox
										Geono.PointEllipsolid(x,y,z,retiox,retioy,retiox)
										Vec3.sub(bV0,Geono.sPoint2,Geono.sPoint)
										
									}else if(z<-1){
										x=Geono.sPoint2[0]
										y=Geono.sPoint2[1]
										z=(z+1)*retioz/retiox
										
										len = x*x+y*y+z*z
										if(len>1)continue
										x*=retiox
										y*=retioy
										z*=retiox
										Geono.PointEllipsolid(x,y,z,retiox,retioy,retiox)
										Vec3.sub(bV0,Geono.sPoint2,Geono.sPoint)

									}else{
										x=Geono.sPoint2[0]
										y=Geono.sPoint2[1]
										len = x*x+y*y
										if(len>1)continue
										x*=retiox
										y*=retioy
										Geono.PointEllipse(x,y,retiox,retioy)
										Vec2.sub(bV0,Geono.sPoint2,Geono.sPoint)
										
										bV0[0]=Geono.sPoint2[0]-x
										bV0[1]=Geono.sPoint2[1]-y
										bV0[2]=0
									}
									
								}
								Mat43.dotMat33Vec3(bV0,bM,bV0)
								
								x=bV0[0]
								y=bV0[1]
								z=bV0[2]
								
								len=1/Math.sqrt(x*x+y*y+z*z)
								nx=x*len
								ny=y*len
								nz=z*len
								len = PENALTY*0.1
								x*=len
								y*=len
								z*=len
								
								velocity = velocities[p0]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len
								
								velocity = velocities[p1]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len
								
								velocity = velocities[p2]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len
							}
							break
						case CUBOID:
							matrix=obj2.matrix
							imatrix=obj2.imatrix
							retio2 = matrix[0]*matrix[0]+matrix[1]*matrix[1]+matrix[2]*matrix[2]
							retio=Math.sqrt(retio2)
							
							for(j = faces.length;j--;){
								var flg0,flg1,flg2,flg3

								face = faces[j]
								p0=positions[face.idx[0]]
								p1=positions[face.idx[1]]
								p2=positions[face.idx[2]]
								
								Mat43.dotMat43Vec3(bV0,imatrix,p0)
								if(Math.abs(bV0[0])>1)flg0=1
								if(Math.abs(bV0[1])>1)flg0|=2
								if(Math.abs(bV0[2])>1)flg0|=4
								Mat43.dotMat43Vec3(bV0,imatrix,p1)
								if(Math.abs(bV1[0])>1)flg1|=1
								if(Math.abs(bV1[1])>1)flg1|=2
								if(Math.abs(bV1[2])>1)flg1|=4
								Mat43.dotMat43Vec3(bV0,imatrix,p2)
								if(Math.abs(bV2[0])>1)flg2|=1
								if(Math.abs(bV2[1])>1)flg2|=2
								if(Math.abs(bV2[2])>1)flg2|=4


								//flg=flg2
								//flg2=flg2^flg1
								//flg1=flg^flg0
								//flg0=flg1^flg0


								bV1[0]=0
								bV1[1]=0
								bV1[2]=0

								if(flg0^flg1&1){
									if(flg1&1){
										if(p1[0]>0)x=1
										else x=-1
										Vec3.sub(bV0,p1,p0)
										x=x-p0[0]
										Vec3.mult(bV0,bV0,x)
										Vec3.add(bV0,p0,bV0)
										if(Math.abs(bV0[1])<1 && Math.abs(bV0[2])<1){
											bV1[0]=x
										}
									}
								}


									

								Geono.P2T(bV0,positions[p0],positions[p1],positions[p2])
								bV0[0] = obj2.matrix[12]
								bV0[1] = obj2.matrix[13]
								bV0[2] = obj2.matrix[14]
								Geono.P2T(bV0,positions[p0],positions[p1],positions[p2])
								x=Geono.sPoint2[0]-Geono.sPoint[0]
								y=Geono.sPoint2[1]-Geono.sPoint[1]
								z=Geono.sPoint2[2]-Geono.sPoint[2]
								len = x*x+y*y+z*z
								if(len>retio2)continue
								
								len = Math.sqrt(len)
								nx=x/len
								ny=y/len
								nz=z/len
								
								len= (retio - len) * PENALTY
								x=nx*len
								y=ny*len
								z=nz*len
								
								velocity = velocities[p0]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len
								
								velocity = velocities[p1]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len
								
								velocity = velocities[p2]
								len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
								velocity[0]+=x + nx*len
								velocity[1]+=y + ny*len
								velocity[2]+=z + nz*len

							}
							break
							for(j = positions.length;j--;){
								Mat43.dotMat43Vec3(bV3,obj2.imatrix,positions[j])
								velocity=velocities[j]
								x = Math.abs(bV3[0])
								y = Math.abs(bV3[1])
								z = Math.abs(bV3[2])
								if(x>=1
									|| y>=1
									|| z>=1
								)continue
	
								if(x>y && x>z){
									len = (1-x)*PENALTY
									if(bV3[0]<0)len*=-1
									bV3[0]=len
									bV3[1]=0
									bV3[2]=0
								}else if(y>z){
									len = (1-y)*PENALTY
									if(bV3[1]<0)len*=-1
									bV3[1]=len
									bV3[0]=0
									bV3[2]=0
								}else{
									len = (1-z)*PENALTY
									if(bV3[2]<0)len*=-1
									bV3[2]=len
									bV3[0]=0
									bV3[1]=0
								}
								Mat43.dotMat33Vec3(bV3,obj2.matrix,bV3)
								//Vec3.mult(bV3,bV3,)
								Vec3.add(velocity,velocity,bV3)
							}
							break
						}
					}
					for(j = positions.length;j--;){
						if(fixes[j])continue
						velocity= velocities[j]
						position= positions[j]
						velocity[1]-=GRAVITY
						velocity[0]*=CLOTH_DAMPER
						velocity[1]*=CLOTH_DAMPER
						velocity[2]*=CLOTH_DAMPER
						position[0]+=velocity[0]*dt
						position[1]+=velocity[1]*dt
						position[2]+=velocity[2]*dt
	
					}
					continue
				}
				matrix=obj.matrix

				if(obj.type==ELLIPSE){
					Mat43.getInv(obj.imatrix,obj.matrix)
					matrix=obj.matrix
					var a=Math.sqrt(matrix[0]*matrix[0]+matrix[1]*matrix[1]+matrix[2]*matrix[2])
					,b=Math.sqrt(matrix[4]*matrix[4]+matrix[5]*matrix[5]+matrix[6]*matrix[6])
					,a2=a*a
					,b2=b*b
					,sub=1/(b2-a2)
					,sub2=sub*sub
					,pk1=-a2
					,pk2=-1/2*a2*a2*sub2
					,pk3=a2*b2*sub2
					,qk1=-a2*a2*sub
					,qk2=-a2*a2*b2*sub2*sub
					,rk1=-1/4*a2*a2*a2*sub2
					,rk2=1/4*a2*a2*a2*b2*sub2*sub2
					,rk3=1/16*a2*a2*a2*a2*sub2*sub2
					,x,y
					,B3= a2*sub/2
					Geono.PointEllipseTrue_before(a,b)
					matrix=obj.imatrix
					for(k = phyObjs.length;k--;){
						if(k==i)continue
					
						obj2 = phyObjs[k]
						switch(obj2.type){
						case SPHERE:
							bV0[0]=obj2.matrix[12]
							bV0[1]=obj2.matrix[13]
							bV0[2]=obj2.matrix[14]
							Mat43.dotMat43Vec3(bV0,obj.imatrix,bV0)
							if(Vec3.scalar(bV0)>=1)continue
							bV0[0]*=a
							bV0[1]*=b

							Geono.PointEllipse(bV0[0],bV0[1],a,b)
							Vec3.sub(bV1,Geono.sPoint2,bV0)
							bV1[0]/=a
							bV1[1]/=b
							Mat43.dotMat43Vec3(bV1,obj.matrix,bV1)

							x=bV1[0]
							y=bV1[1]
							z=bV1[2]
							len=Math.sqrt(x*x+y*y+z*z)
							nx=x/len
							ny=y/len
							nz=z/len
							
							
							velocity=obj2.v
							
							len= -(velocity[0]*nx+velocity[1]*ny + velocity[2]*nz)*REFLECT_DAMPER
							velocity[0]+=x*PENALTY + nx*len
							velocity[1]+=y*PENALTY + ny*len
							velocity[2]+=z*PENALTY + nz*len

							
						}
					}

				}
			}

			return
		}
	}
	
	return ret
})()

