"""Importer for the supplied text exports; not a downloader."""
from pathlib import Path
import json,re,itertools,sys
from recovery import apply_recovery
ROOT=Path(__file__).resolve().parents[1]
# Passage title and first question line offsets in the supplied exports.
LAYOUT={1:[(4,19),(64,78),(109,123)],2:[(4,27),(71,87),(124,142)],3:[(4,29),(59,71),(116,130)],4:[(4,27),(92,114),(170,182)],5:[(4,29),(80,96),(132,148)],6:[(4,23),(42,58),(105,119)],7:[(4,22),(52,68),(108,126)],8:[(4,23),(48,68),(106,120)],9:[(4,31),(59,77),(142,152)],10:[(4,27),(85,101),(128,142)]}
LAYOUT.update({11:[(4,28),(79,105),(154,177)],12:[(4,23),(58,74),(109,129)],13:[(4,41),(107,133),(167,183)],14:[(4,25),(71,93),(139,158)],15:[(4,25),(64,84),(131,157)],16:[(4,21),(65,89),(133,157)],17:[(4,31),(74,90),(147,163)],18:[(4,26),(74,98),(150,166)],19:[(4,19),(55,75),(114,132)],20:[(4,31),(87,113),(146,162)]})

LAYOUT.update({21:[(4,27),(79,104),(155,175)],22:[(4,21),(62,82),(120,140)],23:[(4,19),(45,63),(103,121)],24:[(4,25),(77,95),(123,161)],25:[(4,29),(85,116),(175,210)],26:[(4,19),(55,71),(130,146)],27:[(4,23),(42,68),(144,167)],28:[(4,19),(71,93),(150,172)],29:[(4,39),(64,82),(108,126)],30:[(4,21),(61,81),(118,140)],31:[(4,19),(61,78),(111,132)],32:[(4,21),(69,85),(120,134)],33:[(4,29),(61,85),(128,150)],34:[(4,27),(69,83),(137,153)],35:[(4,29),(53,71),(106,120)],36:[(4,30),(62,82),(125,150)],37:[(4,21),(62,77),(112,136)],38:[(4,17),(62,82),(122,146)],39:[(4,29),(65,87),(121,143)],40:[(4,19),(51,71),(108,124)]})
LAYOUT.update({41:[(4,17),(71,87),(123,137)],42:[(4,21),(48,66),(105,119)],43:[(4,19),(64,76),(115,133)],44:[(4,27),(55,71),(97,127)],45:[(4,21),(63,79),(126,150)],46:[(4,19),(63,81),(109,127)],47:[(4,27),(62,86),(133,153)],48:[(4,25),(57,73),(117,133)],49:[(4,21),(64,82),(109,125)],50:[(4,25),(85,99),(132,152)],51:[(4,17),(77,97),(142,160)],52:[(4,17),(58,74),(108,128)],53:[(4,21),(85,103),(132,156)],54:[(4,25),(68,86),(120,132)],55:[(4,28),(89,103),(131,151)],56:[(4,23),(60,78),(123,137)],57:[(4,25),(101,119),(152,180)],58:[(4,27),(63,85),(134,150)],59:[(4,19),(85,105),(169,185)],60:[(4,21),(54,72),(114,136)],61:[(4,27),(57,75),(89,105)],62:[(4,31),(84,98),(149,175)],63:[(4,18),(45,57),(86,100)],64:[(4,25),(56,68),(85,101)],65:[(4,24),(67,89),(123,143)],66:[(4,21),(57,81),(122,138)],67:[(4,17),(61,85),(153,171)],68:[(4,23),(50,68),(143,170)],69:[(4,27),(83,101),(153,175)],70:[(4,25),(61,81),(134,156)]})

