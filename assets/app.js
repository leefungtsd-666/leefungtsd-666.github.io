let saved;try{saved=localStorage.getItem('theme')}catch{}document.body.classList.toggle('dark',saved?saved==='dark':matchMedia('(prefers-color-scheme: dark)').matches);const theme=document.querySelector('#theme');function sync(){theme.textContent=document.body.classList.contains('dark')?'浅色模式':'深色模式'}sync();theme.onclick=()=>{document.body.classList.toggle('dark');sync();try{localStorage.setItem('theme',document.body.classList.contains('dark')?'dark':'light')}catch{}};const search=document.querySelector('#search');let tag='';function filter(){let count=0;document.querySelectorAll('article[data-search]').forEach(card=>{const show=card.dataset.search.includes(search.value.trim().toLowerCase())&&(!tag||JSON.parse(card.dataset.tags).includes(tag));card.hidden=!show;if(show)count++});document.querySelector('#count').textContent=count+' 张卡片';document.querySelector('#empty').hidden=count>0}if(search){search.oninput=filter;document.querySelectorAll('[data-tag]').forEach(button=>button.onclick=()=>{tag=button.dataset.tag;document.querySelectorAll('[data-tag]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filter()})}

const modal=document.createElement('dialog');modal.className='paper-modal';modal.innerHTML='<button class="modal-close" aria-label="关闭摘要">×</button><div class="modal-content"></div>';document.body.append(modal);
let openingCard;
function closeModal(){modal.classList.add('closing');setTimeout(()=>{modal.close();modal.classList.remove('closing');document.body.style.overflow='';openingCard?.focus()},180)}
modal.querySelector('.modal-close').onclick=closeModal;
modal.addEventListener('cancel',e=>{e.preventDefault();closeModal()});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal()}});
document.querySelectorAll('.paper-card summary').forEach(card=>card.addEventListener('click',e=>{e.preventDefault();openingCard=card;const r=card.getBoundingClientRect();modal.style.setProperty('--origin-x',`${r.left+r.width/2-innerWidth/2}px`);modal.style.setProperty('--origin-y',`${r.top+r.height/2-innerHeight/2}px`);modal.querySelector('.modal-content').innerHTML=card.innerHTML.replace(/<span class="expand-hint">.*?<\/span>/,'')+card.nextElementSibling.outerHTML;modal.setAttribute('aria-label',card.querySelector('h2').textContent);modal.showModal();document.body.style.overflow='hidden'}));
const tiltAllowed=matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
document.querySelectorAll('.cards article').forEach(card=>{
 let frame=0;
 const reset=()=>{cancelAnimationFrame(frame);for(const key of ['--rx','--ry','--mx','--my','--sx','--glow'])card.style.removeProperty(key)};
 card.addEventListener('pointermove',event=>{
  if(!tiltAllowed.matches)return;
  const rect=card.getBoundingClientRect();
  const x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
  const y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
  cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   card.style.setProperty('--rx',`${(0.5-y)*10}deg`);card.style.setProperty('--ry',`${(x-0.5)*10}deg`);
   card.style.setProperty('--mx',`${x*100}%`);card.style.setProperty('--my',`${y*100}%`);
   card.style.setProperty('--sx',`${(0.5-x)*16}px`);card.style.setProperty('--glow','1');
  });
 });
 card.addEventListener('pointerleave',reset);card.addEventListener('pointercancel',reset);card.addEventListener('click',reset);tiltAllowed.addEventListener('change',reset);
});
// Figures enlarge in place; no modal obscures the notes.
document.querySelectorAll('.paper-figure>a').forEach(link=>{
 link.removeAttribute('target');
 link.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'){link.classList.add('is-zoomed');link.closest('figure').classList.add('zoom-active')}});
 link.addEventListener('pointerleave',()=>{link.classList.remove('is-zoomed');link.closest('figure').classList.remove('zoom-active')});
 link.addEventListener('pointercancel',()=>{link.classList.remove('is-zoomed');link.closest('figure').classList.remove('zoom-active')});
 link.setAttribute('aria-label','放大查看图片');
 link.addEventListener('click',event=>event.preventDefault());
});
