var linkprefix = "sfx/"
var linksuffix = ""
var audios = ["refault0.wav","refault1.wav"]
var sfx = {}
var level = [
  [0,0,0,0,0,-1,-1,0],
  [0,-1,0,0,0,-1,-1,0],
  [0,-1,0,1,0,-1,-1,0],
  [0,-1,-1,-1,0,-1,-1,0],
  [0,-1,-1,-1,-1,-1,-1,0],
  [0,-1,-1,-1,0,-1,-1,0],
  [0,0,0,0,0,0,0,0],
]
var blockinfo = [{sprindex:0},{sprindex:1}]
for(ai=0;ai<audios.length;ai++){
  aud = document.createElement("AUDIO");
 
  aud.src = linkprefix+audios[ai]+linksuffix
  aud.load()
  document.body.appendChild(aud)
  //aud.setAttribute("controls", "controls")
  
  sfx[audios[ai]]={link:aud.src,audio:aud}
  
}
var playsound = function(sfxname){
  //sfx[sfxname].audio.load()
  sfx[sfxname].audio.currentTime=0
  sfx[sfxname].audio.play()
}
console.log(sfx)

var keys = []
var mouse = 
  [{click:false,
  clicking:false,
  release:false},
  {click:false,
  clicking:false,
  release:false},
  {click:false,
  clicking:false,
  release:false}]

var wheel = {dist:0,cd:0}
document.onmousedown = function(e){
  mouse[e.which-1].click = true
  mouse[e.which-1].clicking = true
}
document.onwheel = function(e){
  wheel.dist += e.deltaY
}
document.oncontextmenu=function(){return false}
document.onmouseup = function(e){
  mouse[e.which-1].release = true
  mouse[e.which-1].clicking = false
}
var img = document.createElement("IMG")
img.src = "sprites/character.png"
var blocks = document.createElement("IMG")
blocks.src = "sprites/blocks.png"
//document.body.appendChild(img)

