'use strict';
const tests=window.READING_TESTS;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
const statsKey='reading-room-attempts-v1';
const draftKey='reading-room-draft-v1';
function readStats(){try{const value=JSON.parse(localStorage.getItem(statsKey)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}}
function testStats(id){const s=readStats()[id];return s&&Number.isInteger(s.attempts)&&s.attempts>=0&&Number.isFinite(s.bestScore)&&s.bestScore>=0&&s.bestScore<=40?s:{attempts:0,bestScore:0};}
function formatTime(seconds){return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
function savedTime(s){return Number.isInteger(s.fastestSeconds)&&s.fastestSeconds>=0&&s.fastestSeconds<=3600?s.fastestSeconds:null;}
function statsLabel(id){const s=testStats(id),time=savedTime(s);return `Attempts: ${s.attempts} · Best score: ${s.attempts?s.bestScore+' / 40':'—'} · Fastest: ${time===null?'—':formatTime(time)}`;}
function questionTypes(t){
 const names={heading:'Matching headings',paragraph:'Matching information',summary:'Summary completion',choice:'Matching',mcq:'Multiple choice (MCQ)',tfng:'True/False/Not Given',multi:'Multiple answers',multiSingle:'Multiple answers'};
 return [...new Set(t.questions.map(q=>{
  const task=t.groups?.find(g=>g.id===q.group)?.text||'';
  if(q.type==='tfng')return q.options.includes('YES')?'Yes/No/Not Given':'True/False/Not Given';
  if(q.type==='gap')return /diagram|label/i.test(task)?'Diagram labelling':/flow.?chart/i.test(task)?'Flowchart completion':/table/i.test(task)?'Table completion':/summary/i.test(task)?'Summary completion':/notes/i.test(task)?'Note completion':'Fill in the gaps';
  return names[q.type]||'Fill in the gaps';
 }))].sort();
}
function recordAttempt(id,score,seconds){const all=readStats(),previous=testStats(id);all[id]={attempts:previous.attempts+1,bestScore:Math.max(previous.bestScore,score),fastestSeconds:savedTime(previous)===null?seconds:Math.min(previous.fastestSeconds,seconds)};try{localStorage.setItem(statsKey,JSON.stringify(all));return true;}catch{return false;}}
const active=document.body.dataset.test;
// Carry summaries through local page links too: file:// storage sharing varies by browser.
if(window.location?.search){
 const params=new URLSearchParams(window.location.search),id=active||params.get('resultTest');
 const count=Number(params.get('attempts')),best=Number(params.get('best'));
 if(tests.some(t=>t.id===id)&&Number.isInteger(count)&&count>0&&Number.isInteger(best)&&best>=0&&best<=40){
  const all=readStats(),old=testStats(id);all[id]={attempts:Math.max(old.attempts,count),bestScore:Math.max(old.bestScore,best)};
  const time=Number(params.get('fastest'));const previous=savedTime(old);
  if(params.has('fastest')&&Number.isInteger(time)&&time>=0&&time<=3600)all[id].fastestSeconds=previous===null?time:Math.min(previous,time);else if(previous!==null)all[id].fastestSeconds=previous;
  try{localStorage.setItem(statsKey,JSON.stringify(all));}catch{}
 }
}
function startLink(id){const s=testStats(id);return id+'.html?fresh=1'+(s.attempts?'&amp;attempts='+s.attempts+'&amp;best='+s.bestScore+(savedTime(s)===null?'':'&amp;fastest='+s.fastestSeconds):'');}
function updateReturnLinks(){
 const s=testStats(active);
 for(const a of document.querySelectorAll?.('a[href]')||[]){
  if(a.getAttribute('href')?.split('?')[0]==='index.html')a.setAttribute('href',`index.html?resultTest=${active}&attempts=${s.attempts}&best=${s.bestScore}${savedTime(s)===null?'':'&fastest='+s.fastestSeconds}`);
 }
}
if(!active){
 const search=document.querySelector('#test-search'),type=document.querySelector('#type-filter'),sort=document.querySelector('#test-sort');
 const types=new Map(tests.map(t=>[t.id,questionTypes(t)]));
 type.innerHTML='<option value="">All question types</option>'+[...new Set([...types.values()].flat())].sort().map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join('');
 function drawLibrary(){
  const query=norm(search.value),chosen=type.value||'',order=sort.value||'number';
  const filtered=tests.filter(t=>{
   const labels=types.get(t.id),haystack=norm([t.title,'test '+t.sourceNumber,t.sourceNumber,...t.passages.map(p=>p.title),...labels].join(' '));
   const numeric=query.match(/^(?:test\s*[-#]?\s*)?0*(\d+)$/);
   return (!query||(numeric?Number(numeric[1])===t.sourceNumber:query.split(' ').every(word=>haystack.includes(word))))&&(!chosen||labels.includes(chosen));
  });
  filtered.sort((a,b)=>{
   const sa=testStats(a.id),sb=testStats(b.id),tie=a.sourceNumber-b.sourceNumber;
   if(order==='score-high'||order==='score-low')return Number(sb.attempts>0)-Number(sa.attempts>0)||(order==='score-high'?sb.bestScore-sa.bestScore:sa.bestScore-sb.bestScore)||tie;
   if(order==='time')return (savedTime(sa)??Infinity)-(savedTime(sb)??Infinity)||tie;
   return tie;
  });
  document.querySelector('#test-count').textContent=`${filtered.length} of ${tests.length} tests`;
  document.querySelector('#tests').innerHTML=filtered.length?filtered.map(t=>`<section class="testcard${t.questions.some(q=>q.unavailable)?' testcard-missing':''}"><small>SOURCE TEST ${t.sourceNumber} · 40 QUESTIONS · 3 PASSAGES</small><h2>${esc(t.title)}</h2>${t.questions.some(q=>q.unavailable)?'<span class="missing-badge">Missing content</span>':''}<p class="test-stats">${statsLabel(t.id)}</p><ol>${t.passages.map(p=>`<li>${esc(p.title)}</li>`).join('')}</ol><ul class="question-type-list" aria-label="Question types">${types.get(t.id).map(name=>`<li>${esc(name)}</li>`).join('')}</ul><p class="muted">${t.questions.some(q=>q.unavailable)?`${t.questions.filter(q=>q.unavailable).length} questions have missing content and are excluded from scoring.`:'Ready when you are.'}</p><a class="button primary" href="${startLink(t.id)}">Start fresh →</a></section>`).join(''):'<p class="empty-tests">No tests match your search. Try a passage title, test number or a different question type.</p>';
 }
 search.addEventListener('input',drawLibrary);type.addEventListener('change',drawLibrary);sort.addEventListener('change',drawLibrary);
 drawLibrary();window.addEventListener?.('pageshow',drawLibrary);
}else{startExam();}
function startExam(){
 const t=tests.find(x=>x.id===active);let page=1,currentQuestion=1,answers={},review=null,attempt=testStats(active).attempts+1;
 const form=document.querySelector('#exam-form'),result=document.querySelector('#result'),mode=document.querySelector('#storage-mode');
 mode.textContent='Answers are saved as one recovery draft. Reload to resume, or choose Fresh start for a blank test.';
 const available=t.questions.filter(q=>!q.unavailable);
 document.querySelector('#test-title').textContent=t.title;
 const textSize=document.querySelector('#passage-text-size'),textSizeKey='reading-room-text-size-v1';
 const validTextSizes=['16','18','21','24'];
 function applyTextSize(value){
  const size=validTextSizes.includes(value)?value:'18';
  textSize.value=size;document.querySelector('#passage').style.fontSize=size+'px';
 }
 let preferredTextSize='18';try{preferredTextSize=localStorage.getItem(textSizeKey)||'18';}catch{}
 applyTextSize(preferredTextSize);
 textSize.addEventListener('change',()=>{
  applyTextSize(textSize.value);
  try{localStorage.setItem(textSizeKey,textSize.value);}catch{}
 });
 const timer=document.querySelector('#exam-timer');
 let deadline=Date.now()+60*60*1000,timerHandle=null,lastSeconds=3600,warningUntil=0;
 function saveDraft(){
  if(review)return;
  try{localStorage.setItem(draftKey,JSON.stringify({version:1,testId:t.id,answers,page,currentQuestion,deadline,attempt,highlights:window.readingHighlighter?.serialize()||[]}));}
  catch{mode.textContent='Automatic recovery is unavailable: browser storage is blocked or full. Keep this page open to retain your answers.';}
 }
 if(window.readingHighlighter)window.readingHighlighter.onChange=saveDraft;
 function clearDraft(){try{const d=JSON.parse(localStorage.getItem(draftKey)||'null');if(d?.testId===t.id)localStorage.removeItem(draftKey);}catch{}}
 function restoreDraft(){
  try{
   const d=JSON.parse(localStorage.getItem(draftKey)||'null');
   if(!d||d.version!==1||d.testId!==t.id||!Number.isFinite(d.deadline)||d.deadline>Date.now()+3600000||!d.answers||typeof d.answers!=='object'||Array.isArray(d.answers))return false;
   window.readingHighlighter?.load(d.highlights);
   answers={};for(const q of t.questions)if(typeof d.answers[q.number]==='string'&&d.answers[q.number].length<=500)answers[q.number]=d.answers[q.number];
   page=[1,2,3].includes(d.page)?d.page:1;
   currentQuestion=t.questions.some(q=>q.number===d.currentQuestion&&q.passage===page)?d.currentQuestion:t.questions.find(q=>q.passage===page).number;
   if(Number.isInteger(d.attempt)&&d.attempt>0)attempt=d.attempt;
   deadline=d.deadline;mode.textContent='Unfinished test restored. The original timer continues. Choose Fresh start to discard it.';return true;
  }catch{return false;}
 }
 function tick(){
  if(review)return;
  const seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));
  if((lastSeconds>600&&seconds<=600)||(lastSeconds>300&&seconds<=300))warningUntil=Date.now()+4000;
  timer.textContent=`Time left ${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  timer.className='exam-timer'+(seconds<=600?' timer-warning':'')+(Date.now()<warningUntil?' timer-flash':'');
  if(lastSeconds>600&&seconds<=600)document.querySelector('#timer-status').textContent='10 minutes remaining.';
  if(lastSeconds>300&&seconds<=300)document.querySelector('#timer-status').textContent='5 minutes remaining.';
  lastSeconds=seconds;
  if(seconds===0)submitAttempt(true);
 }
 function startTimer(resume=false){clearInterval(timerHandle);if(!resume)deadline=Date.now()+60*60*1000;lastSeconds=3600;warningUntil=0;document.querySelector('#timer-status').textContent='';saveDraft();tick();if(!review)timerHandle=setInterval(tick,1000);}
 function correct(q){
 if(q.unavailable)return false;
 if(q.unorderedGroup&&t.questions.some(x=>x.number<q.number&&x.unorderedGroup===q.unorderedGroup&&norm(answers[x.number])===norm(answers[q.number])))return false;
 if(q.type==='multiSingle'){
  const tokens=value=>String(value||'').split(/[,&]/).map(norm).filter(Boolean).sort().join(',');
  return tokens(answers[q.number])===tokens(q.answer);
 }
 return (q.acceptedAnswers||[q.answer]).some(a=>norm(answers[q.number])===norm(a));
 }
 function answered(q){
  if(q.type==='multiSingle')return String(answers[q.number]||'').split(/[,&]/).filter(v=>norm(v)).length===Number(q.choiceCount);
  return !!norm(answers[q.number]);
 }
 function drawQuestionNav(){
  document.querySelector('#question-nav').innerHTML=`<div class="question-nav-heading"><strong>Questions</strong><span>Underlined = answered · Empty = unanswered</span></div>`+t.passages.map((p,i)=>`<div class="question-nav-part"><span>Passage ${i+1}</span><div class="question-numbers">${t.questions.filter(q=>q.passage===i+1).map(q=>`<button type="button" data-question="${q.number}" class="question-number ${q.unavailable?'unavailable':answered(q)?'answered':'unanswered'}" ${q.number===currentQuestion?'aria-current="step"':''} aria-label="Question ${q.number}, ${q.unavailable?'unavailable':answered(q)?'answered':'unanswered'}${q.number===currentQuestion?', current question':''}" ${q.unavailable?'disabled':''}>${q.number}</button>`).join('')}</div></div>`).join('');
 }
 function draw(){
 document.querySelector('#progress').textContent=`${available.filter(answered).length} / ${available.length} answered`;
 drawQuestionNav();
 document.querySelector('#passage-nav').innerHTML=t.passages.map((p,i)=>`<button type="button" data-page="${i+1}" aria-pressed="${page===i+1}">Passage ${i+1} · ${t.questions.find(q=>q.passage===i+1).number}–${t.questions.filter(q=>q.passage===i+1).at(-1).number}</button>`).join('');
 const p=t.passages[page-1];
 document.querySelector('#passage').innerHTML=`<small>PASSAGE ${page}</small><h2>${esc(p.title)}</h2>${p.titleNote?`<p class="muted">${esc(p.titleNote)}</p>`:''}`+p.paragraphs.map(para=>{
 const related=review?t.questions.filter(q=>q.passage===page&&q.paragraph===para.label):[];let content=esc(para.text);
 if(review){const phrases=[...new Set(related.filter(q=>q.type==='gap'||q.type==='summary').flatMap(q=>q.acceptedAnswers||[q.answer]))].sort((a,b)=>b.length-a.length);if(phrases.length){const rx=new RegExp(phrases.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'gi');content=content.replace(rx,m=>`<mark>${m}</mark>`);}}
 return `<p id="para-${para.label}" class="${related.length?'evidence':''}"><span class="para-label">${esc(para.label)}</span><span class="reading-text">${content}</span>${related.length?`<span class="evidence-tags">Relevant to ${related.map(q=>'Q'+q.number).join(', ')} · paragraph evidence</span>`:''}</p>`;
 }).join('');
 const instructions={1:'Questions 1–9 · Reading Passage 1 has nine paragraphs A–I. Choose the correct heading for each paragraph from the list below. There are more headings than paragraphs.',10:'Questions 10–13 · Choose A, B, C or D.',14:'Questions 14–19 · Complete the summary using words from the box. '+t.questions.find(q=>q.number===14).options.join(' · '),20:'Questions 20–26 · TRUE: agrees with the passage. FALSE: contradicts the passage. NOT GIVEN: the passage does not give this information.',27:'Questions 27–33 · Choose the paragraph A–I containing the information. Letters may be used more than once.',34:'Questions 34–39 · Use NO MORE THAN TWO WORDS from the passage for each answer.',40:'Question 40 · Choose the best title, A, B, C or D.'};
 document.querySelector('#questions').innerHTML=t.questions.filter(q=>q.passage===page).map(q=>{
 const n=q.number;let control;
 if(q.type==='multi'&&n!==q.multiStart)return '';
 const group=t.groups?.find(g=>g.id===q.group);
 const groupIntro=group&&group.first===n?`<section class="task-context"><h3>Questions ${group.first}${group.last!==group.first?'–'+group.last:''}</h3><div class="task-text">${esc(group.text)}</div>${(group.media||[]).map(m=>`<figure class="diagram-figure"><a href="${esc(m.src)}" target="_blank" rel="noopener" aria-label="Open full-size diagram: ${esc(m.alt)}"><img src="${esc(m.src)}" alt="${esc(m.alt)}" loading="lazy"></a><figcaption>${esc(m.caption||'Click the diagram to open it at full size.')} <a href="${esc(m.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a></figcaption></figure>`).join('')}${group.note?`<p class="source-note">${esc(group.note)}</p>`:''}${group.warning?`<p class="missing-notice">${esc(group.warning)}</p>`:''}</section>`:'';
 const previous=t.questions.find(x=>x.number===n-1);
 const headingList=!t.groups&&q.type==='heading'&&(!previous||previous.type!=='heading'||previous.passage!==q.passage)
  ?`<section class="heading-list" aria-labelledby="headings-${n}"><h3 id="headings-${n}">List of Headings</h3><ul>${q.options.map(o=>{const split=o.indexOf(' ');return `<li><span class="heading-number">${esc(o.slice(0,split))}</span><span>${esc(o.slice(split+1))}</span></li>`;}).join('')}</ul></section>`:'';
 if(q.unavailable)control=`<p class="muted">Not scored: ${esc(q.unavailableReason||'Required question text, option or visual is missing from the supplied file.')}</p>`;
 else if(q.type==='multi'||q.type==='multiSingle')control=q.options.map(o=>{
  const single=q.type==='multiSingle';const chosen=single?String(answers[n]||'').split(/[,&]/).map(v=>v.trim()):t.questions.filter(x=>x.group===q.group).map(x=>answers[x.number]);
  return `<label class="option"><input type="checkbox" name="${single?'multione'+n:'multi'+q.multiStart}" data-start="${single?n:q.multiStart}" data-end="${single?n:q.multiEnd}" data-single="${single}" data-count="${single?q.choiceCount:q.multiEnd-q.multiStart+1}" value="${esc(o.split(' ')[0])}" ${chosen.includes(o.split(' ')[0])?'checked':''} ${review?'disabled':''}>${esc(o)}</label>`;
 }).join('');
 else if(q.type==='gap')control=`<input type="text" id="q${n}" name="q${n}" value="${esc(answers[n]||'')}" autocomplete="off" aria-label="Answer to question ${n}" ${review?'disabled':''}>`;
 else if(['heading','paragraph','summary','choice'].includes(q.type))control=`<select id="q${n}" name="q${n}" aria-label="Answer to question ${n}" ${review?'disabled':''}><option value="">Choose an answer</option>${q.options.map(o=>{const val=['heading','choice'].includes(q.type)?o.split(' ')[0]:o;return `<option value="${esc(val)}" ${norm(answers[n])===norm(val)?'selected':''}>${esc(o)}</option>`;}).join('')}</select>`;
 else control=q.options.map((o,i)=>{const val=q.type==='mcq'?o[0]:o;return `<label class="option"><input type="radio" name="q${n}" value="${esc(val)}" ${norm(answers[n])===norm(val)?'checked':''} ${review?'disabled':''}>${esc(o)}</label>`;}).join('');
 const feedback=q.unavailable&&review?`<div class="feedback">Not scored · supplied answer key: <strong>${esc(q.answer||'Not provided')}</strong></div>`:review?`<div class="feedback"><strong>${q.type==='multi'?`${t.questions.filter(x=>x.group===q.group&&correct(x)).length} / ${q.multiEnd-q.multiStart+1} correct`:correct(q)?'✓ Correct':norm(answers[n])?'✗ Incorrect':'— Unanswered'}</strong><br>Your answer: ${esc(q.type==='multi'?t.questions.filter(x=>x.group===q.group).map(x=>answers[x.number]).filter(Boolean).join(', ')||'Not answered':answers[n]||'Not answered')} · Correct answer: <strong>${esc(q.type==='multi'||q.unorderedGroup?q.acceptedAnswers.join(', '):q.answer)}</strong>${q.options.length?`<br>${esc(q.options.find(o=>norm(['heading','choice'].includes(q.type)?o.split(' ')[0]:q.type==='mcq'?o[0]:o)===norm(q.answer))||'')}`:''}${q.evidence?`<br>${esc(q.evidence)}`:''}${q.paragraph?`<br><button type="button" class="evidence-button" data-evidence="${q.paragraph}">Show evidence · paragraph ${q.paragraph}</button>`:''}</div>`:'';
 return `${!t.groups&&instructions[n]?`<div class="instruction">${esc(instructions[n])}</div>`:''}${groupIntro}${headingList}<fieldset class="question ${review&&correct(q)?'correct':''}" id="question-${n}"><legend>${q.type==='multi'?`Questions ${q.multiStart}–${q.multiEnd} · Choose ${q.multiEnd-q.multiStart+1} answers`:q.type==='multiSingle'?`${n}. Choose ${q.choiceCount} answers — see the question above.`:`${n}. ${esc(q.text)}`}</legend>${control}${feedback}</fieldset>`;
 }).join('');
 window.readingHighlighter?.restore(page);
 document.querySelector('.submitbar').hidden=!!review;document.querySelector('#retake').hidden=!review;document.querySelector('#fresh-start').hidden=!!review;document.querySelector('#export').hidden=!review;
 }
 function showResult(message=''){if(review)result.innerHTML=`<strong>Score: ${review.score} / ${available.length} (${Math.round(review.score/available.length*100)}%)</strong><br>Attempt ${review.attempt} · ${esc(new Date(review.submittedAt).toLocaleString())}<br><span id="save-status">${esc(message)}</span><br>Review each passage for answers and supporting paragraphs. Marks use the supplied answer key (case and extra spaces are ignored; optional words and slash-separated alternatives in imported keys are accepted). ${t.questions.some(q=>q.unavailable)?`${t.questions.length-available.length} questions excluded because required source content or answer-key entries are missing.`:''}`;else result.textContent='';}
 document.querySelector('#passage-nav').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b){page=Number(b.dataset.page);currentQuestion=t.questions.find(q=>q.passage===page).number;draw();saveDraft();}});
 document.querySelector('#question-nav').addEventListener('click',e=>{
  const button=e.target.closest('[data-question]');if(!button)return;
  const q=t.questions.find(q=>q.number===Number(button.dataset.question));if(!q||q.unavailable)return;
  currentQuestion=q.number;page=q.passage;draw();saveDraft();
  const field=document.getElementById('question-'+(q.type==='multi'?q.multiStart:q.number));
  field?.scrollIntoView({behavior:'smooth',block:'start'});
  field?.querySelector('input:not(:disabled),select:not(:disabled)')?.focus({preventScroll:true});
 });
 form.addEventListener('input',e=>{
 if(!review&&Date.now()>=deadline)tick();
 if(review||!e.target.name)return;
 if(e.target.type==='checkbox'){
  const first=Number(e.target.dataset.start),last=Number(e.target.dataset.end);
  const values=Array.from(form.querySelectorAll(`input[name="${e.target.name}"]:checked`)).map(input=>input.value);
  const single=e.target.dataset.single==='true';const count=single?Number(e.target.dataset.count):last-first+1;
  if(values.length>count){e.target.checked=false;return;}
  if(single)answers[first]=values.join(', ');
  else for(let n=first;n<=last;n++)answers[n]=values[n-first]||'';
 }else answers[e.target.name.slice(1)]=e.target.value;
 currentQuestion=Number(e.target.type==='checkbox'?e.target.dataset.start:e.target.name.slice(1));
 drawQuestionNav();saveDraft();
 document.querySelector('#progress').textContent=`${available.filter(answered).length} / ${available.length} answered`;
 });
 form.addEventListener('click',e=>{const b=e.target.closest('[data-evidence]');if(b)document.getElementById('para-'+b.dataset.evidence)?.scrollIntoView({behavior:'smooth',block:'center'});});
 function submitAttempt(expired=false){
 if(review)return;const blanks=available.filter(q=>!answered(q)).length;if(!expired&&blanks&&!confirm(`${blanks} questions are unanswered. Submit anyway?`))return;
 clearInterval(timerHandle);

 review={testId:t.id,answers:{...answers},score:available.filter(correct).length,scoredQuestions:available.length,totalQuestions:t.questions.length,attempt,submittedAt:new Date().toISOString(),timeExpired:expired,timeUsedSeconds:Math.min(3600,Math.max(0,Math.floor((Date.now()-(deadline-3600000))/1000)))};
 clearDraft();
 const saved=recordAttempt(t.id,review.score,review.timeUsedSeconds);
 updateReturnLinks();
 timer.textContent=expired?'Time left 00:00 · Finished':'Test submitted';
 timer.className='exam-timer'+(expired?' timer-warning':'');
 draw();showResult((expired?'Time is up. Your answers were submitted automatically. ':'')+(saved?'Attempt count and best score saved. ':'Browser storage is unavailable; attempt statistics could not be saved. ')+'Click Save JSON to keep your full result.');result.focus();
 }
 form.addEventListener('submit',e=>{e.preventDefault();submitAttempt(Date.now()>=deadline);});
 document.querySelector('#fresh-start').onclick=()=>{clearDraft();window.readingHighlighter?.clear();review=null;answers={};page=1;currentQuestion=1;attempt=testStats(t.id).attempts+1;mode.textContent='Fresh test started. Answers are saved as one recovery draft.';showResult();draw();startTimer();};
 window.addEventListener?.('pagehide',saveDraft);
 window.addEventListener?.('beforeunload',event=>{
  if(review)return;
  saveDraft();
  event.preventDefault();event.returnValue='';
 });
 document.querySelector('#retake').onclick=()=>{window.readingHighlighter?.clear();attempt=(review?.attempt||attempt)+1;review=null;answers={};page=1;currentQuestion=1;showResult();draw();startTimer();};
 document.querySelector('#export').onclick=()=>{
  if(!review)return;
  const exported={...review,questions:t.questions.map(q=>({
   questionNumber:q.number,passageTitle:t.passages[q.passage-1].title,
   question:q.text,correctAnswer:q.answer,yourAnswer:review.answers[q.number]||'',
   isCorrect:q.unavailable?null:correct(q),unavailable:!!q.unavailable,unavailableReason:q.unavailable?(q.unavailableReason||'Required source content is missing.'):null
  }))};
  const url=URL.createObjectURL(new Blob([JSON.stringify(exported,null,2)],{type:'application/json;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=t.id+'-latest.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 document.querySelector('.submitbar span').textContent='Check all three passages before submitting.';
 document.querySelector('button[type=submit]').textContent='Submit test';
 const params=new URLSearchParams(window.location?.search||'');
 const fresh=params.get('fresh')==='1';
 if(fresh){
  clearDraft();params.delete('fresh');
  const query=params.toString();
  window.history?.replaceState(null,'',(window.location.pathname||'')+(query?'?'+query:'')+(window.location.hash||''));
 }
 const resumed=!fresh&&restoreDraft();draw();showResult();startTimer(resumed);
}