LAYOUT.update({71:[(4,19),(58,76),(106,126)],72:[(4,21),(83,101),(133,149)],73:[(4,23),(51,71),(105,121)],74:[(4,21),(66,80),(129,147)],75:[(4,21),(65,79),(125,137)],76:[(4,25),(66,84),(118,136)],77:[(4,31),(75,95),(156,170)],78:[(4,21),(52,68),(84,102)],79:[(4,19),(54,70),(115,135)],80:[(4,17),(54,72),(111,137)],81:[(4,27),(62,80),(106,126)],82:[(4,27),(54,68),(112,132)],83:[(4,21),(63,75),(107,123)],84:[(4,21),(73,85),(125,139)],85:[(4,21),(57,79),(101,119)],86:[(4,19),(61,77),(120,134)],87:[(4,21),(49,71),(105,121)],88:[(4,29),(58,72),(111,129)],89:[(4,23),(54,76),(102,116)],90:[(4,25),(76,92),(132,148)],91:[(4,21),(56,74),(98,112)],92:[(4,21),(49,69),(128,144)],93:[(4,23),(74,98),(138,158)],94:[(4,21),(75,93),(135,153)],95:[(4,21),(73,95),(140,162)],96:[(4,25),(57,89),(126,161)],97:[(4,21),(57,73),(112,132)],98:[(4,21),(65,103),(142,164)],99:[(4,25),(57,75),(119,139)],100:[(4,19),(73,91),(129,149)]})

DESCRIPTIVE_TITLES={(21,1):'The Power of Cinema',(22,3):'Preventing Bullying in Schools',(25,1):'Urban Traffic and Air Pollution',(27,2):'Farming and Environmental Policy',(28,2):'Pictures and Learning to Read',(34,2):'Language Barriers'}
BANKS={(25,1):['Singapore','Tokyo','London','New York','Mexico City','Cambridge','Los Angeles'],(28,10):['Environmental research','Social awareness','Consumers','Honesty and openness','Social record','Political beliefs','Ethical spenders','Armchair ethical','Financial constraints','Politicians','Environmentalists'],(32,13):['Smoke','Barrels','Set-off','Pollinate','Combs','Full','Chemicals','Protection','Light','Machines','Screen','Empty','Pay','Charge','Split','Supers','Prepare','Queens'],(33,10):['Construction workers','Sea walls','Rocky and sand','Motorway','Geotextile','Coastline','Typhoons','Rock voids','Rainfall','Lantau Island','Dump-trucks'],(40,14):['parents','scared','time of day','teachers','less TV','number of hours','six months','eighteen days','avoided TV','violently','classmates','favorite programmes','watched TV','nonviolent programmes']}

MISSING={1:set(range(23,27)),4:set(range(37,41)),6:set(range(1,9)),7:set(range(9,14)),9:{20,21}}
MULTI={1:{18:22},2:{11:12},5:{14:18},12:{33:35},14:{20:21,22:23},15:{1:3},16:{9:10}}
MISSING.update({12:set(range(24,27)),16:set(range(4,9))|set(range(21,24))})

MISSING.update({21:set(range(38,41)),25:set(range(37,41)),27:set(range(6,14)),30:set(range(7,12)),31:set(range(6,9)),32:set(range(20,24))|{40},33:set(range(6,10))})
MULTI.update({22:{25:26},26:{35:37},30:{35:38},40:{1:5}})
ABSENT_TASKS={27:[(9,13,1)],32:[(20,23,2)]}
DESCRIPTIVE_TITLES.update({(50,3):'Spices in Food Preparation',(51,3):'Northern Ireland’s Coastal Landscape',(52,2):'Nicotine and the Brain',(55,1):'Children’s Ideas About Rainforests',(57,2):'Teacher Shortages',(58,1):'Ancient Egypt and the Pyramids',(67,2):'Left- and Right-Handedness',(68,2):'Research Tests and Questionnaires'})
MISSING.update({47:set(range(27,31)),53:{8},54:{5},49:set(range(34,37)),51:set(range(28,33)),55:set(range(30,33)),58:set(range(4,8)),59:set(range(11,15)),61:set(range(16,22)),63:set(range(6,13)),64:set(range(22,28)),68:set(range(7,11))})
MULTI.update({42:{38:40},43:{1:4,24:27},45:{1:3,4:6},49:{12:14},59:{34:35},62:{26:28},65:{14:16},66:{37:39},67:{9:10}})
ABSENT_TASKS.update({58:[(4,7,1)],63:[(6,12,1)],64:[(22,27,2)],68:[(7,10,1)]})
UNLETTERED_BANKS={(42,8),(48,9),(49,22),(50,14),(51,19),(55,33),(60,8),(61,1),(62,1),(63,15)}
BANK_ALIASES={(42,9):['allegens'],(42,13):['identify'],(48,12):['behavior'],(60,10):['governmental willingness']}
TYPE_OVERRIDES={(59,34):'multi'}

