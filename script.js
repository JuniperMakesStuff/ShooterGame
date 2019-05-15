document.style.background = "#222222"
var tick = 0;
var canvas = document.createElement("canvas")
canvas.style.filter = "contrast(200%)"
var camx = 0
var camy = 0
var mousex = 0
var mousey = 0
canvas.onmousemove = function(e){
  var dv = HEIGHT/window.innerHeight
  mousey = e.y
  mousey = (mousey-(HEIGHT/dv)/2)*dv
  mousex = e.x
  mousex = (mousex-(WIDTH/dv)/2)*dv
  
}
var emitters = [
  {
    position:{x:0,y:0},
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
canvas.height=1080/2
canvas.width = 1920/2
document.body.appendChild(canvas)
canvas.style.setProperty("image-rendering","pixelated")
canvas.style.height="100%"
canvas.style.position = "fixed"
canvas.style.left = "0px"
canvas.style.top = "0px"
var ctx = canvas.getContext("2d")
var WIDTH = canvas.width
var HEIGHT = canvas.height

var renderFrame = function(){
tick++;
window.requestAnimationFrame(renderFrame)
  camx=mousex
  camy=mousey
  
  
  
  
  ctx.globalCompositeOperation = "normal"
ctx.clearRect(0,0,WIDTH,HEIGHT)
ctx.fillStyle = "#000000"
ctx.fillRect(0,0,WIDTH,HEIGHT)
  ctx.globalCompositeOperation = "screen"
  for(i=0;i<emitters.length;i++){
    var em = emitters[i]
    var interv = em.thisint
    if(tick%interv==0){em.createParticle();em.thisint = em.interval + Math.floor((2*em.intervalvariance*Math.random())-em.intervalvariance)}
    
    for(ii=0;ii<em.particles.length;ii++){
    var part = em.particles[ii]
    part.time++;
    if(part.time>=part.lasts){em.particles[ii]="delete";}else{
      
      var partfr = part.time/part.lasts
      var partxv = partfr*part.goalvel.x+(1-partfr)*part.vel.x
      var partyv = partfr*part.goalvel.y+(1-partfr)*part.vel.y
      part.pos.x+=partxv
      part.pos.y+=partyv
      
    var sx = part.pos.x-camx+WIDTH/2
    var sy = part.pos.y-camy+HEIGHT/2
    
    ctx.fillStyle=cf3i(1999).c.mult(1-partfr)
    ctx.fillRect(sx,sy,1,1)
    var glmul = partfr*(em.glare.length-1)
    var glinter = glmul%1
    glmul = Math.floor(glmul)
    gl = glinter*em.glare[glmul+1]+(1-glinter)*em.glare[glmul]
    var grad = ctx.createRadialGradient(sx,sy,0,sx,sy,gl*10)
    grad.addColorStop(0,cf3i(em.color).c.mult(1))
    grad.addColorStop(1,"#000000")
    ctx.fillStyle = grad
    ctx.fillRect(sx-gl*10,sy,gl*20,1)
    ctx.fillRect(sx,sy-gl*10,1,gl*20)
    grad = ctx.createRadialGradient(sx,sy,0,sx,sy,gl*15)
    grad.addColorStop(0,cf3i(em.color).c.mult(0.5))
    grad.addColorStop(1,"#000000")
    ctx.fillStyle = grad
    //ctx.beginPath()
    //ctx.arc(sx,sy,gl*20,0,2*Math.PI)
    //ctx.fill()
    ctx.lineCap = "round"
    grad = ctx.createRadialGradient(sx,sy,0,sx,sy,4*Math.sqrt(Math.pow(partxv,2)+Math.pow(partyv,2)))
      var gls = Math.max.apply(null, em.glare);
      

    grad.addColorStop(0,cf3i(em.color).c.mult(1.5*gl/gls))
    grad.addColorStop(0.75,cf3i(em.color).c.mult(gl/gls))
    grad.addColorStop(1,"#000000")
    ctx.strokeStyle = grad
    //ctx.fillRect(0,0,WIDTH,HEIGHT)
    //ctx.strokeStyle = cf3i(em.color).c
    ctx.lineWidth = gl;
    ctx.beginPath()
    ctx.moveTo(sx,sy)
    ctx.lineTo(sx-4*partxv,sy-4*partyv)
    ctx.stroke()
    }
    }
    for(iii=0;iii<em.particles.length;iii++){
      if (em.particles[iii]=="delete"){
        em.particles.splice(iii,1)
        iii--
      }
    }
  }

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
renderFrame();
var newe = createEmitter({x:100,y:0})
newe.color = 1930
newe.interval = 1
newe.endvel={x:10,y:0}
var newe2 = createEmitter({x:-100,y:0})
newe2.color = 1629
newe2.interval = 120
newe2.intervalvariance = 30
newe2.count = 50
newe2.countvariance = 25
newe2.startvelvariance = {x:7,y:7}
newe2.lifetime = 60
newe2.lifetimevariance = 60
newe2.glare = [10,2,0]
var water = createEmitter({x:480,y:-270})
water.color = 1154
water.startvel = {x:-5,y:0}
water.startvelvariance = {x:15,y:15}
water.interval = 240
water.lifetime = 60
water.lifetimevariance = 20
water.intervalvariance = 120
water.count = 40
water.glare = [0,0,0,15,0]
water.endvel = {x:-15,y:15}
water.posvariance = {x:0,y:0}
var stars = createEmitter({x:0,y:0})
stars.posvariance = {x:480,y:270}
stars.interval = 20
stars.lifetime = 600
stars.color = 1559
stars.startvelvariance = {x:0,y:0}
stars.glare = [0,2,0]
