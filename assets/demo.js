(function(){
  var CLIP=5.333333, ORIGIN=0.032, STEP=60/90/4; // 90 BPM, sixteenth-note grid
  var NAMES={1:"Classic swing",2:"Laid back",3:"Snare ahead",4:"Drunk"};
  var DESC={
    1:"62 % swing on every voice, no groove template. This is the reference.",
    2:"Hats and open hat at 57 % swing; the rest stays on the grid.",
    3:"The snare lands about 69 ms ahead of the grid (5/192 of a bar); hats at 52 %.",
    4:"Hats at 57 %, kick a little late, snare a little early, plus a flam and slow drift."
  };
  var peaks=window.GROOVE_PEAKS, wave=document.getElementById("wave"),
      play=document.getElementById("play"), clock=document.getElementById("clock"),
      desc=document.getElementById("desc"), btns=[].slice.call(document.querySelectorAll("[data-groove]"));
  if(!wave||!peaks) return;
  var NS="http://www.w3.org/2000/svg", W=900, H=200, MID=H/2;
  var svg=document.createElementNS(NS,"svg"); svg.setAttribute("viewBox","0 0 "+W+" "+H); svg.setAttribute("preserveAspectRatio","none"); svg.setAttribute("aria-hidden","true");
  var grid=document.createElementNS(NS,"g"), bars=document.createElementNS(NS,"path"), head=document.createElementNS(NS,"line");
  for(var k=0;k<32;k++){
    var x=((ORIGIN+k*STEP)/CLIP*W).toFixed(2), l=document.createElementNS(NS,"line");
    l.setAttribute("x1",x);l.setAttribute("x2",x);l.setAttribute("y1",0);l.setAttribute("y2",H);
    l.setAttribute("stroke","#2d3760");l.setAttribute("stroke-width",k%16===0?2.2:(k%4===0?1.4:.8));
    l.setAttribute("vector-effect","non-scaling-stroke");
    if(k%16===0)l.setAttribute("stroke","#5a6699");
    grid.appendChild(l);
  }
  bars.setAttribute("fill","#8f8cc0");
  head.setAttribute("y1",0);head.setAttribute("y2",H);head.setAttribute("stroke","#f4a583");head.setAttribute("stroke-width",2.5);head.setAttribute("vector-effect","non-scaling-stroke");
  svg.appendChild(grid);svg.appendChild(bars);svg.appendChild(head);wave.appendChild(svg);
  function draw(i){
    var p=peaks[i],d="";
    for(var n=0;n<p.length;n++){var h=Math.max(.6,p[n]*(MID-8));d+="M"+n+" "+(MID-h).toFixed(1)+"h1v"+(h*2).toFixed(1)+"h-1z";}
    bars.setAttribute("d",d);
  }
  var audio={},cur=1,playing=false,raf=0;
  [1,2,3,4].forEach(function(i){var a=new Audio("assets/groove-"+i+".mp3");a.loop=true;a.preload="auto";audio[i]=a;});
  function fmt(t){return t.toFixed(1)+" / "+CLIP.toFixed(1)+" s";}
  function paint(){var t=audio[cur].currentTime%CLIP,x=t/CLIP*W;head.setAttribute("x1",x);head.setAttribute("x2",x);clock.textContent=fmt(t);}
  function tick(){paint();if(playing)raf=requestAnimationFrame(tick);}
  function setPlaying(v){
    playing=v;play.setAttribute("aria-pressed",v?"true":"false");play.textContent=v?"Pause":"Play";
    if(v){var p=audio[cur].play();if(p&&p.catch)p.catch(function(){setPlaying(false);});cancelAnimationFrame(raf);tick();}
    else{audio[cur].pause();cancelAnimationFrame(raf);paint();}
  }
  function select(i){
    var t=audio[cur].currentTime;audio[cur].pause();cur=i;audio[cur].currentTime=t;
    btns.forEach(function(b){b.setAttribute("aria-pressed",String(+b.dataset.groove===i));});
    draw(i);desc.textContent=NAMES[i]+": "+DESC[i];
    if(playing){var p=audio[cur].play();if(p&&p.catch)p.catch(function(){});}
    paint();
  }
  btns.forEach(function(b){b.addEventListener("click",function(){select(+b.dataset.groove);});});
  play.addEventListener("click",function(){setPlaying(!playing);});
  wave.addEventListener("click",function(e){
    var r=wave.getBoundingClientRect(),f=(e.clientX-r.left)/r.width;
    [1,2,3,4].forEach(function(i){audio[i].currentTime=Math.max(0,Math.min(.999,f))*CLIP;});paint();
  });
  document.addEventListener("visibilitychange",function(){if(document.hidden&&playing)setPlaying(false);});
  draw(1);select(1);
})();