MISSING.update({71:set(range(7,11))|set(range(14,18)),83:set(range(19,23))})
ABSENT_TASKS.update({72:[(24,27,2)],75:[(6,9,1)],78:[(20,26,2)],79:[(9,13,1)],85:[(18,21,2)],95:[(23,26,2)],96:[(39,40,3)],98:[(18,21,2)]})
MULTI.update({71:{24:26},73:{22:26},74:{24:26},79:{25:26},82:{37:38,39:40},84:{33:34,35:36},86:{25:26},87:{37:38,39:40},90:{10:11,12:13},93:{11:13},99:{18:22}})
UNLETTERED_BANKS.update({(74,10),(76,14)})
DESCRIPTIVE_TITLES.update({(73,3):'Work–Family Conflict and Job Satisfaction'})

ADS=['Book Tutors','Get Survival Kits','Book Site Tours','Enter Contests','Book Flights','Discover more','Prep for Tests','Book a Safari','Find Therapists','Study Marine Life','Find Study Aids','Learn Sociology','Stream Albums','Find Media Degrees']
def clean(text):
    for ad in ADS:text=text.replace(ad,'')
    return text

def variants(answer):
    # Parentheses denote optional words; slashes denote alternatives in the supplied key.
    values=[]
    for branch in re.split(r'(?<!\d)/|/(?!\d)',answer):
        parts=re.split(r'(\([^)]*\))',branch.strip())
        choices=[[p[1:-1],''] if p.startswith('(') else [p] for p in parts]
        values.extend(' '.join(''.join(v).split()) for v in itertools.product(*choices))
    return list(dict.fromkeys(v for v in values if v))

def options(text):
    result=[]
    for line in text.splitlines():
        line=re.sub(r"^([ВС])(?=\s)",lambda m:{"В":"B","С":"C"}[m[1]],line)
        # Also handles multiple labelled options on one tab/spaces-separated line.
        for m in re.finditer(r'(?:^|\t| {2,})([A-Z]{1,3})\s+(.+?)(?=\t[A-Z]{1,3}\s| {2,}[A-Z]{1,3}\s|$)',line):
            if m[1]!='NB' and not m[2].startswith(('Hearing','preliminary')):result.append(m[1]+' '+m[2].strip())
    return result if len({o[0] for o in result})>=2 else []