document.body.style.background = "#222222"
var tick = 0;
var canvas = document.createElement("canvas")
var invcanv = document.createElement("canvas")
var invcanv2 = document.createElement("canvas")
var invcanvx = document.createElement("canvas")
var invcanvy = document.createElement("canvas")
var invcanvf = document.createElement("canvas")
//canvas.style.filter = "contrast(200%)"
var guns = {
  refault:{
    displayname:"refault",
    sprindex:0,
    firerate:9,
    reloadtime:4,
    recoil:4,
    frame:0,
    cd:0,
    reloading:0,
    maxammo:8,
    ammo:0,
    accuracy:100,
    ppt:100,
    color:1194,
    shootaction:"mouse[0].clicking",
    count:1,
    life:10
  },
  zest:{
    displayname:"zest",
    sprindex:1,
    firerate:2,
    reloadtime:4,
    recoil:1,
    frame:0,
    cd:0,
    reloading:0,
    maxammo:30,
    ammo:0,
    accuracy:40,
    ppt:100,
    color:1919,
    shootaction:"mouse[0].clicking",
    count:1,
    life:10
  },
  mtest:{
    displayname:"mtest",
    sprindex:0,
    firerate:10,
    reloadtime:6,
    recoil:15,
    frame:0,
    cd:0,
    reloading:0,
    maxammo:1,
    ammo:0,
    accuracy:10,
    ppt:100,
    color:1941,
    shootaction:"mouse[0].clicking",
    count:5,
    life:2
  }
}
var player = {
  position:{x:24,y:24},
  velocity:{x:0,y:-2},
  cape:{x:1,y:1},
  dir:1,
  slotselected:0,
  guns:[guns.refault,guns.zest,guns.mtest],
  gunframe:{x:0,y:0}
}
var camx = 0
var camy = 0
var camz = 1
var lcamx = 0
var lcamy = 0
var lcamz = 0
var s_shake = 100
var mousex = 0
var mousey = 0
canvas.onmousemove = function(e){
  var dv = HEIGHT/window.innerHeight
  mousey = e.y
  mousey = (mousey-(HEIGHT/dv)/2)*dv
  mousex = e.x
  mousex = (mousex-(WIDTH/dv)/2)*dv
  
}
document.onkeydown = function(e){
  keys[e.key]=true
}
document.onkeyup = function(e){
  keys[e.key]=false
}
var emitters = [
  {
    position:{x:0,y:-100},
    interval:4,
    intervalvariance:0,
    thisint:10,
    count:1,
    countvariance:0,
    lifetime:40,
    lifetimevariance:0,
    pos:{x:0,y:0},
    posvariance:{x:0,y:0},
    startvel:{x:0,y:0},
    startvelvariance:{x:0,y:0},
    endvel:{x:0,y:0},
    endvelvariance:{x:0,y:0},
    glare:[2,0],
    color:1916,
    o:1,
    createParticle:function(){
      var ccount = this.count + Math.floor((2*Math.random()*this.countvariance)-this.countvariance)
      for(ci=0;ci<ccount;ci++){
      thisx = this.position.x+this.pos.x+(2*Math.random()*this.posvariance.x-this.posvariance.x)
      thisy = this.position.y+this.pos.y+(2*Math.random()*this.posvariance.y-this.posvariance.y)
      thisxv = this.startvel.x+(2*Math.random()*this.startvelvariance.x-this.startvelvariance.x)
      thisyv = this.startvel.y+(2*Math.random()*this.startvelvariance.y-this.startvelvariance.y)
      thisxve = this.endvel.x+(2*Math.random()*this.endvelvariance.x-this.endvelvariance.x)
      thisyve = this.endvel.y+(2*Math.random()*this.endvelvariance.y-this.endvelvariance.y)
      thislife = this.lifetime+ (2*Math.random()*this.lifetimevariance)-this.lifetimevariance
      
      this.particles[this.particles.length]={
        pos:{x:thisx,y:thisy},
        vel:{x:thisxv,y:thisyv},
        goalvel:{x:thisxve,y:thisyve},
        time:0,
        lasts:thislife
      }
    }
      //shift on death
    },
    particles:[]
  }
]
canvas.height=1080/3
canvas.width = 1920/3
invcanv2.height = canvas.height
invcanv2.width = canvas.width
invcanvx.height = canvas.height
invcanvx.width = canvas.width
invcanvy.height = canvas.height
invcanvy.width = canvas.width
invcanvf.height = canvas.height
invcanvf.width = canvas.width

//invcanv2.style.zIndex = "100"
invcanvf.style.transform = "translate(200%,0%)"

invcanv.height = canvas.height
invcanv.width = canvas.width
document.body.appendChild(canvas)
//document.body.appendChild(invcanv)
canvas.style.setProperty("image-rendering","pixelated")
canvas.style.height="100%"

canvas.style.position = "fixed"
canvas.style.left = "0px"
canvas.style.top = "0px"
//document.body.appendChild(invcanvf)
var ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false

var ctx2 = invcanv.getContext("2d")
ctx2.imageSmoothingEnabled = false
var ctx3 = invcanv2.getContext("2d")
ctx3.imageSmoothingEnabled = false
var ctx3x = invcanvx.getContext("2d")
ctx3x.imageSmoothingEnabled = false
var ctx3y = invcanvy.getContext("2d")
ctx3y.imageSmoothingEnabled = false
var ctx3f = invcanvf.getContext("2d")
ctx3f.imageSmoothingEnabled = false



var WIDTH = canvas.width
var HEIGHT = canvas.height

