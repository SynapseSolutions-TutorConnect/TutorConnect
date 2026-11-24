'use strict';
// Solo navegación. Las autorizaciones siguen a cargo de sesion.js y la base de datos.
document.addEventListener('DOMContentLoaded', () => {
 const boton=document.getElementById('t24-menu-boton');
 const menu=document.getElementById('t24-menu');
 if(boton && menu){
  const cerrar=(foco=false)=>{menu.classList.add('hidden');boton.setAttribute('aria-expanded','false');boton.setAttribute('aria-label','Abrir menú');if(foco)boton.focus();};
  boton.addEventListener('click',()=>{const abrir=boton.getAttribute('aria-expanded')!=='true';menu.classList.toggle('hidden',!abrir);boton.setAttribute('aria-expanded',String(abrir));boton.setAttribute('aria-label',abrir?'Cerrar menú':'Abrir menú');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && boton.getAttribute('aria-expanded')==='true')cerrar(true);});
  window.matchMedia('(min-width:768px)').addEventListener('change',e=>{if(e.matches)cerrar();});
  menu.querySelectorAll('a').forEach(a=>{if(new URL(a.href).pathname===location.pathname)a.setAttribute('aria-current','page');});
 }
});
