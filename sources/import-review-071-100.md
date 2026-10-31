> Latest update: Test 76 Q30 = D and Test 86 Q33 = D are verified and restored. All 100 tests now have 40 available questions; no missing-content badges remain. Source links are recorded in repairs/source-076.json and repairs/source-086.json. Earlier status notes below are historical.

> Updated: all ten content gaps below have since been repaired. Only Test 76 Q30 and Test 86 Q33 remain unavailable. See [the PDF follow-up](pdf-review-071-100.md). The tables below record the original import state.

# Tests 71–100: import review

30 tests added; the library now contains 100 tests. Original TXT files are copied unchanged to `sources/`. New test pages retain the theme selector, highlighting, question navigation and manual Save JSON behaviour.

## PDFs needed

These exports omit visual or task content. Please provide the full PDF page containing the listed questions; missing questions remain unscored and their tests appear red. An omitted task is not assumed to be a diagram until verified.

| Test | Missing questions | Missing content |
| --- | --- | --- |
| 71 | 7, 8, 9, 10, 14, 15, 16, 17 | Flowchart Q7–10 and diagrams Q14–17 |
| 72 | 24, 25, 26, 27 | Entire task block Q24–27 |
| 75 | 6, 7, 8, 9 | Entire task block Q6–9 |
| 78 | 20, 21, 22, 23, 24, 25, 26 | Entire task block Q20–26 |
| 79 | 9, 10, 11, 12, 13 | Entire task block Q9–13 |
| 83 | 19, 20, 21, 22 | Diagram Q19–22 |
| 85 | 18, 19, 20, 21 | Entire task block Q18–21 |
| 95 | 23, 24, 25, 26 | Entire task block Q23–26 |
| 96 | 39, 40 | Entire task block Q39–40 |
| 98 | 18, 19, 20, 21 | Entire task block Q18–21 |

## Answer-key gaps

- Test 76 Q30: answer key is blank.
- Test 86 Q33: answer key is blank.

These tests also appear red. Please include the answer-key page for these questions.

## Source issues handled

- Test 72 repeats answer 13 as F and C. The first F matches German grape pickers drinking tea and brandy; the task notes explain the duplicate. Q14 is C.
- Obvious TRUE/FALSE/NOT GIVEN spelling errors in Tests 77, 78 and 89 are normalised, with original values retained as `sourceAnswer`.
- Test 99 Q23 and Q24 each require two selected choices; Q25 and Q26 use one choice.
- Missing passages or answer content has not been invented. Existing tests and recovery patches are preserved.

Validation: all 100 tests, 4,000 answer mappings, passage rendering, scoring, retakes, question navigation and manual JSON export passed the local checks. No runtime server or browser storage is required.
