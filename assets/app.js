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
if(search){
 const cards=[...document.querySelectorAll('.cards article')];
 const initial=Object.fromEntries(cards.map(c=>[c.dataset.id,JSON.parse(c.dataset.tags)]));
 let state={labels:[...new Set(Object.values(initial).flat())],papers:initial,deleted:[]};
 try{const old=JSON.parse(localStorage.getItem('paper-tags-v1'));if(old&&Array.isArray(old.labels)&&old.papers){state=old;state.deleted??=[];for(const [id,tags] of Object.entries(initial))if(!state.papers[id]){state.papers[id]=tags.filter(t=>!state.deleted.includes(t));state.labels=[...new Set([...state.labels,...state.papers[id]])]}}}catch{}
 let selected=new Set(),editing=null;
 const entry=document.createElement('button');entry.className='tag-entry';entry.textContent='标签';entry.setAttribute('aria-label','打开标签筛选与管理');document.body.append(entry);
 const panel=document.createElement('dialog');panel.className='tag-panel';panel.innerHTML='<button class="tag-close" aria-label="关闭标签面板">×</button><h2></h2><p class="tag-help"></p><form class="tag-form"><input aria-label="新标签名称" maxlength="30" placeholder="输入新标签"><button type="submit">添加</button></form><div class="tag-options"></div><p class="tag-status" role="status"></p><div class="tag-actions"><button class="tag-clear">清除筛选</button><button class="tag-done">完成</button></div><small>标签修改保存在当前浏览器</small>';document.body.append(panel);
 const options=panel.querySelector('.tag-options'),status=panel.querySelector('.tag-status');
 
 function renderModalTags(){
  if(!modal.open||!openingCard)return;
  const id=openingCard.closest('article').dataset.id;
  let row=modal.querySelector('.modal-tags');
  if(!row){row=document.createElement('div');row.className='modal-tags';modal.querySelector('.abstract').before(row)}
  row.replaceChildren();
  for(const name of state.papers[id]||[]){
   const chip=document.createElement('span');chip.className='paper-tag';const text=document.createElement('span');text.textContent=name;
   const remove=document.createElement('button');remove.textContent='×';remove.setAttribute('aria-label','从本论文移除 '+name);
   remove.onclick=()=>{state.papers[id]=state.papers[id].filter(t=>t!==name);persist();apply()};chip.append(text,remove);row.append(chip);
  }
  const add=document.createElement('button');add.className='add-paper-tag';add.textContent='＋';add.setAttribute('aria-label','从已有标签添加');add.onclick=()=>open(id);row.append(add);
 }
 document.querySelectorAll('.paper-card summary').forEach(summary=>summary.addEventListener('click',()=>renderModalTags()));

 function persist(){try{localStorage.setItem('paper-tags-v1',JSON.stringify(state))}catch{status.textContent='浏览器无法保存，当前修改仅在本次页面有效。'}}
 function apply(){renderModalTags();let count=0;for(const card of cards){const labels=state.papers[card.dataset.id]||[];card.dataset.tags=JSON.stringify(labels);const match=card.dataset.search.includes(search.value.trim().toLowerCase())||labels.some(t=>t.toLowerCase().includes(search.value.trim().toLowerCase()));card.hidden=!(match&&(!selected.size||labels.some(t=>selected.has(t))));if(!card.hidden)count++;const box=card.querySelector('.card-labels');box.replaceChildren();for(const t of labels){const span=document.createElement('span');span.textContent=t;box.append(span)}}document.querySelector('#count').textContent=count+' 张卡片';document.querySelector('#empty').hidden=count>0;entry.textContent=selected.size?'标签 '+selected.size:'标签'}
 function render(){panel.querySelector('h2').textContent=editing?'编辑卡片标签':'标签';panel.querySelector('.tag-help').textContent=editing?'选择要添加到这张论文的已有标签。':'点击标签筛选论文（多个标签匹配任意一个）；× 将从所有论文中删除该标签。';panel.querySelector('.tag-clear').hidden=!!editing;panel.querySelector('.tag-form').hidden=!!editing;options.replaceChildren();for(const name of state.labels){const wrap=document.createElement('div');wrap.className='tag-option';const choose=document.createElement('button');choose.textContent=name;const active=editing?(state.papers[editing]||[]).includes(name):selected.has(name);choose.setAttribute('aria-pressed',String(active));choose.onclick=()=>{if(editing){const labels=state.papers[editing]||[];state.papers[editing]=active?labels.filter(t=>t!==name):[...labels,name];persist()}else{selected.has(name)?selected.delete(name):selected.add(name)}render();apply()};const remove=document.createElement('button');remove.className='tag-delete';remove.textContent='×';remove.setAttribute('aria-label','从所有论文删除标签 '+name);remove.onclick=()=>{state.labels=state.labels.filter(t=>t!==name);state.deleted=[...new Set([...state.deleted,name])];for(const id of Object.keys(state.papers))state.papers[id]=state.papers[id].filter(t=>t!==name);selected.delete(name);persist();render();apply();status.textContent='已从所有论文移除“'+name+'”。'};wrap.append(choose);if(!editing)wrap.append(remove);options.append(wrap)}if(!state.labels.length)options.textContent='暂无标签，请添加。'}
 function open(id=null){editing=id;status.textContent='';render();panel.showModal()}
 function close(){panel.close()}
 entry.onclick=()=>open();panel.querySelector('.tag-close').onclick=close;panel.querySelector('.tag-done').onclick=close;panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});
 panel.querySelector('.tag-clear').onclick=()=>{selected.clear();render();apply()};
 panel.querySelector('form').onsubmit=e=>{e.preventDefault();const input=panel.querySelector('input'),name=input.value.trim();if(!name)return;if(state.labels.includes(name)){status.textContent='该标签已存在。';return}state.labels.push(name);state.deleted=state.deleted.filter(t=>t!==name);if(editing)state.papers[editing]=[...(state.papers[editing]||[]),name];input.value='';persist();render();apply();status.textContent='已添加“'+name+'”。'};
 for(const card of cards){const box=document.createElement('div');box.className='card-labels';const edit=document.createElement('button');edit.className='edit-tags';edit.textContent='＋';edit.setAttribute('aria-label','添加论文标签');edit.onclick=e=>{e.stopPropagation();open(card.dataset.id)};card.append(box,edit)}
 search.oninput=apply;apply();
}
