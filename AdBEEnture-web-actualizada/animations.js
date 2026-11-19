'use strict';
(() => {
  const actions = {
    idle: {file:'Abeja_Idle.png',frames:2,fps:4,label:'Reposo',description:'Reposo: dos cuadros para una aventurera lista para partir.'},
    walk: {file:'Abeja_Walk.png',frames:4,fps:8,label:'Caminar',description:'Caminata: cuatro cuadros que dan vida a cada paso.'},
    jump: {file:'Abeja_Jump.png',frames:2,fps:3,label:'Saltar',description:'Salto: dos poses originales, acompañadas por un movimiento de demostración.'},
    attack: {file:'Abeja_Attack.png',frames:4,fps:8,label:'Atacar',description:'Ataque: una secuencia de cuatro cuadros con el aguijón.'},
    break: {file:'Abeja_Break_Object.png',frames:4,fps:7,label:'Romper objeto',description:'Romper objeto: los cuatro cuadros originales de esta acción.'}
  };
  const files = Object.fromEntries(Object.values(actions).map(a=>[a.file,a]));
  files['Moneda_Abeja.png']={frames:8,fps:10};
  // Keep original sheets in the gallery; animate only the thumbnail previews.
  document.querySelectorAll('#protagonista img, #escenarios img').forEach(img=>{
    const file=img.getAttribute('src'); const a=files[file]; if(!a)return;
    const sprite=document.createElement('span'); sprite.className='sprite'; sprite.role='img';
    sprite.setAttribute('aria-label',img.alt+' animada');
    Object.assign(sprite.dataset,{sheet:file,frames:a.frames,size:file==='Moneda_Abeja.png'?32:64,fps:a.fps});
    if(file==='Moneda_Abeja.png'){sprite.style.width='96px';sprite.style.height='96px';}
    img.parentElement.classList.add('sprite-preview'); img.replaceWith(sprite);
  });
  galleries.personaje.push({url:'Abeja_Attack.png',title:'Abeja Attack (Ataque)',caption:'Secuencia original de cuatro cuadros de ataque.'});
  galleries.mundo.push({url:'trap_spike.png',title:'Trampa de púas',caption:'Púas que forman parte de los obstáculos del escenario.'});
  const addCard=(section,key,title,description,content)=>{
    const row=document.querySelector(section+' .overflow-x-auto');
    const b=document.createElement('button'); b.type='button';b.className='extra-art-card';
    b.innerHTML='<div class="art-preview">'+content+'</div><h3>'+title+'</h3><p>'+description+'</p>';
    b.addEventListener('click',()=>openGallery(key,4));row.append(b);
  };
  addCard('#protagonista','personaje','Abeja Attack','Mira la animación y amplía sus cuadros.','<span class="sprite" role="img" aria-label="Abeja atacando" data-sheet="Abeja_Attack.png" data-frames="4" data-size="64" data-fps="8"></span>');
  addCard('#escenarios','mundo','Trampa de púas','Un obstáculo más en el camino.','<img src="trap_spike.png" alt="Fila de púas" width="256" height="64">');
  const sprites=[...document.querySelectorAll('.sprite')];
  function prepare(el){el.style.backgroundImage='url("'+el.dataset.sheet+'")';el.style.backgroundSize=(Number(el.dataset.frames)*100)+'% 100%';}
  sprites.forEach(prepare);
  function frame(el,index){const count=Number(el.dataset.frames);el.style.backgroundPosition=(count>1?index/(count-1)*100:0)+'% 0';el.dataset.frame=String(index);}
  const main=document.getElementById('mainSprite');
  const toggle=document.getElementById('motionToggle');
  const counter=document.getElementById('frameCounter');
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=preference.matches, speed=1, time=0, last=0, selected='idle';
  function updateToggle(){toggle.textContent=paused?'Reproducir animaciones':'Pausar animaciones';toggle.setAttribute('aria-pressed',String(paused));}
  function draw(){
    sprites.forEach(el=>frame(el,Math.floor(time*Number(el.dataset.fps))%Number(el.dataset.frames)));
    const phase=(time*1.5)%1;
    main.style.transform=selected==='jump'?'translateY('+(-Math.sin(phase*Math.PI)*65)+'px)':'none';
    counter.textContent='Cuadro '+(Number(main.dataset.frame)+1)+' de '+main.dataset.frames;
  }
  function loop(now){if(last&&!paused&&!document.hidden)time+=Math.min((now-last)/1000,.1)*speed;last=now;draw();requestAnimationFrame(loop);}
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{
    selected=button.dataset.action;const a=actions[selected];
    Object.assign(main.dataset,{sheet:a.file,frames:a.frames,fps:a.fps});
    main.setAttribute('aria-label','Abeja: '+a.label);prepare(main);time=0;draw();
    document.querySelectorAll('[data-action]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.getElementById('actionDescription').textContent=a.description;
  }));
  toggle.addEventListener('click',()=>{paused=!paused;updateToggle();});
  document.getElementById('animationSpeed').addEventListener('change',e=>{speed=Number(e.target.value);});
  document.getElementById('nextFrame').addEventListener('click',()=>{paused=true;updateToggle();time=(Math.floor(time*Number(main.dataset.fps))+1)/Number(main.dataset.fps)+.00001;draw();});
  preference.addEventListener('change',e=>{paused=e.matches;updateToggle();});
  updateToggle();draw();requestAnimationFrame(loop);
  // Keyboard access, focus containment, focus return, and backdrop dismissal.
  let previousFocus=null;
  const originalOpen=window.openGallery, originalClose=window.closeGallery;
  const modal=document.getElementById('galleryModal');
  window.openGallery=(key,index)=>{previousFocus=document.activeElement;originalOpen(key,index);document.body.classList.add('gallery-open');modal.querySelector('button').focus();};
  window.closeGallery=()=>{const wasOpen=!modal.classList.contains('hidden');originalClose();document.body.classList.remove('gallery-open');if(wasOpen)previousFocus?.focus();};
  document.querySelectorAll('[onclick^="openGallery"]').forEach(card=>{card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label','Ampliar '+card.querySelector('h3').textContent);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}});});
  modal.addEventListener('click',e=>{if(e.target===modal)closeGallery();});
  modal.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight')nextImage();if(e.key==='ArrowLeft')prevImage();
    if(e.key==='Tab'){const buttons=[...modal.querySelectorAll('button')];const first=buttons[0],lastButton=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();lastButton.focus();}else if(!e.shiftKey&&document.activeElement===lastButton){e.preventDefault();first.focus();}}
  });
})();
