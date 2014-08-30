"use strict"
var global_param = new Object()
var Util=(function(){
	
	var myIE = document.all             // IE

	var ret =function(){}

	var lIcount =0
	,imagedatacanvas
	,imagedatacontext
	
	,fps=30
	,spf=0
	,nextsleep=0
	,fpserror=0
	,fpserrordelta=0
	,mainfunc
	
	,SCREEN_W
	,SCREEN_H
	,keymap=new Array(256)
	,i=0;
	
	
	keymap[37]=i++;
	keymap[38]=i++;
	keymap[39]=i++;
	keymap[40]=i++;
	keymap['Z'.charCodeAt(0)]=i++;
	keymap['X'.charCodeAt(0)]=i++;
	keymap['C'.charCodeAt(0)]=i++;
	keymap['W'.charCodeAt(0)]=i++;
	keymap['A'.charCodeAt(0)]=i++;
	keymap['S'.charCodeAt(0)]=i++;
	keymap['D'.charCodeAt(0)]=i++;
	
	ret.ctx=null
	ret.canvas=null
	ret.cursorX=0
	ret.cursorY=0
	ret.wheelDelta=0
	ret.pressOn=0
	ret.pressCount=0
	ret.pressOnRight=0
	ret.pressCountRight=0
	ret.oldcursorX=0
	ret.oldcursorY=0
	ret.screenscale=1
	ret.tap=0
	ret.keyflag=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	ret.keyflagOld=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	ret.keymap=keymap
	

	ret.createCanvas= function(width,height){
		var canvas= document.createElement("canvas")
		if(typeof G_vmlCanvasManager !== 'undefined'){
			canvas = G_vmlCanvasManager.initElement(canvas);
		}
		canvas.setAttribute('width',width)
		canvas.setAttribute('height',height)
		return canvas
	}
	var mainloop=function(){
		var dx,dy
		ret.tap=0
	
		if(ret.pressOn){
			ret.pressCount = ret.pressCount + 1
			if(ret.pressCount==1){
	
				ret.oldcursorX2= ret.cursorX
				ret.oldcursorY2= ret.cursorY
				ret.oldcursorX = ret.cursorX
				ret.oldcursorY = ret.cursorY
			}
		}else if(ret.pressCount > 0){
			
			dx=ret.cursorX-ret.oldcursorX2
			dy=ret.cursorY-ret.oldcursorY2
			if(ret.pressCount<10 && dx*dx+dy*dy<16){
				ret.tap=1
			}
			ret.pressCount = -1
			
		}else ret.pressCount = 0
		if(ret.pressOnRight){
			ret.pressCountRight += 1
		}else{
			ret.pressCountRight =0
		}
		
		if(ret.pressCount==1){
			ret.keyflag[4]=1;
		}
		if(ret.pressCount==-1){
			ret.keyflag[4]=0;
		}
		//if(lIcount ==0){
			mainfunc()
		//}
		ret.oldcursorX = ret.cursorX
		ret.oldcursorY = ret.cursorY
		
		var i 
		for(i=ret.keyflag.length;i--;){
			ret.keyflagOld[i]=ret.keyflag[i]
		}

	}
	
	ret.loadImage=function(url,norepeat,func){
		var image = new Image()
		if(func){
			image.onload =  function(e){
				image.pat =ret.ctx.createPattern(image,"no-repeat")

				imagedatacontext.clearRect(0,0,imagedatacanvas.width,imagedatacanvas.height);
				imagedatacontext.drawImage(image,0,0)
				if(imagedatacontext.getImageData)
				image.imagedata = imagedatacontext.getImageData(0,0,image.width,image.height)
				lIcount--
				func(image);
				if(global_param.enableGL){
					image.gltexture = Rastgl.setTexture(image);
				}
			}
		}else if(norepeat){
			image.onload =  function(e){
				image.pat =ret.ctx.createPattern(image,"no-repeat")

				imagedatacontext.clearRect(0,0,imagedatacanvas.width,imagedatacanvas.height);
				imagedatacontext.drawImage(image,0,0)
				if(imagedatacontext.getImageData)
				image.imagedata = imagedatacontext.getImageData(0,0,image.width,image.height)
				if(global_param.enableGL){
					image.gltexture = Rastgl.setTexture(image);
				}
				lIcount--
			}
		}else{
			image.onload =  function(e){
				image.pat =ret.ctx.createPattern(image,"repeat")
					
				imagedatacontext.drawImage(image,0,0)
				if(imagedatacontext.getImageData)
				image.imagedata = imagedatacontext.getImageData(0,0,image.width,image.height)
				if(global_param.enableGL){
					image.gltexture = Rastgl.setTexture(image);
				}
				lIcount--
			}
		}
		image.onerror=function(){
			lIcount--
		}

		var flg=true
		if(global_param.files)
		for (var i = 0, f; f = global_param.files[i]; i++) {
			if(escape(f.name)==url){
				var reader = new FileReader()
				
				reader.onload =  function(e){
					var buf=e.target.result
					image.src=buf
				}
				reader.readAsDataURL(f)
				flg=false
				break
			}
		}
		if(flg){
			image.src = url
		}
		
		lIcount++
		return image
	}

	ret.rgb=function(r,g,b){
		r = (0x100|r*255).toString(16)
		g = (0x100|g*255).toString(16)
		b = (0x100|b*255).toString(16)
		return "#" + r.slice(-2) + g.slice(-2) + b.slice(-2)
	}
	ret.rgba=function(r,g,b,a){
		return 'rgba(' +r +','+ g +','+ b +','+ a+')'
	}
		
	var createXMLHttpRequest=ret.createXMLHttpRequest = function() {
	  if (window.XMLHttpRequest) {
	    return new XMLHttpRequest()
	  } else if (window.ActiveXObject) {
	    try {
	      return new ActiveXObject("Msxml2.XMLHTTP")
	    } catch (e) {
	      try {
	        return new ActiveXObject("Microsoft.XMLHTTP")
	      } catch (e2) {
	        return null
	      }
	    }
	  } else {
	    return null
	  }
	}
	ret.init=function(){

		ret.canvas = document.getElementById('maincanvas')
		if( !ret.canvas || !ret.canvas.getContext){
			return false
		}
		
		SCREEN_W = ret.canvas.getAttribute('width')
		SCREEN_H = ret.canvas.getAttribute('height')

		//document.body.appendChild(canvas)
		ret.ctx = ret.canvas.getContext('2d')
		ret.ctx.clearRect(0,0,SCREEN_W,SCREEN_H)

		imagedatacanvas =ret.createCanvas(512,512)
		imagedatacontext = imagedatacanvas.getContext('2d')
		
		var inputarea = document.getElementById("inputarea")

		inputarea.onselect=function(){return false;}
		inputarea.onselectstart=function(){return false;}
		
		if (navigator.userAgent.match(/iPhone/i)
		||navigator.userAgent.match(/iPod/i) ){
			inputarea.ontouchmove = function(e) {
				e.preventDefault()
				ret.cursorX = e.touches[0].pageX/ret.screenscale
				ret.cursorY = e.touches[0].pageY/ret.screenscale
			}

			inputarea.ontouchstart = function(e){
				//var rect = ret.canvas.getBoundingClientRect()
				e.preventDefault()
				ret.cursorX = e.touches[0].pageX/ret.screenscale// - rect.left
				ret.cursorY = e.touches[0].pageY/ret.screenscale// - rect.top

				ret.pressOn = 1
			}

			inputarea.ontouchend = function(e){
				ret.pressOn = 0
			}

		}else{
			if(myIE){
				inputarea.onmousemove = function(){
					var e = window.event
					var rect = ret.canvas.getBoundingClientRect()
					ret.cursorX = (e.clientX -rect.left)//*SCREEN_W/(rect.right-rect.left)
					ret.cursorY = (e.clientY - rect.top)//*SCREEN_H/(rect.bottom-rect.top)
				}
			}else{
				inputarea.onmousemove = function(e){

					var rect =  ret.canvas.getBoundingClientRect()
					ret.cursorX = (e.clientX -rect.left)//*SCREEN_W/(rect.right-rect.left)
					ret.cursorY = (e.clientY - rect.top)//*SCREEN_H/(rect.bottom-rect.top)

				}
			}
			var wheelfunc = function(e){
				if(window.event) e = window.event
				if(e.wheelDelta){
					ret.wheelDelta = e.wheelDelta/120
					if(window.opera) ret.wheelDelta = -ret.wheelDelta
				}else if(e.detail){
					ret.wheelDelta = -e.detail/3
				}

				if (e.preventDefault)
					e.preventDefault()
				//e.returnValue = false
			}
			if(window.addEventListener) window.addEventListener('DOMMouseScroll',wheelfunc,false)
			if(document.attachEvent) document.attachEvent('onmousewheel',wheelfunc)
			inputarea.onmousewheel = wheelfunc
				
			var leftbutton=0
			,rightbutton=2
			if(myIE)leftbutton=1
			inputarea.onmousedown = function(e){
				if(window.event) e = window.event
				switch(e.button){
				case leftbutton:
					ret.pressOn = 1
					break
				case rightbutton:
					ret.pressOnRight=1
					break
				}
			}
			inputarea.onmouseup = function(e){
				if(window.event) e = window.event
				switch(e.button){
				case leftbutton:
					ret.pressOn = 0
					break
				case rightbutton:
					ret.pressOnRight=0
					break
				}
			}

			window.onkeydown = function(e){
				if(window.event) e = window.event
				var code = e.keyCode
				if(ret.keymap[code]!=null){
					ret.keyflag[ret.keymap[code]]=1
				}
				return false;
			}
			window.onkeyup = function(e){
				if(window.event) e = window.event
				var code = e.keyCode
				if(ret.keymap[code]!=null){
					ret.keyflag[ret.keymap[code]]=0
				}
				return false;
			}
		}
	}
	ret.setFps=function(argfps,mf){
		var i
		
		fps=argfps|0
		spf=(1000/fps)|0
		fpserror = 0
		fpserrordelta= 1000%fps
		nextsleep=new Date()|0
		mainfunc=mf
	
		ret.pressCount = 0
		

	}
	
	var fpsman = ret.fpsman= function(){
		var nowTime = new Date()|0
		var dt = nextsleep - nowTime


//		if(0<dt>>1){
//			setTimeout(fpsman,dt>>1)
//			return
//		}
		
		fpserror +=fpserrordelta
		if(dt>spf)dt=spf
		if(dt<-spf)dt=-spf
		if(fpserror>=fps){
			fpserror-=fps
			dt+=1
		}
		
		nextsleep = nowTime + spf + dt
		mainloop()
		nowTime = new Date()|0
		dt=nextsleep-nowTime
		if(dt<=0)dt=1
		setTimeout(fpsman,dt)

	}
	ret.drawText=function(target,x,y,text,img,sizex,sizey){
	
		var dx = x
		var dy = y
		var i,max
		var sx,sy
		for(i=0,max=text.length;i<max;i++){
			sx = text.charCodeAt(i)-32
			sy = (sx>>4) * sizex
			sx =(sx & 0xf) * sizey
			target.drawImage(img,sx,sy,sizex,sizey,dx,dy,sizex,sizey)
			dx = dx + sizex
		}
	}
	ret.convertURLcode =function(str){
		var imax=str.length
		,jmax
		,i,j
		,charcode
		,percent='%'.charCodeAt(0)
		,decode=""
		,sub
		for(i=0;i<imax;i++){
			charcode=str.charCodeAt(i)
			if(charcode==percent){
				i++
				charcode = parseInt(str.slice(i,i+2),16)
				if((charcode&0xF0)==0xE0){
					jmax=2
					charcode=charcode&0xf
				}else if((charcode&0xE0)==0xC0){
					jmax=1
					charcode=charcode&0x1f
				}else {
					jmax=0
				}
				i+=1
				for(j=0;j<jmax;j++){
					i+=2
					charcode<<=6
					charcode |= parseInt(str.slice(i,i+2),16)&0x3f
					i+=1
				}
			}
			decode+=String.fromCharCode(charcode)
		}
		return decode
	}
	
//	if(window.addEventListener) window.addEventListener('load',init,false)
//	if(window.attachEvent) window.attachEvent('onload', init)

	ret.fireEvent = function (elem,eventname){
		if(document.all){
			elem.fireEvent("on"+"change")
		}else{
			var evt = document.createEvent("MouseEvents");
			evt.initMouseEvent(eventname,true,false,window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			elem.dispatchEvent(evt)
		}
	}
	ret.setText = function(elem,text){
		if(elem.textContent){
			elem.textContent=text
		}else if(elem.innerText){
			elem.innerText=text
		}else{
			elem.innerHTML=text
		}
	}
	ret.getText = function(elem){
		return (elem.textContent)?elem.textContent:elem.innerText
	}
	ret.load=function(url,fnc){
		var request = createXMLHttpRequest()
		request.open("GET", url, true)
		request.onload=function(e){
			if(fnc){
				fnc(request.responseText);
			}
		}
		request.send("")
	}
	return ret
})()



