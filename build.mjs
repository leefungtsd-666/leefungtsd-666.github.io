import fs from 'node:fs';
import matter from 'gray-matter';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
marked.use(markedKatex({throwOnError:true}));
fs.mkdirSync('assets/katex',{recursive:true});
fs.cpSync('node_modules/katex/dist/katex.min.css','assets/katex/katex.min.css');
fs.cpSync('node_modules/katex/dist/fonts','assets/katex/fonts',{recursive:true});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const notes=fs.readdirSync('content').filter(f=>f.endsWith('.md')).map(f=>{const {data,content}=matter(fs.readFileSync('content/'+f,'utf8'));return {...data,id:f.slice(0,-3),content};});
const shell=(title,body)=>`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="以简洁的 Markdown 论文卡片记录核心方法，快速复习与关联思考。"><title>${esc(title)} · 🌰小站</title><link rel="stylesheet" href="/assets/style.css?v=close-polish"><link rel="stylesheet" href="/assets/katex/katex.min.css"><header><a href="/">🌰小站</a><button id="theme" aria-label="切换深色模式">深色模式</button></header><main>${body}</main><script src="/assets/app.js?v=close-polish" defer></script></html>`;
const tags=[...new Set(notes.flatMap(n=>n.tags))];
fs.writeFileSync('index.html',shell('首页',`<div class="search-top"><a class="site-name" href="/">🌰小站</a><label class="sr-only" for="search">搜索论文、方法或关键词</label><input id="search" type="search" placeholder="搜索论文、方法或关键词…"></div><p id="count" class="sr-only" role="status">${notes.length} 张卡片</p><section class="cards">${notes.map(n=>`<article data-id="${esc(n.id)}" data-tags="${esc(JSON.stringify(n.tags))}" data-search="${esc([n.title,n.summary,n.abstract||'',n.content,...n.tags].join(' ').toLowerCase())}"><details class="paper-card"><summary>${n.example?'<span class="badge">示例</span>':''}<h2>${esc(n.title)}</h2><p>${esc(n.summary)}</p><span class="expand-hint">展开摘要</span></summary><div class="abstract"><h3>摘要</h3><p>${esc(n.abstract||'摘要待补充。')}</p><a class="read" href="/papers/${n.id}/">详情 →</a></div></details></article>`).join('')}</section><p id="empty" hidden>没有匹配的卡片，试试其他关键词。</p>`));
for (const old of fs.existsSync('papers') ? fs.readdirSync('papers') : []) { if (!notes.some(n=>n.id===old)) fs.rmSync('papers/'+old,{recursive:true}); }
fs.mkdirSync('papers',{recursive:true});
for(const n of notes){fs.mkdirSync('papers/'+n.id,{recursive:true});const related=(n.related||[]).map(id=>{const item=notes.find(x=>x.id===id);if(!item)throw Error('Unknown related note '+id);return `<li><a href="/papers/${id}/">${esc(item.title)}</a></li>`}).join('');fs.writeFileSync(`papers/${n.id}/index.html`,shell(n.title,`<div class="note"><a href="/">HOME</a><h1>${esc(n.title)}</h1><p class="summary">${esc(n.summary)}</p>${marked(n.content)}${related ? '<h2>关联论文</h2><ul>'+related+'</ul>' : ''}</div>`));}
console.log(`Built ${notes.length} cards`);

