"""Apply verified local repair records; performs no network requests."""
from pathlib import Path
import copy,json
ROOT=Path(__file__).resolve().parents[1]

def apply_recovery(test):
    record=ROOT/'repairs'/(test['id']+'.json')
    if not record.exists():return test
    patch=json.loads(record.read_text())
    assert patch['testId']==test['id']
    test=copy.deepcopy(test)
    questions={q['number']:q for q in test['questions']}
    groups={g['id']:g for g in test.get('groups',[])}
    for change in patch.get('questions',[]):
        q=questions[change['number']]
        if 'answer' in change and change['answer']!=q['answer'] and 'sourceAnswer' not in q:q['sourceAnswer']=q['answer']
        q.update(change)
        if not q.get('unavailable'):q.pop('unavailableReason',None)
    for change in patch.get('groups',[]):
        group=groups[change['id']];group.update(change)
        for media in group.get('media',[]):
            assert media['src'].startswith('assets/recovered/') and '..' not in media['src']
            assert (ROOT/media['src']).is_file(),media['src']
        if not any(q.get('unavailable') for q in questions.values() if q.get('group')==group['id']):group.pop('warning',None)
    for g in groups.values():
        if not any(q.get('unavailable') for q in questions.values() if q.get('group')==g['id']):g.pop('warning',None)
    restored=[q['number'] for q in patch.get('questions',[]) if q.get('unavailable') is False]
    test['recovery']={'restoredQuestions':restored,'sources':patch['sources'],'notes':patch.get('notes',[])}
    assert len(test['questions'])==40 and len(questions)==40
    for n in restored:assert questions[n]['answer'] and questions[n].get('acceptedAnswers')
    return test

def rebuild_bundle():
    tests=[json.loads(p.read_text()) for p in sorted((ROOT/'tests').glob('*.json'))]
    tests.sort(key=lambda t:t['sourceNumber'])
    (ROOT/'data.js').write_text('window.READING_TESTS = '+json.dumps(tests,ensure_ascii=False)+';\n')

if __name__=='__main__':
    restored=0
    for patch in sorted((ROOT/'repairs').glob('source-*.json')):
        path=ROOT/'tests'/patch.name
        test=apply_recovery(json.loads(path.read_text()))
        path.write_text(json.dumps(test,ensure_ascii=False,indent=2))
        restored+=len(test['recovery']['restoredQuestions'])
    rebuild_bundle()
    print(f'Applied {len(list((ROOT/"repairs").glob("source-*.json")))} repair records; {restored} restored questions.')
