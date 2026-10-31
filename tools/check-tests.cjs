// Dependency-free rendering and grading checks. Does not replace visual browser QA.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function boot(id,storage=new Map(),blocked=false,search=''){
 let replacedUrl; 
 const elements=new Map();let downloaded,clicked=false,checked=[],now=Date.now(),interval;const windowEvents={};
 class Clock extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
 const el=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',events:{},addEventListener(k,v){this.events[k]=v},focus(){},querySelectorAll(){return checked}});return elements.get(s)};
 const context={URLSearchParams,window:{location:{search,pathname:'/source-001.html',hash:''},history:{replaceState(a,b,url){replacedUrl=url}},addEventListener(name,fn){windowEvents[name]=fn}},document:{body:{dataset:{test:id}},querySelector:el,getElementById(){return null},createElement(){return {click(){clicked=true}}}},confirm:()=>true,Blob,Date:Clock,setTimeout:fn=>fn(),setInterval(fn){interval=fn;return 1},clearInterval(){interval=null},URL:{createObjectURL(blob){downloaded=blob;return 'blob:test'},revokeObjectURL(){}},fetch(){throw Error('Network access is not expected')},localStorage:{getItem(key){if(blocked)throw Error('Storage blocked');return storage.get(key)||null},setItem(key,value){if(blocked)throw Error('Storage blocked');storage.set(key,value)},removeItem(key){if(blocked)throw Error('Storage blocked');storage.delete(key)}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
 return {context,el,windowEvents,replacedUrl:()=>replacedUrl,advance(ms){now+=ms;interval?.()},check(values){checked=values.map(value=>({value}))},blob:()=>downloaded,clicked:()=>clicked};
}
(async()=>{
 const library=boot(undefined);const expected=fs.readdirSync(path.join(root,'tests')).filter(name=>name.endsWith('.json')).length;assert.equal((library.el('#tests').innerHTML.match(/class="testcard(?: testcard-missing)?"/g)||[]).length,expected);
 for(const t of library.context.window.READING_TESTS){
  const b=boot(t.id),available=t.questions.filter(q=>!q.unavailable);
  assert.equal(t.questions.length,40);assert.equal(t.passages.length,3);
  for(let page=1;page<=3;page++){
   b.el('#passage-nav').events.click({target:{closest:()=>({dataset:{page:String(page)}})}});
   const html=b.el('#questions').innerHTML;
   for(const g of t.groups.filter(g=>g.passage===page))for(const m of g.media||[]){
    assert(fs.existsSync(path.join(root,m.src)),`${t.id}: missing diagram file`);
    assert(html.includes(`src="${m.src}"`),`${t.id}: diagram not rendered`);
    assert(m.alt&&m.sourceUrl,`${t.id}: missing diagram description/source`);
   }
   for(const q of t.questions.filter(q=>q.passage===page)){
    if(q.type==='multi'&&q.number!==q.multiStart)continue;
    assert(html.includes(`id="question-${q.number}"`),`${t.id} missing Q${q.number}`);
    if(q.unavailable)continue;
    if(q.type==='mcq'){
     assert(q.options.length>=3&&q.options.length<=5,`${t.id} Q${q.number}: MCQ options`);
     assert.equal(new Set(q.options.map(o=>o[0])).size,q.options.length,`${t.id} Q${q.number}: duplicate options`);
     assert(html.includes(`name="q${q.number}"`));
    }
    if(['heading','paragraph','summary','choice'].includes(q.type))assert(html.includes(`id="q${q.number}"`));
    if(q.type==='multiSingle'){
     b.check(q.answer.split(/[,&]/).map(v=>v.trim()).reverse());
     b.el('#exam-form').events.input({target:{name:'multione'+q.number,type:'checkbox',dataset:{start:String(q.number),end:String(q.number),single:'true',count:String(q.choiceCount)},checked:true}});
    }else if(q.type==='multi'){
     const values=[...q.acceptedAnswers].reverse();b.check(values);
     b.el('#exam-form').events.input({target:{name:'multi'+q.multiStart,type:'checkbox',dataset:{start:String(q.multiStart),end:String(q.multiEnd)},checked:true}});
    }else{
     let answer=q.unorderedGroup?q.answer:(q.acceptedAnswers||[q.answer])[0];
     if(q.type==='summary'){
      const accepted=(q.acceptedAnswers||[q.answer]).map(a=>a.toLowerCase().trim());
      answer=q.options.find(o=>accepted.includes(o.toLowerCase().trim()));
      assert(answer,`${t.id} Q${q.number}: no selectable correct option`);
     }
     b.el('#exam-form').events.input({target:{name:'q'+q.number,value:answer}});
    }
   }
  }
  assert.equal(b.el('#progress').textContent,`${available.length} / ${available.length} answered`);
  b.el('#exam-form').events.submit({preventDefault(){}});
  assert(b.el('#result').innerHTML.includes(`Score: ${available.length} / ${available.length}`),t.id+' wrong score');
  assert.equal(b.blob(),undefined,'Submission must not download automatically');
  b.el('#export').onclick();assert(b.clicked());
  const exported=JSON.parse(await b.blob().text());assert.equal(exported.questions.length,40);assert.equal(exported.score,available.length);assert.equal(exported.questions.filter(q=>q.isCorrect===null).length,40-available.length);
  b.el('#retake').onclick();assert.equal(b.el('#progress').textContent,`0 / ${available.length} answered`);
  const fresh=boot(t.id);assert.equal(fresh.el('#progress').textContent,`0 / ${available.length} answered`);
 }
 assert(!library.el('#tests').innerHTML.includes('Question &amp; answer JSON'));
 assert(!library.el('#tests').innerHTML.includes('Question & answer JSON'));
 library.el('#test-search').value='test 50';library.el('#test-search').events.input();
 assert.equal(library.el('#test-count').textContent,'1 of 100 tests');
 assert(library.el('#tests').innerHTML.includes('IELTS Reading Test 50'));
 library.el('#test-search').value='Coral Reefs';library.el('#test-search').events.input();assert(library.el('#tests').innerHTML.includes('The Coral Reefs'));
 library.el('#test-search').value='no-such-passage-xyz';library.el('#test-search').events.input();assert(library.el('#tests').innerHTML.includes('No tests match'));
 library.el('#test-search').value='';library.el('#type-filter').value='Multiple choice (MCQ)';library.el('#type-filter').events.change();
 assert(Number.parseInt(library.el('#test-count').textContent)>0);
 const sortingStorage=new Map([['reading-room-attempts-v1',JSON.stringify({'source-001':{attempts:2,bestScore:30,fastestSeconds:1000},'source-002':{attempts:1,bestScore:20,fastestSeconds:500}})]]);
 const sorting=boot(undefined,sortingStorage);
 sorting.el('#test-sort').value='score-high';sorting.el('#test-sort').events.change();
 assert(sorting.el('#tests').innerHTML.indexOf('IELTS Reading Test 1</h2>')<sorting.el('#tests').innerHTML.indexOf('IELTS Reading Test 2</h2>'));
 sorting.el('#test-sort').value='score-low';sorting.el('#test-sort').events.change();
 assert(sorting.el('#tests').innerHTML.indexOf('IELTS Reading Test 2</h2>')<sorting.el('#tests').innerHTML.indexOf('IELTS Reading Test 1</h2>'));
 sorting.el('#test-sort').value='time';sorting.el('#test-sort').events.change();
 assert(sorting.el('#tests').innerHTML.indexOf('IELTS Reading Test 2</h2>')<sorting.el('#tests').innerHTML.indexOf('IELTS Reading Test 1</h2>'));
 assert(sorting.el('#tests').innerHTML.includes('Fastest: 08:20'));
 const draftStorage=new Map();
 const draft=boot('source-001',draftStorage);
 draft.el('#exam-form').events.input({target:{name:'q1',value:'yes'}});
 draft.advance(60000);
 draft.el('#question-nav').events.click({target:{closest:()=>({dataset:{question:'40'}})}});
 let prevented=false;const unloadEvent={preventDefault(){prevented=true}};
 draft.windowEvents.beforeunload(unloadEvent);assert(prevented);assert.equal(unloadEvent.returnValue,'');
 const stored=JSON.parse(draftStorage.get('reading-room-draft-v1'));
 assert.equal(stored.answers[1],'yes');assert.equal(stored.page,3);
 const resumed=boot('source-001',draftStorage);
 assert(resumed.el('#storage-mode').textContent.includes('restored'));
 assert(resumed.el('#questions').innerHTML.includes('id="question-40"'));
 assert(resumed.el('#question-nav').innerHTML.includes('Question 1, answered'));
 assert.equal(JSON.parse(draftStorage.get('reading-room-draft-v1')).deadline,stored.deadline);
 const freshPage=boot('source-001',draftStorage,false,'?fresh=1');
 assert.equal(freshPage.el('#progress').textContent,'0 / 40 answered');
 assert.equal(freshPage.el('#exam-timer').textContent,'Time left 60:00');
 assert(!freshPage.replacedUrl().includes('fresh='));
 const reloadedFresh=boot('source-001',draftStorage);
 assert.equal(reloadedFresh.el('#progress').textContent,'0 / 40 answered');
 resumed.el('#fresh-start').onclick();
 assert.equal(resumed.el('#progress').textContent,'0 / 40 answered');
 assert.equal(resumed.el('#exam-timer').textContent,'Time left 60:00');
 resumed.el('#exam-form').events.submit({preventDefault(){}});
 assert(!draftStorage.has('reading-room-draft-v1'));
 prevented=false;resumed.windowEvents.beforeunload({preventDefault(){prevented=true}});assert.equal(prevented,false);
 boot('source-002',draftStorage);assert.equal(JSON.parse(draftStorage.get('reading-room-draft-v1')).testId,'source-002');
 const expired=JSON.parse(draftStorage.get('reading-room-draft-v1'));expired.deadline=Date.now()-1000;
 draftStorage.set('reading-room-draft-v1',JSON.stringify(expired));
 assert(boot('source-002',draftStorage).el('#result').innerHTML.includes('submitted automatically'));
 assert(!draftStorage.has('reading-room-draft-v1'));
 draftStorage.set('reading-room-draft-v1','broken JSON');assert.equal(boot('source-001',draftStorage).el('#progress').textContent,'0 / 40 answered');
 const savedStats=new Map();
 const timed=boot('source-001',savedStats);
 assert.equal(timed.el('#exam-timer').textContent,'Time left 60:00');
 timed.el('#exam-form').events.input({target:{name:'q1',value:'yes'}});
 timed.advance(50*60*1000);
 assert.equal(timed.el('#exam-timer').textContent,'Time left 10:00');
 assert(timed.el('#exam-timer').className.includes('timer-warning'));
 timed.advance(5*60*1000);assert.equal(timed.el('#timer-status').textContent,'5 minutes remaining.');
 timed.advance(5*60*1000);
 assert(timed.el('#result').innerHTML.includes('submitted automatically'));
 assert.equal(timed.el('#exam-timer').textContent,'Time left 00:00 · Finished');
 timed.el('#exam-form').events.submit({preventDefault(){}});
 let stats=JSON.parse(savedStats.get('reading-room-attempts-v1'));
 assert.equal(stats['source-001'].attempts,1);assert.equal(stats['source-001'].bestScore,1);assert.equal(stats['source-001'].fastestSeconds,3600);
 assert(boot(undefined,savedStats).el('#tests').innerHTML.includes('Attempts: 1 · Best score: 1 / 40'));
 timed.el('#retake').onclick();assert.equal(timed.el('#exam-timer').textContent,'Time left 60:00');
 timed.el('#exam-form').events.submit({preventDefault(){}});
 stats=JSON.parse(savedStats.get('reading-room-attempts-v1'));assert.equal(stats['source-001'].attempts,2);assert.equal(stats['source-001'].bestScore,1);
 timed.el('#export').onclick();const timeExport=JSON.parse(await timed.blob().text());assert.equal(timeExport.timeExpired,false);
 const blocked=boot('source-001',new Map(),true);blocked.advance(3600000);assert(blocked.el('#result').innerHTML.includes('statistics could not be saved'));
 const nav=boot('source-001');
 assert.equal((nav.el('#question-nav').innerHTML.match(/data-question=/g)||[]).length,40);
 assert(nav.el('#question-nav').innerHTML.includes('Question 1, unanswered'));
 nav.el('#exam-form').events.input({target:{name:'q1',value:'v'}});
 assert(nav.el('#question-nav').innerHTML.includes('Question 1, answered'));
 nav.el('#question-nav').events.click({target:{closest:()=>({dataset:{question:'40'}})}});
 assert(nav.el('#questions').innerHTML.includes('id="question-40"'));
 assert(nav.el('#question-nav').innerHTML.includes('Question 40, unanswered, current question'));
 nav.el('#exam-form').events.input({target:{name:'q40',value:'A'}});
 assert(nav.el('#question-nav').innerHTML.includes('Question 40, answered'));
 nav.el('#question-nav').events.click({target:{closest:()=>({dataset:{question:'1'}})}});
 assert(nav.el('#question-nav').innerHTML.includes('Question 1, answered'));
 nav.el('#exam-form').events.input({target:{name:'q1',value:''}});
 assert(nav.el('#question-nav').innerHTML.includes('Question 1, unanswered'));
 nav.el('#exam-form').events.submit({preventDefault(){}});
 nav.el('#retake').onclick();
 assert(!nav.el('#question-nav').innerHTML.includes('class="question-number answered"'));
 const one=boot('source-025');
 one.check(['D']);one.el('#exam-form').events.input({target:{name:'multione16',type:'checkbox',dataset:{start:'16',end:'16',single:'true',count:'2'},checked:true}});
 one.el('#exam-form').events.submit({preventDefault(){}});assert(one.el('#result').innerHTML.includes('Score: 0 / 40'));
 const list=boot('source-034');
 for(const [i,value] of ['glossaries','language course','translation services','training'].entries())list.el('#exam-form').events.input({target:{name:'q'+(21+i),value}});
 list.el('#exam-form').events.submit({preventDefault(){}});assert(list.el('#result').innerHTML.includes('Score: 4 / 40'));
 const repeated=boot('source-034');
 for(let n=21;n<=24;n++)repeated.el('#exam-form').events.input({target:{name:'q'+n,value:'training'}});
 repeated.el('#exam-form').events.submit({preventDefault(){}});assert(repeated.el('#result').innerHTML.includes('Score: 1 / 40'));
 console.log(`PASS: ${expected} library entries; ${expected*40} answer mappings; all passage views; optional answer variants; unordered multi-select grading; missing visuals excluded; manual JSON downloads; retakes; timed auto-submission; saved attempt counts and best scores; blocked-storage fallback; draft restore, fresh start and expired-draft submission; no network.`);
})().catch(e=>{console.error(e);process.exitCode=1});