var renderFrame = function(){

tick++;
window.requestAnimationFrame(renderFrame)
  ctx3.clearRect(0,0,WIDTH,HEIGHT)
  ctx3f.clearRect(0,0,WIDTH,HEIGHT)
  ctx3f.fillStyle = "#000000"
  ctx3f.fillRect(0,0,WIDTH,HEIGHT)
  ctx3y.clearRect(0,0,WIDTH,HEIGHT)
  movePlayer()
  
  lcamx = camx
  lcamy = camy
  lcamz = camz
  testGun()
  testMouse()
  
  camx+=((player.position.x+mousex)-camx)/2
  camy+=((player.position.y+mousey)-camy)/2
  pdist = Math.sqrt(Math.pow(camx-player.position.x,2)+Math.pow(camy-player.position.y,2))
  camz+=((1+pdist/(WIDTH))-camz)/5
 
  
  ssh = s_shake/camz
  s_shake/=1.1
  camx+=(2*ssh*Math.random()-ssh)
  camy+=(2*ssh*Math.random()-ssh)
  camz+=(2*ssh*Math.random()-ssh)/200
 
  
  ctx.globalCompositeOperation = "source-over"
ctx.clearRect(0,0,WIDTH,HEIGHT)

ctx.fillStyle = "rgba(50,50,50,1)"
ctx.fillRect(0,0,WIDTH,HEIGHT)
  renderBlocks("init")
  renderPlayer()
  
  
  
  
  ctx.globalCompositeOperation = "screen"
  for(i=0;i<emitters.length;i++){
    var em = emitters[i]
    var interv = em.thisint
    if(tick%interv==0){em.createParticle();em.thisint = em.interval + Math.floor((2*em.intervalvariance*Math.random())-em.intervalvariance)}
    
    var sxx = (em.position.x-camx)/camz+WIDTH/2
    var syy = (em.position.y-camy)/camz+HEIGHT/2
    
    for(ii=0;ii<em.particles.length;ii++){
    var part = em.particles[ii]
    part.time++;
    if(part.time>=part.lasts||(sxx<-WIDTH||sxx>WIDTH*2||syy<-HEIGHT||syy>HEIGHT*2)){em.particles[ii]="delete";}else{
      
      var partfr = part.time/part.lasts
      var partxv = partfr*part.goalvel.x+(1-partfr)*part.vel.x
      var partyv = partfr*part.goalvel.y+(1-partfr)*part.vel.y
      var partv = Math.sqrt(Math.pow(partxv,2)+Math.pow(partyv,2))
      var partd = Math.atan2(partxv,partyv)
      part.pos.x+=partxv
      part.pos.y+=partyv
      
    var sx = (part.pos.x-camx)/camz+WIDTH/2
    var sy = (part.pos.y-camy)/camz+HEIGHT/2
    
    ctx.fillStyle=cf3i(1999).c.mult(1-partfr).mult(em.o)
    ctx.fillRect(sx,sy,1,1)
    var glmul = partfr*(em.glare.length-1)
    var glinter = glmul%1
    glmul = Math.floor(glmul)
    gl = glinter*em.glare[glmul+1]+(1-glinter)*em.glare[glmul]
    var grad = ctx.createRadialGradient(sx,sy,0,sx,sy,gl*10)
    
    grad.addColorStop(0,cf3i(em.color).c.mult(1/((partv/10)+1)).mult(em.o))
    grad.addColorStop(1,"#000000")
    ctx.fillStyle = grad
    
    ctx.fillRect(sx-gl*10,sy,gl*20,1)
    ctx.fillRect(sx,sy-gl*10,1,gl*20)
      var grad = ctx.createRadialGradient(sx,sy,0,sx,sy,gl*100)
    
    grad.addColorStop(0,cf3i(em.color).c.mult(0.05/((partv/10)+1)).mult(em.o))
    grad.addColorStop(1,"#000000")
    ctx.fillStyle = grad
    
    ctx.fillRect(sx-gl*100,sy,gl*200,1)
    ctx.fillRect(sx,sy-gl*100,1,gl*200)
      
    grad = ctx.createRadialGradient(sx,sy,0,sx,sy,gl*40)
    grad.addColorStop(0,cf3i(em.color).c.mult(0.01).mult(em.o))
    grad.addColorStop(1,"#000000")
    var grad2 = ctx.createRadialGradient(sx,sy,0,sx,sy,gl*40)
    grad2.addColorStop(0,cf3i(em.color).c.mult(1))
    grad2.addColorStop(1,cf3i(em.color).c.mult(0))
    
    ctx3f.fillStyle = grad2
    ctx3f.beginPath()
    ctx3f.arc(sx,sy,gl*40,0,2*Math.PI)
    ctx3f.fill()
    ctx3f.lineCap = "round"
      
      ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(sx,sy,gl*40,0,2*Math.PI)
    ctx.fill()
    ctx.lineCap = "round"
    grad = ctx.createRadialGradient(sx,sy,0,sx,sy,partv)
    var gls = Math.max.apply(null, em.glare);
      

    
    grad.addColorStop(0,cf3i(em.color).c.mult(gl/gls).mult(em.o))
    grad.addColorStop(1,"#000000")
    ctx.strokeStyle = grad
    //ctx.fillRect(0,0,WIDTH,HEIGHT)
    //ctx.strokeStyle = cf3i(em.color).c
    ctx.lineWidth = gl/2;
    if(part.time>0){
    ctx.beginPath()
    ctx.moveTo(sx+1*partxv,sy+1*partyv)
    ctx.lineTo(sx-1*partxv,sy-1*partyv)
    ctx.stroke()}
    }
    }
    for(iii=0;iii<em.particles.length;iii++){
      if (em.particles[iii]=="delete"){
        em.particles.splice(iii,1)
        iii--
      }
    }
  }
  ctx3f.globalCompositeOperation = "screen"
  ctx3.globalCompositeOperation = "source-in"
  ctx3.drawImage(invcanvf,0,0)
  ctx.globalCompositeOperation = "screen"
  ctx.globalAlpha = 0.25
  ctx.drawImage(invcanv2,0,0)
  ctx.globalAlpha = 0.75
  ctx.globalCompositeOperation = "multiply"
  ctx.drawImage(invcanvf,0,0)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = "screen"
  ctx.drawImage(invcanvy,0,0)
  
  ctx.globalCompositeOperation = "normal"
  ctx2.clearRect(0,0,WIDTH,HEIGHT)
  
  for(mbi=0;mbi<1;mbi+=0.02){
    var dx = mbi*(camx-lcamx)
    var dy = mbi*(camy-lcamy)
    var dz = 1+mbi*(camz-lcamz)
    ctx2.translate(WIDTH/2,HEIGHT/2)
    ctx2.scale(dz,dz)
    ctx2.translate(-WIDTH/2,-HEIGHT/2)
    ctx2.drawImage(canvas,dx,dy)
    ctx2.setTransform(1,0,0,1,0,0)
    ctx2.globalAlpha = (1-mbi)*0.1
  }
  ctx.globalAlpha = 1
  ctx.drawImage(invcanv,0,0)
  ctx.globalAlpha = 1
  
}
var cf3i=function(num){
  num = num.toString()
  num = "rgb("+(parseFloat(num.charAt(1))*28)+","+(parseFloat(num.charAt(2))*28)+","+(parseFloat(num.charAt(3))*28)+")"
  var res = {c:num,r:(parseFloat(num.charAt(1))*28),g:(parseFloat(num.charAt(2))*28),b:(parseFloat(num.charAt(3))*28)}
  return res
}
String.prototype.mult = function(n){
  var i0 = this.indexOf("(")

  var i1 = this.indexOf(",")
  var i2 = this.lastIndexOf(",")
  var i3 = this.lastIndexOf(")")
  res = "rgb("+parseFloat(this.substring(i0+1,i1))*n+","+parseFloat(this.substring(i1+1,i2))*n+","+parseFloat(this.substring(i2+1,i3))*n+")"
  return res;
}
var createEmitter = function(pos){
  var len = emitters.length
  emitters[len] = JSON.parse(JSON.stringify(emitters[0]))
  emitters[len].position = pos
  emitters[len].createParticle = emitters[0].createParticle
  return emitters[len]
}
testGun = function(){
  if(wheel.dist<0&&wheel.cd<=0){player.slotselected++;wheel.cd=20;playsound("refault1.wav")}
  if(wheel.dist>0&&wheel.cd<=0){player.slotselected--;wheel.cd=20;playsound("refault1.wav")}
  if(player.slotselected>=player.guns.length){player.slotselected-=player.guns.length}
  if(player.slotselected<0){player.slotselected+=player.guns.length}
  gunparticle.count = 0
  bulletp.count = 0
  g = player.guns[player.slotselected]
  
  if(eval(g.shootaction) == true&&g.cd<=0&&g.ammo>0&&g.reloading<=0){
    g.cd = g.firerate
    var goffset = (2*(90/g.accuracy)*Math.random()-(90/g.accuracy))/100
    g.ammo--;
    playsound("refault0.wav")
    gunparticle.color = g.color
    bulletp.color = g.color
    gunparticle.count=15
    bulletp.count = g.count
    bulletp.lifetime = g.life
    gunparticle.glare = [g.recoil*1.5,0]
    gunparticle.position.x = player.position.x
    gunparticle.position.y = player.position.y
    bulletp.position = {x:player.position.x,y:player.position.y}
    gunparticle.pos.x = 28*Math.sin(Math.atan2(mousex,mousey))
    gunparticle.pos.y = 28*Math.cos(Math.atan2(mousex,mousey))
    bulletp.pos = {x:24*Math.sin(goffset+Math.atan2(mousex,mousey)),y:24*Math.cos(goffset+Math.atan2(mousex,mousey))}
    gunparticle.startvel.x = g.recoil*2*Math.sin(Math.atan2(mousex,mousey))
    gunparticle.startvel.y = g.recoil*2*Math.cos(Math.atan2(mousex,mousey))
    bulletp.startvel = {x:g.ppt*Math.sin(goffset+Math.atan2(mousex,mousey)),y:g.ppt*Math.cos(goffset+Math.atan2(mousex,mousey))}
    bulletp.startvelvariance = {x:(90/g.accuracy),y:(90/g.accuracy)}
    bulletp.endvel = {x:g.ppt*Math.sin(Math.atan2(mousex,mousey)),y:g.ppt*Math.cos(Math.atan2(mousex,mousey))}
    gunparticle.startvelvariance = {x:2*g.recoil,y:2*g.recoil}
    s_shake += g.recoil
    camx+=g.recoil*5*Math.sin(Math.atan2(mousex,mousey))
    camy+=g.recoil*5*Math.cos(Math.atan2(mousex,mousey))
  }else{
    if(g.cd>0){g.cd-=1}
    if(((g.ammo<=0&&eval(g.shootaction) == true)||keys["r"]==true)&&g.cd<=0&&g.reloading<=0){g.reloading = 7;g.ammo = g.maxammo;playsound("refault1.wav")}
  }
  g.frame = Math.floor(4*(g.cd/g.firerate))
  if(g.reloading>0){
    rlframe = 8-Math.ceil(g.reloading)
    rlyf = 0
    if (rlframe>3){rlframe-=4;rlyf++;}
    player.gunframe = {x:rlframe,y:rlyf+3*g.sprindex}
    g.reloading-=(1/g.reloadtime)
  }else if(g.ammo<=0){
    player.gunframe = {x:0,y:0+3*g.sprindex}
  }else{
    player.gunframe = {x:(4-g.frame)%4,y:-1+3*g.sprindex}
  }
  
}
testMouse = function(){
  for(mi=0;mi<2;mi++){
    mouse[mi].click = false
    mouse[mi].release = false
  }
  wheel.dist=0
  if(wheel.cd>0){wheel.cd--;}
}
movePlayer = function(){
  playerparticle.count = 0
  var dirv = -(mousex/Math.abs(mousex))
  if(!isNaN(dirv)){
  player.dir +=(dirv-player.dir)/5;}
  if(keys["a"]){player.velocity.x--;playerparticle.count = 1}
  if(keys["d"]){player.velocity.x++;playerparticle.count = 1}
  player.position.x += player.velocity.x
  player.position.y += player.velocity.y
  var downblock = level[Math.round(player.position.y/24+0.9)][Math.round(player.position.x/24)]
  var upblock = level[Math.round(player.position.y/24-0.1)][Math.round(player.position.x/24)]
  var leftblock = level[Math.round(player.position.y/24)][Math.round(player.position.x/24-0.3)]
  var rightblock = level[Math.round(player.position.y/24)][Math.round(player.position.x/24+0.3)]
  if(downblock>=0){player.velocity.y=0;player.position.y=-10+24*Math.ceil(player.position.y/24);
  if(keys["w"]){player.velocity.y=-8;playerparticle.count = 2}
  }
  if(upblock>=0){player.velocity.y=0;player.position.y=-9+24*Math.ceil(player.position.y/24);}
  if(leftblock>=0){player.position.x=-5+24*Math.ceil((player.position.x)/24);player.velocity.x=0;}
  if(rightblock>=0){player.position.x=5+24*Math.floor((player.position.x)/24);player.velocity.x=0;}
  player.velocity.y +=0.35
  player.velocity.x /=1.12
  
  playerparticle.position.x = player.position.x-player.velocity.x*2
  playerparticle.position.y = player.position.y
  movestr = 20+Math.sqrt(Math.pow(player.velocity.x,2)+Math.pow(player.velocity.y,2))
  movestr/=40
  player.cape.x+=(player.velocity.x-player.cape.x)*movestr
  player.cape.y+=((-1+player.velocity.y)-player.cape.y)*movestr
}
renderBlocks = function(blmode,scx,scy,fstyle,radius){
  for(iy=0;iy<level.length;iy++){
    var ssy = (iy*24-camy)/camz+HEIGHT/2
    if(ssy>0-24&&ssy<HEIGHT+24){
    for(ix=0;ix<level[iy].length;ix++){
      var ssx = (ix*24-camx)/camz+WIDTH/2
      if(ssx>0-24&&ssx<WIDTH+24){
      var blockid = level[iy][ix]
      if (blockid > -1){
      var block = blockinfo[blockid]
      var sx = (ix*24-camx)/camz+WIDTH/2
      var sy = (iy*24-camy)/camz+HEIGHT/2
        ctx3.globalCompositeOperation = "normal"
        ctx.drawImage(blocks,0,24*block.sprindex,24,24,sx-12/camz,sy-12/camz,24/camz,24/camz)
        ctx3.drawImage(blocks,0,24*block.sprindex,24,24,sx-12/camz,sy-12/camz,24/camz,24/camz)
        ctx3y.drawImage(blocks,24,24*block.sprindex,24,24,sx-12/camz,sy-12/camz,24/camz,24/camz)}
      }
    }
    }
  }
  
  //ctx3.drawImage(blocks,48,0,48,48,0,0,48,48)
}
renderPlayer = function(){
  
  playerdir = player.dir/Math.abs(player.dir)
  movestr = Math.sqrt(Math.pow(player.velocity.x,2)+Math.pow(player.velocity.y,2))
  var capeangle = Math.atan2(player.cape.x,-player.cape.y)
  var gunangle = Math.atan2(mousex,mousey)
  var angl = (Math.PI/2*player.cape.x/10)-player.cape.y/20
  var angr = (Math.PI/2*player.cape.x/10)+player.cape.y/20
  ctx.setTransform(1,0,0,1,WIDTH/2,HEIGHT/2)
  
  sx=(player.position.x-camx)/camz
  sy=(player.position.y-camy)/camz
  
  var grad = ctx.createRadialGradient(WIDTH/2+sx,HEIGHT/2+sy,0,WIDTH/2+sx,HEIGHT/2+sy,40/camz)
    grad.addColorStop(0,"#ffbbff")
    grad.addColorStop(1,"#000000")
    
    ctx3f.fillStyle = grad
    ctx3f.beginPath()
    ctx3f.arc(WIDTH/2+sx,HEIGHT/2+sy,40,0,2*Math.PI)
    ctx3f.fill()
  
  ctx.translate(sx,sy)
  
  ctx.rotate(player.velocity.x/15)
  ctx.translate(0,Math.abs(player.velocity.x))
  
  ctx.scale(1/camz,1/camz)
  ctx.scale(playerdir,1)
  ctx.rotate(0.5)
  ctx.translate(-24,-24)
  var gunl = []
  for(gi=0;gi<player.guns.length;gi++){
    gunl[gi]=player.guns[gi]
  }
  gunl.splice(player.slotselected,1)
  for(gi=0;gi<gunl.length;gi++){
  ctx.drawImage(img,1,4*48+1+(3*48)*gunl[gi].sprindex,46,47,-4+20*(gi/gunl.length),-2+24*(gi/gunl.length),48,48)
  }
  ctx.translate(24,24)
  ctx.rotate(-0.5)
  ctx.scale(playerdir,1)
  
  
  
  
  
  ctx.translate(-24,-24)
  if(movestr>=2){
  ctx.translate(0,4)
  ctx.translate(24,24)
  ctx.rotate(capeangle)
  ctx.translate(-24,-24)
  ctx.drawImage(img,49,49,46,47,0,0,48,48)
  ctx.translate(24,24)
  ctx.rotate(-capeangle)
  ctx.translate(-24,-24)
  ctx.translate(0,-4)
  
  
  ctx.translate(-3,-5)
  ctx.translate(24,24)
  ctx.rotate(-angl)
  ctx.translate(-24,-24)
  ctx.drawImage(img,97,49,46,47,0,0,48,48)
  ctx.translate(24,24)
  ctx.rotate(angl)
  ctx.translate(-24,-24)
  ctx.translate(3,5)
  
  ctx.translate(3,-5)
  ctx.translate(24,24)
  ctx.rotate(-angr)
  ctx.translate(-24,-24)
  ctx.drawImage(img,145,49,46,47,0,0,48,48)
  ctx.translate(24,24)
  ctx.rotate(angr)
  
  ctx.translate(-24,-24)
  ctx.translate(-3,5)
  }
  ctx.translate(24,0)
  ctx.scale(player.dir,1)
  
  ctx.translate(-24,0)
  if(movestr<2){ctx.drawImage(img,1+48*Math.floor(tick/8%4),1,46,47,0,0,48,48)}else{
  ctx.drawImage(img,1+48*Math.floor(tick/8%4),97,46,47,0,0,48,48)}
  if(mouse[0].clicking){
    ctx.translate(24-20/(21-wheel.cd),20+10/(21-wheel.cd))
  }else{
    ctx.translate(24-20/(21-wheel.cd),28+10/(21-wheel.cd))
  }
  
  
  ctx.scale(-1,1)
  
  
  if(isNaN(playerdir)){playerdir=1}
  ctx.rotate(playerdir*player.velocity.x/15)
  ctx.rotate(playerdir*((wheel.cd/20)*(playerdir*-5)+(1-wheel.cd/20)*gunangle)+Math.PI/2)
  ctx.translate(-16,-18)
  ctx.drawImage(img,1+48*player.gunframe.x,1+48*5+48*player.gunframe.y,46,47,0,0,48,48)
  ctx.setTransform(1,0,0,1,0,0)
}
var playerparticle = createEmitter({x:0,y:0})
playerparticle.lifetime = 20
playerparticle.interval = 1
playerparticle.count = 0
playerparticle.pos = {x:0,y:24}
playerparticle.startvelvariance = {x:4,y:1}
playerparticle.startvel = {x:0,y:0}
playerparticle.endvelvariance = {x:0,y:0}
playerparticle.color = 1919
playerparticle.glare = [0,1,0]
var gunparticle = createEmitter({x:0,y:0})
gunparticle.interval = 1
gunparticle.glare = [2,0]
gunparticle.lifetime = 3
gunparticle.lifetimevariance = 2
gunparticle.startvelvariance = {x:2,y:2}
gunparticle.endvelvariance = {x:1,y:1}
var bulletp = createEmitter({x:0,y:0})
bulletp.interval = 1
bulletp.glare = [5,0]
bulletp.lifetime = 10
bulletp.endvelvariance = {x:1,y:1}
renderFrame();

var stars = createEmitter({x:0,y:0})

stars.interval = 130
stars.intervalvariance = 30
stars.count = 9
stars.countvariance = 3
stars.lifetime = 10
stars.lifetimevariance = 5
stars.color = 1119
stars.startvelvariance = {x:3,y:3}
stars.endvel = {x:0,y:5}
stars.glare = [2,0]
var stlamp = createEmitter({x:100,y:-48})
stlamp.posvariance = {x:10,y:10}
stlamp.o = 0
stlamp.glare = [0,1.5,0]
