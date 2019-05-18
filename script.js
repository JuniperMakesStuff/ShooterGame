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

document.onmousedown = function(e){
  mouse[e.which-1].click = true
  mouse[e.which-1].clicking = true
}
document.onmouseup = function(e){
  mouse[e.which-1].release = true
  mouse[e.which-1].clicking = false
}
var img = document.createElement("IMG")
img.src = "https://github.com/JuniperMakesStuff/ShooterGame/blob/master/sprites/character.png?raw=true"
//document.body.appendChild(img)

document.body.style.background = "#222222"
var tick = 0;
var canvas = document.createElement("canvas")
var invcanv = document.createElement("canvas")
//canvas.style.filter = "contrast(200%)"
var guns = {
  refault:{
    displayname:"Refault",
    sprindex:0,
    firerate:9,
    reloadtime:4,
    recoil:4,
    frame:0,
    cd:0,
    reloading:0,
    maxammo:8,
    ammo:0,
    
    ppt:100,
    color:1191,
    shootaction:"mouse[0].clicking"
    
  }
}
var player = {
  position:{x:0,y:0},
  velocity:{x:0,y:-2},
  cape:{x:1,y:1},
  dir:1,
  slotselected:0,
  guns:[guns.refault],
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
    startvelvariance:{x:2,y:2},
    endvel:{x:0,y:0},
    endvelvariance:{x:0,y:0},
    glare:[2,0],
    color:1999,
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
invcanv.height = canvas.height
invcanv.width = canvas.width
document.body.appendChild(canvas)
//document.body.appendChild(invcanv)
canvas.style.setProperty("image-rendering","pixelated")
canvas.style.height="100%"
canvas.style.position = "fixed"
canvas.style.left = "0px"
canvas.style.top = "0px"
var ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false

var ctx2 = invcanv.getContext("2d")
ctx2.imageSmoothingEnabled = false

var WIDTH = canvas.width
var HEIGHT = canvas.height

var renderFrame = function(){

tick++;
window.requestAnimationFrame(renderFrame)
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
    
    ctx.fillStyle=cf3i(1999).c.mult(1-partfr)
    ctx.fillRect(sx,sy,1,1)
    var glmul = partfr*(em.glare.length-1)
    var glinter = glmul%1
    glmul = Math.floor(glmul)
    gl = glinter*em.glare[glmul+1]+(1-glinter)*em.glare[glmul]
    var grad = ctx.createRadialGradient(sx,sy,0,sx,sy,gl*10)
    
    grad.addColorStop(0,cf3i(em.color).c.mult(1/((partv/10)+1)))
    grad.addColorStop(1,"#000000")
    ctx.fillStyle = grad
    //ctx.fillStyle = cf3i(em.color).c
    //ctx.beginPath()
    //ctx.arc(sx+partxv/camz,sy+partyv/camz,gl*2,-partd+Math.PI,-partd+Math.PI*2,true)
    //ctx.arc(sx-partxv/camz,sy-partyv/camz,gl*2,-partd,-partd+Math.PI,true)
    //ctx.fill()
    //ctx.fillRect(0,0,WIDTH,HEIGHT)
    ctx.fillRect(sx-gl*10,sy,gl*20,1)
    ctx.fillRect(sx,sy-gl*10,1,gl*20)
    grad = ctx.createRadialGradient(sx,sy,0,sx,sy,gl*40)
    grad.addColorStop(0,cf3i(em.color).c.mult(0.02))
    grad.addColorStop(1,"#000000")
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(sx,sy,gl*40,0,2*Math.PI)
    ctx.fill()
    ctx.lineCap = "round"
    grad = ctx.createRadialGradient(sx,sy,0,sx,sy,partv)
    var gls = Math.max.apply(null, em.glare);
      

    
    grad.addColorStop(0,cf3i(em.color).c.mult(gl/gls))
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
  gunparticle.count = 0
  bulletp.count = 0
  g = player.guns[player.slotselected]
  
  if(eval(g.shootaction) == true&&g.cd<=0&&g.ammo>0&&g.reloading<=0){
    g.cd = g.firerate
    g.ammo--;
    gunparticle.color = g.color
    bulletp.color = g.color
    gunparticle.count=15
    bulletp.count = 1
    gunparticle.glare = [g.recoil/3,0]
    gunparticle.position.x = player.position.x
    gunparticle.position.y = player.position.y +5
    bulletp.position = {x:player.position.x,y:player.position.y+5}
    gunparticle.pos.x = 24*Math.sin(Math.atan2(mousex,mousey))
    gunparticle.pos.y = 24*Math.cos(Math.atan2(mousex,mousey))
    bulletp.pos = {x:24*Math.sin(Math.atan2(mousex,mousey)),y:24*Math.cos(Math.atan2(mousex,mousey))}
    gunparticle.startvel.x = g.recoil*2*Math.sin(Math.atan2(mousex,mousey))
    gunparticle.startvel.y = g.recoil*2*Math.cos(Math.atan2(mousex,mousey))
    bulletp.startvel = {x:g.ppt*Math.sin(Math.atan2(mousex,mousey)),y:g.ppt*Math.cos(Math.atan2(mousex,mousey))}
    bulletp.startvelvariance = {x:0,y:0}
    bulletp.endvel = {x:g.ppt*Math.sin(Math.atan2(mousex,mousey)),y:g.ppt*Math.cos(Math.atan2(mousex,mousey))}
    gunparticle.startvelvariance = {x:2*g.recoil,y:2*g.recoil}
    s_shake += g.recoil
    camx+=g.recoil*5*Math.sin(Math.atan2(mousex,mousey))
    camy+=g.recoil*5*Math.cos(Math.atan2(mousex,mousey))
  }else{
    if(g.cd>0){g.cd-=1}
    if(g.ammo<=0&&eval(g.shootaction) == true&&g.cd<=0&&g.reloading<=0){g.reloading = 7;g.ammo = g.maxammo}
  }
  g.frame = Math.floor(4*(g.cd/g.firerate))
  if(g.reloading>0){
    rlframe = 8-Math.ceil(g.reloading)
    rlyf = 0
    if (rlframe>3){rlframe-=4;rlyf++;}
    player.gunframe = {x:rlframe,y:rlyf}
    g.reloading-=(1/g.reloadtime)
  }else if(g.ammo<=0){
    player.gunframe = {x:0,y:0}
  }else{
    player.gunframe = {x:(4-g.frame)%4,y:-1}
  }
  
}
testMouse = function(){
  for(mi=0;mi<2;mi++){
    mouse[mi].click = false
    mouse[mi].release = false
  }
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
  if(player.position.y>48){player.velocity.y=0;player.position.y=48;
  if(keys["w"]){player.velocity.y=-8;playerparticle.count = 20}
  }
  player.velocity.y +=0.5
  player.velocity.x /=1.09
  
  playerparticle.position.x = player.position.x-player.velocity.x*2
  playerparticle.position.y = player.position.y
  movestr = 20+Math.sqrt(Math.pow(player.velocity.x,2)+Math.pow(player.velocity.y,2))
  movestr/=40
  player.cape.x+=(player.velocity.x-player.cape.x)*movestr
  player.cape.y+=((-1+player.velocity.y)-player.cape.y)*movestr
}
renderPlayer = function(){
  movestr = Math.sqrt(Math.pow(player.velocity.x,2)+Math.pow(player.velocity.y,2))
  var capeangle = Math.atan2(player.cape.x,-player.cape.y)
  var gunangle = Math.atan2(mousex,mousey)
  var angl = (Math.PI/2*player.cape.x/10)-player.cape.y/20
  var angr = (Math.PI/2*player.cape.x/10)+player.cape.y/20
  ctx.setTransform(1,0,0,1,WIDTH/2,HEIGHT/2)
  sx=(player.position.x-camx)/camz
  sy=(player.position.y-camy)/camz
  ctx.translate(sx,sy)
  ctx.rotate(player.velocity.x/15)
  ctx.scale(1/camz,1/camz)
  ctx.translate(0,Math.abs(player.velocity.x))
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
  ctx.translate(24,28)
  ctx.scale(-1,1)
  
  playerdir = player.dir/Math.abs(player.dir)
  if(isNaN(playerdir)){playerdir=1}
  ctx.rotate(playerdir*player.velocity.x/15)
  ctx.rotate(playerdir*gunangle+Math.PI/2)
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
gunparticle.startvelvariance = {x:2,y:2}
gunparticle.endvelvariance = {x:1,y:1}
var bulletp = createEmitter({x:0,y:0})
bulletp.interval = 1
bulletp.glare = [5,0]
bulletp.lifetime = 10
bulletp.endvelvariance = {x:1,y:1}
renderFrame();

var stars = createEmitter({x:0,y:0})
stars.posvariance = {x:480,y:270}
stars.interval = 16
stars.lifetime = 600
stars.color = 1559
stars.startvelvariance = {x:0,y:0}
stars.glare = [0,2,0]
