'use strict';
// Text offsets, scoped to stable text blocks, survive re-rendering without storage.
(()=>{
 const blocksSelector='#passage .reading-text, #questions legend, #questions .heading-list li, #questions .instruction, #questions .task-text';
 const add=document.getElementById('highlight-add'),remove=document.getElementById('highlight-remove');
 const menu=document.getElementById('highlight-menu'),status=document.getElementById('highlight-status');
 let page=1,marks=new Map(),pending=[];
 const blocks=()=>Array.from(document.querySelectorAll(blocksSelector));
 const key=i=>`${page}:${i}`;
 function rangesForSelection(){
  const selection=window.getSelection();if(!selection||selection.isCollapsed||!selection.rangeCount)return [];
  const selected=selection.getRangeAt(0),found=[];
  blocks().forEach((block,i)=>{
   if(!selected.intersectsNode(block))return;
   const contents=document.createRange();contents.selectNodeContents(block);
   const clipped=contents.cloneRange();
   if(block.contains(selected.startContainer))clipped.setStart(selected.startContainer,selected.startOffset);
   if(block.contains(selected.endContainer))clipped.setEnd(selected.endContainer,selected.endOffset);
   if(!clipped.toString().trim())return;
   const prefix=contents.cloneRange();prefix.setEnd(clipped.startContainer,clipped.startOffset);
   const start=prefix.toString().length;
   found.push({id:key(i),start,end:start+clipped.toString().length});
  });return found;
 }
 function merge(ranges){
  const result=[];
  for(const r of ranges.sort((a,b)=>a.start-b.start)){const last=result[result.length-1];if(last&&r.start<=last.end)last.end=Math.max(last.end,r.end);else result.push({...r});}return result;
 }
 function paint(){
  blocks().forEach((block,i)=>{
   block.querySelectorAll('mark.user-highlight').forEach(mark=>mark.replaceWith(...mark.childNodes));block.normalize();
   const ranges=marks.get(key(i))||[];if(!ranges.length)return;
   const walker=document.createTreeWalker(block,NodeFilter.SHOW_TEXT);let node,offset=0;const nodes=[];
   while((node=walker.nextNode())){nodes.push({node,start:offset,end:offset+node.length});offset+=node.length;}
   for(const entry of nodes){
    const overlaps=ranges.filter(r=>r.start<entry.end&&r.end>entry.start);if(!overlaps.length)continue;
    const fragment=document.createDocumentFragment();let pos=0;
    for(const r of overlaps){const start=Math.max(0,r.start-entry.start),end=Math.min(entry.node.length,r.end-entry.start);fragment.append(document.createTextNode(entry.node.data.slice(pos,start)));const mark=document.createElement('mark');mark.className='user-highlight';mark.textContent=entry.node.data.slice(start,end);fragment.append(mark);pos=end;}
    fragment.append(document.createTextNode(entry.node.data.slice(pos)));entry.node.replaceWith(fragment);
   }
  });
 }
 function resetSelection(){pending=[];add.disabled=remove.disabled=true;menu.hidden=true;window.getSelection()?.removeAllRanges();}
 function act(action){
  if(!pending.length)return;
  for(const range of pending){let existing=marks.get(range.id)||[];
   if(action==='add')existing=merge([...existing,{start:range.start,end:range.end}]);
   else existing=existing.flatMap(r=>r.end<=range.start||r.start>=range.end?[r]:[{start:r.start,end:Math.min(r.end,range.start)},{start:Math.max(r.start,range.end),end:r.end}].filter(x=>x.start<x.end));
   if(existing.length)marks.set(range.id,existing);else marks.delete(range.id);
  }
  resetSelection();paint();status.textContent=action==='add'?'Text highlighted.':'Highlight removed.';
 }
 function capture(){pending=rangesForSelection();add.disabled=remove.disabled=!pending.length;if(!pending.length)menu.hidden=true;}
 document.addEventListener('selectionchange',capture);
 document.addEventListener('contextmenu',event=>{
  capture();if(!pending.length)return;event.preventDefault();menu.hidden=false;
  menu.style.left=Math.max(8,Math.min(event.clientX,window.innerWidth-230))+'px';
  menu.style.top=Math.max(8,Math.min(event.clientY,window.innerHeight-70))+'px';
 });
 [add,remove,menu].forEach(el=>el.addEventListener('pointerdown',event=>event.preventDefault()));
 add.onclick=()=>act('add');remove.onclick=()=>act('remove');
 menu.onclick=event=>{const button=event.target.closest('[data-highlight-action]');if(button)act(button.dataset.highlightAction);};
 document.addEventListener('pointerdown',event=>{if(!menu.contains(event.target))menu.hidden=true;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')menu.hidden=true;});
 document.addEventListener('scroll',()=>{menu.hidden=true;},true);
 function clear(){marks.clear();resetSelection();paint();status.textContent='Your highlights cleared.';}
 document.getElementById('highlight-clear').onclick=clear;
 window.readingHighlighter={restore(nextPage){page=nextPage;resetSelection();paint();},clear};
})();
