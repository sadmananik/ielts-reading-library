'use strict';
// Appearance is kept in memory and passed in page links; no browser storage.
(()=>{
 const root=document.documentElement;
 const valid=['system','light','dark'];
 const media=window.matchMedia('(prefers-color-scheme: dark)');
 const requested=new URLSearchParams(window.location.search).get('theme');
 let mode=valid.includes(requested)?requested:'system';
 function apply(){
  root.dataset.themeMode=mode;
  root.dataset.theme=mode==='system'?(media.matches?'dark':'light'):mode;
 }
 apply();
 if(media.addEventListener)media.addEventListener('change',apply);
 else if(media.addListener)media.addListener(apply);
 document.addEventListener('DOMContentLoaded',()=>{
  const select=document.getElementById('appearance-select');
  if(!select)return;
  select.value=mode;
  select.addEventListener('change',()=>{mode=valid.includes(select.value)?select.value:'system';apply();});
 });
 // Carry the choice between the library and tests, including when opened as files.
 document.addEventListener('click',event=>{
  const anchor=event.target.closest('a[href]');
  if(!anchor||anchor.hasAttribute('download'))return;
  const href=anchor.getAttribute('href');
  const url=new URL(href,window.location.href),current=new URL(window.location.href);
  if(url.origin!==current.origin||url.pathname.slice(0,url.pathname.lastIndexOf('/'))!==current.pathname.slice(0,current.pathname.lastIndexOf('/'))||!/\/(?:index|source-\d{3})\.html$/.test(url.pathname))return;
  if(mode==='system')url.searchParams.delete('theme');
  else url.searchParams.set('theme',mode);
  anchor.href=url.href;
 });
})();