def convert(number,source):
    lines=source.splitlines();answer_start=lines.index('Hide Answers')
    answer_entries=re.findall(r'^(\d+)\.[ \t]*(.*)$','\n'.join(lines[answer_start:]),re.M)
    answers={}
    for n,a in answer_entries:answers.setdefault(int(n),a.strip())
    # Preserve the first entry when the supplied key accidentally repeats a question number.
    assert set(answers)==set(range(1,41)),(number,'Incomplete answer key')
    passages=[];questions=[];groups=[]
    for pi,(title_line,question_line) in enumerate(LAYOUT[number],1):
        title=clean(lines[title_line]).strip();note=None
        if (number,pi) in DESCRIPTIVE_TITLES:title=DESCRIPTIVE_TITLES[number,pi];note='Descriptive title; original title not supplied in the export.'
        if number==2 and pi==1:title='Hearing Impairment in Classrooms';note='Descriptive title; export labels this Reading Passage One.'
        if number==9 and pi==3:title='Protecting Europe’s Forests';note='Descriptive title; export labels this Reading Passage 3.'
        if number==11 and pi==3:title='Why Do We Kiss?';note='Descriptive title; export labels this Reading Passage 3.'
        if number==15 and pi==1:title='Johnson’s Dictionary';note='Descriptive title; export labels this Reading Passage 1.'
        body=clean('\n'.join(lines[title_line+1:question_line]).strip())
        body=re.sub(r'^Section ([A-Z])\s*\n+',r'\1 ',body,flags=re.M)
        if number>=71:body=re.sub(r'^([A-Z])\.\s+',r'\1 ',body,flags=re.M)
        chunks=re.split(r'\n\s*\n',body);paras=[]
        labelled=len({m[1] for c in chunks if (m:=re.match(r'^([A-Z])\s+',c.strip()))})>=3
        if number==25 and pi==1:labelled=False  # Preserve Part One/Two and their embedded labels without inventing a shared section sequence.
        for chunk in chunks:
            chunk=' '.join(chunk.split());match=re.match(r'^([A-Z])\s+(.*)',chunk) if labelled else None
            if number==20 and pi==1 and not paras:match=None  # 'A new study' is the unlabelled introduction.
            if labelled and not match and paras:
                paras[-1]['text']+=' '+chunk
                continue
            paras.append({'label':match[1] if match else ('Introduction' if number==20 and pi==1 and not paras else str(len(paras)+1)),'text':match[2] if match else chunk})
        if number==21 and pi==2:
            sections=re.split(r'^KEY POINT (ONE|TWO|THREE|FOUR|FIVE|SIX)\s*\n',body,flags=re.M)
            paras=[{'label':'The Challenge','text':' '.join(sections[0].replace('THE CHALLENGE','').split())}]
            paras.extend({'label':'Key Point '+sections[k].title(),'text':' '.join(sections[k+1].split())} for k in range(1,len(sections),2))
        if number==31 and pi==3:
            sections=re.split(r'^Part ([A-C])\s*\n',body,flags=re.M);paras=[]
            for k in range(1,len(sections),2):
                if sections[k]=='B':
                    for m in re.finditer(r'^([A-D]) (.*?)(?=\n[A-D] |\Z)',sections[k+1],re.M|re.S):paras.append({'label':'B-'+m[1],'text':' '.join(m[2].split())})
                else:paras.append({'label':'Part '+sections[k],'text':' '.join(sections[k+1].split())})
        passage={'title':title,'paragraphs':paras}
        if note:passage['titleNote']=note
        passages.append(passage)
        end=LAYOUT[number][pi][0] if pi<3 else answer_start
        segment=clean('\n'.join(lines[question_line:end]))
        segment=re.sub(r'^Cambridge IELTS Test.*$','',segment,flags=re.M).strip()
        if number>=71:
            segment=re.sub(r'^([A-Z]{1,3})\.\s+',r'\1 ',segment,flags=re.M)
            if number==87:segment=segment.replace('Questions 37-40\nFor Questions 37-40, choose TWO answers, A-E.\nWrite your answers in boxes 37-40 on your answer sheet.','')
        headers=list(re.finditer(r'^Questions?\s+(\d+)(?:\s*(?:[-–—]|and)\s*(\d+))?\s*$',segment,re.M))
        for gi,h in enumerate(headers):
            first=int(h[1]);last=int(h[2] or first)
            if number==59 and first==29:last=33
            text=segment[h.end():headers[gi+1].start() if gi+1<len(headers) else len(segment)].strip()
            text=text.replace('G opium H mandrake','G opium\nH mandrake')
            opts=options(text)
            heads=[m[1]+' '+m[2] for m in re.finditer(r'^([ivx]+)\.?\s+(.+)$',text,re.M)]
            if heads:typ='heading';opts=heads
            elif re.search(r'^YES\s',text,re.M):typ='tfng';opts=['YES','NO','NOT GIVEN']
            elif re.search(r'^TRUE\s',text,re.M):typ='tfng';opts=['TRUE','FALSE','NOT GIVEN']
            elif first in MULTI.get(number,{}):typ='multi'
            elif re.search(r'Which (?:paragraph|section)s? (?:contains?|state|concentrate)',text,re.I) or (number>=71 and re.search(r'Which (?:paragraph|section)',text,re.I)):typ='paragraph';opts=[p['label'] for p in paras if re.fullmatch('[A-Z]',p['label'])]
            elif opts:
                numbered=re.findall(r'^(\d+)[.)]?\s+',text,re.M)
                repeated=len(opts)>len(set(o.split(' ')[0] for o in opts))
                typ='mcq' if re.search(r'choose (?:the )?(?:correct|appropriate) letters?',text,re.I) or (repeated and len(numbered)>=last-first+1) or re.search(r'choose (?:the )?(?:most suitable title|best answers?)',text,re.I) else 'choice'
            else:typ='gap'
            if first==last and re.search(r'choose TWO',text,re.I) and ',' in answers[first]:typ='multiSingle'
            if (number,first) in BANKS:typ='summary';opts=BANKS[number,first]
            if first in MULTI.get(number,{}):
                typ='multi'
                if heads:opts=heads
                elif not opts:opts=[p['label'] for p in paras if re.fullmatch('[A-Z]',p['label'])]
            if re.search(r'choose (?:the )?two',text,re.I) and all(re.search(r'[,&]',answers[n]) for n in range(first,last+1)):typ='multiSingle'
            if (number,first) in UNLETTERED_BANKS:
                typ='summary';opts=[]
                for line in text.splitlines():
                    if ('\t' in line or re.search(r' {3,}',line)) and len(line)<250:
                        opts.extend(part.strip() for part in re.split(r'\t+| {2,}',line.strip()) if part.strip())
            if number>=71 and typ=='gap' and all(re.fullmatch('[A-Z]',answers[n]) for n in range(first,last+1)) and any(re.fullmatch('[A-Z]',p['label']) for p in paras):
                typ='paragraph';opts=[p['label'] for p in paras if re.fullmatch('[A-Z]',p['label'])]
            if number==99 and first==23:typ='mcq'
            if number==99 and first==27:typ='mcq'
            word_options=typ=='choice' and any(answers[n] and not re.fullmatch(r'[A-Z]{1,3}',answers[n]) for n in range(first,last+1))
            word_note=None
            if word_options:
                typ='summary';opts=[o.split(' ',1)[1] for o in opts]
                repairs={18:{'contacts':'contracts'},19:{'tarrifs':'tariffs'}}.get(number,{})
                if any(o in repairs for o in opts):
                    word_note='The source word bank contains a spelling mismatch with its answer key. Dropdown spelling follows the supplied key: '+', '.join(a+' → '+b for a,b in repairs.items())+'.'
                opts=[repairs.get(o,o) for o in opts]
            gid=f'p{pi}-q{first}';group={'id':gid,'first':first,'last':last,'passage':pi,'text':text,'type':typ}
            if word_note:group['note']=word_note
            if number==72 and first==11:group['note']='The supplied answer key repeats Q13 as F and C. F is used for Q13 (German grape pickers drink tea and brandy), matching the passage; Q14 remains C. The original export is preserved.'
            if number==32 and first==38:group['note']='The supplied option list stops at E, but the key for Q40 is F. Q40 is unavailable and excluded from scoring.'
            if number==28 and first==10:group['note']='The supplied key spells “openness” as “openess”. Both spellings are accepted; source text is preserved.'
            if number==40 and first==14:group['note']='The bank writes “six months” and the supplied key writes “6 months”; both forms are accepted.'
            missing=(set(range(first,last+1)) & MISSING.get(number,set())) | {n for n in range(first,last+1) if not answers[n]}
            if missing:group['warning']='The supplied export is missing required question text, an option, a visual or an answer-key entry. Affected questions are marked unavailable and excluded from the score.'
            groups.append(group)
            starts=list(re.finditer(r'^(\d+)[.)]?(?:\s+|(?=[.…]))(.+)$',text,re.M))
            for n in range(first,last+1):
                prompt=next((m[2] for m in starts if int(m[1])==n),None)
                if number==4 and first==1:prompt='Section '+chr(65+n)
                if not prompt:
                    line=next((l for l in text.splitlines() if re.search(r'\('+str(n)+r'\)',l)),None)
                    prompt=f'Complete gap {n} in the text above.' if line else (f'Answer {n} — refer to the task above.')
                    if first==last:
                        candidates=[l for l in text.splitlines() if l.strip() and not re.match(r'^(Choose|Write|Question|[A-Z] )',l)]
                        if candidates:prompt=candidates[-1]
                qopts=opts
                if typ in ['mcq','multiSingle']:
                    found=next((m for m in starts if int(m[1])==n),None)
                    if found:
                        following=next((m.start() for m in starts if m.start()>found.start()),len(text))
                        qopts=options(text[found.end():following])
                if number==99 and n in [23,24]:typ='multiSingle'
                elif number==99 and first==23:typ='mcq'
                q={'number':n,'passage':pi,'text':prompt,'type':typ,'options':qopts,'answer':answers[n],'acceptedAnswers':variants(answers[n]),'group':gid,'paragraph':None,'unavailable':n in missing}
                if n in missing:q['unavailableReason']='Answer key is blank in the supplied export.' if not answers[n] else 'Required task text, option or visual is missing from the supplied export.'
                if typ=='heading' and answers[n].isdigit():
                    romans=['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii']
                    q['sourceAnswer']=answers[n];q['answer']=romans[int(answers[n])-1];q['acceptedAnswers']=[q['answer'],answers[n]]
                    group['note']='The supplied key uses Arabic numbers for some headings. These are shown as the equivalent Roman numerals in the answer controls.'
                if (number,n) in BANK_ALIASES:
                    q['acceptedAnswers'].extend(BANK_ALIASES[number,n])
                    group['note']='The supplied answer key and word bank have spelling or wording differences. Both supplied forms are accepted; the original key is preserved.'
                if number==70 and n==8:
                    q['acceptedAnswers'].append('protein');group['note']='The supplied key spells protein as “protien”. Both forms are accepted; the original key is preserved.'
                if number>=71 and typ=='tfng' and q['answer'].lower() in ['not gievn','tue']:
                    q['sourceAnswer']=q['answer'];q['answer']={'not gievn':'not given','tue':'true'}[q['answer'].lower()];q['acceptedAnswers']=[q['answer'],q['sourceAnswer']];group['note']='An obvious spelling error in the supplied true/false/not-given key is normalised; the original value is preserved.'
                if typ=='tfng' and q['answer'].lower() in ['flse','fasle']:
                    q['sourceAnswer']=q['answer'];q['answer']='false';q['acceptedAnswers']=['false',q['sourceAnswer']];group['note']='The supplied key misspells FALSE; this is treated as FALSE and its original spelling is preserved.'
                if number==28 and n==10:q['acceptedAnswers'].append('honesty and openness')
                if number==40 and n==16:q['acceptedAnswers'].append('six months')
                if number==34 and first==21:
                    q['unorderedGroup']=gid;q['acceptedAnswers']=list(dict.fromkeys(v for x in range(first,last+1) for v in variants(answers[x])))
                    group['note']='List the four methods in any order. Repeating the same answer earns only one mark.'
                if typ=='multiSingle':q['choiceCount']=2
                if typ=='multi':q.update(multiStart=first,multiEnd=last,acceptedAnswers=[answers[x] for x in range(first,last+1)])
                if typ=='heading':
                    m=re.search(r'(?:Paragraph|Passage|Section)\s+([A-Z])',prompt)
                    if m:q['paragraph']=('B-'+m[1]) if number==31 and pi==3 else m[1]
                    key_point=re.search(r'Key Point (\w+)',prompt)
                    if key_point:q['paragraph']='Key Point '+key_point[1]
                elif typ=='paragraph':q['paragraph']=answers[n]
                elif typ=='gap' and not q['unavailable'] and not q.get('unorderedGroup'):
                    matches=[p['label'] for p in paras if any(len(v)>3 and v.lower() in p['text'].lower() for v in q['acceptedAnswers'])]
                    if len(matches)==1:q['paragraph']=matches[0];q['evidence']='Answer phrase located in this paragraph; review the full context.'
                questions.append(q)
    for first,last,pi in ABSENT_TASKS.get(number,[]):
        gid=f'p{pi}-q{first}'
        groups.append({'id':gid,'first':first,'last':last,'passage':pi,'type':'gap','text':'The supplied export has no question text for this range.','warning':'Question text or required visual is missing. These questions are excluded from scoring.'})
        questions.extend({'number':n,'passage':pi,'text':'Question text missing from the supplied export.','type':'gap','options':[],'answer':answers[n],'acceptedAnswers':variants(answers[n]),'group':gid,'paragraph':None,'unavailable':True} for n in range(first,last+1))
    questions.sort(key=lambda q:q['number']);groups.sort(key=lambda g:g['first'])
    assert [q['number'] for q in questions]==list(range(1,41)),number
    for q in questions:
        assert q['unavailable'] or q['type']=='gap' or q['options'],(number,q['number'],'Missing options')
        if not q['unavailable'] and q['type'] not in ['gap','multi','multiSingle']:
            keys=[o.split(' ')[0] if q['type'] in ['heading','choice','mcq'] else o for o in q['options']]
            assert any(a.lower() in [k.lower() for k in keys] for a in q['acceptedAnswers']),(number,q['number'],q['answer'],keys)
    result={'id':f'source-{number:03}','title':f'IELTS Reading Test {number}','source':f'User-supplied Test_{number:03}.txt','sourceNumber':number,'passages':passages,'questions':questions,'groups':groups,'notes':['Imported from user-supplied text. Answer-key wording and source errors are preserved. Missing visual questions are excluded from scoring.']}
    return apply_recovery(result)

if __name__=='__main__':
    folder=Path(sys.argv[1])
    imported=[]
    template=(ROOT/'tools/test-template.html').read_text()
    start=int(sys.argv[2]) if len(sys.argv)>2 else 1
    end=int(sys.argv[3]) if len(sys.argv)>3 else 70
    for n in range(start,end+1):
        source=(folder/f'Test_{n:03}.txt').read_text();t=convert(n,source);imported.append(t)
        (ROOT/'sources'/f'Test_{n:03}.txt').write_text(source)
        (ROOT/'tests'/f'{t["id"]}.json').write_text(json.dumps(t,ensure_ascii=False,indent=2))
        (ROOT/f'{t["id"]}.html').write_text(template.replace('__TEST_ID__',t['id']).replace('__TEST_TITLE__',t['title']))
        print(n,[p['title'] for p in t['passages']],len(t['questions']),'unavailable',sum(q['unavailable'] for q in t['questions']))
    all_tests=[json.loads(path.read_text()) for path in sorted((ROOT/'tests').glob('*.json'))]
    all_tests.sort(key=lambda t:(t.get('sourceNumber',0),t['id']))
    (ROOT/'data.js').write_text('window.READING_TESTS = '+json.dumps(all_tests,ensure_ascii=False)+';\n')
