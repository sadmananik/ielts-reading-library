# IELTS Reading Room

Open `index.html` directly in your browser. The library contains **100 tests**, each with three passages and 40 question mappings. Incomplete questions are excluded from scoring. The duplicate original coral-reef entry was removed; use Test 50. The old `test-01.html` link redirects there.

No server, Python, installation or internet connection is needed to practise. One unfinished test is stored as a small JSON recovery draft in browser storage, alongside submitted attempt counts and best scores. Full submitted results still require Save JSON; highlights are kept only in memory.

## Recovered content

All **27 previously flagged tests** have their known missing diagrams, tables, task text, options or blank answer entries repaired, restoring **116 questions**. These repairs cover Tests 1–70. The ten later tests with missing task content are also repaired: see [the PDF follow-up](sources/pdf-review-071-100.md). The final blank keys are now verified: Test 76 Q30 = D and Test 86 Q33 = D. All 100 tests now have 40 scored questions; no tests remain red. See [the per-test repair report and sources](repairs/README.md). See [Tests 71–100: PDFs and answer keys needed](sources/import-review-071-100.md). The badge appears automatically for unavailable questions.

Recovered images are stored locally and can be clicked to open at full size. Original supplied text exports remain in `sources/`. The supplied keys remain the basis for marking, with the specific verified corrections listed in the repair report; this is not a complete independent audit of every test.

## Finding tests

Search the index by passage title, test number (for example `50` or `test 50`), or question type such as `MCQ`. Filter by question type using the dropdown; each test also lists its question types. Sort by test number, best score highest/lowest first, or fastest submitted completion. Unattempted tests and tests with no saved timing appear last in performance sorts. The index no longer offers question/answer JSON downloads; Save JSON after submission remains available.

Completion times are recorded for new submissions, including timed-out attempts. Older saved attempts display a dash until a new completion is recorded. Fastest time and highest score may come from different attempts; no accuracy threshold is applied to fastest times.

## Timer and attempt history

Every test starts a 60-minute countdown when opened. The clock stays visible, turns red for the final 10 minutes, and briefly pulses at 10 and 5 minutes (respects reduced-motion settings). At zero it submits automatically without a confirmation. Early submission stops the clock; retaking starts a new 60-minute attempt. Reloading restores the current recovery draft, including answers, passage and the original timer deadline. Time continues while the page is closed, so reloading cannot restart the clock. If the deadline has passed, the restored answers submit automatically. **Start fresh** on the index and **Fresh start** inside the test explicitly discard the old draft and start blank with 60 minutes. The fresh-start URL flag is removed immediately so subsequent reloads restore the new attempt.

An unfinished test requests the browser’s standard confirmation before reload, close or navigation. Browsers control the wording and may suppress the dialog without prior interaction or on mobile. Submitted tests do not request confirmation.

The recovery draft updates on answer edits and question/passage navigation, and is cleared on submission. Retake starts blank. One draft key is used per browser storage scope; opening another test replaces that draft where pages share storage. Browser handling of local file storage varies; recovery works when reloading the same test file. If browser storage is blocked or full, the page shows that recovery could not be saved and remains usable.

The index shows submitted attempt counts and best raw scores out of 40. Opening or abandoning a test does not count as an attempt. Summaries are saved automatically; full results still require Save JSON. Older downloaded results are not imported automatically. Clearing browser data clears summaries. When using local files, return through **All tests** to carry updated summaries back to the index even in browsers that isolate storage per file. If storage is blocked, marking and JSON downloads still work and the result explains that statistics could not be saved.

## Practice and results

- Choose a test from the index, then switch between its three passages while answering.
- The sticky question bar shows all 40 numbers grouped by passage. Answered numbers are underlined; unanswered numbers stay plain. Click any number to switch passages and focus that question. Two-choice questions count as answered when both choices are selected. The outlined number is the current question.
- Select text and click **Highlight**, or use the right-click Highlight action. Remove individual highlights or choose **Clear my highlights**. These clear on retake or refresh.
- Submit to see the score, correct answers and available supporting paragraph links. Evidence links are review aids, not official explanations.
- After submitting, click **Save JSON** to download all 40 question mappings, submitted answers, correct answers, score and submission date. Submission does not automatically save a file. The browser controls download names and does not automatically overwrite prior results.
- **Retake test** clears the current attempt. Save the result first if you want to keep it. Submitted attempts are counted across sessions in the same browser.
- Marking ignores case and extra whitespace, and supports the supplied optional words and alternative answers. Multi-answer tasks accept the correct choices in any order.

## Files and future exams

`tests/source-NNN.json` contains each exam’s passages, questions, options, keys and evidence mappings. `data.js` embeds this data so pages open directly without network requests. Shared behaviour is in `app.js`; test entry pages use `tools/test-template.html`.

Supply each new exam’s three passages, complete tasks and 40-answer key. Keep existing exams and source exports. Incomplete questions must remain unavailable and excluded from scoring until their missing content is verified.

Optional development helpers (not needed to use the HTML):

- Import local supplied exports: `python3 tools/import_supplied_tests.py /path/to/ielts_reading_tests START END`.
- Reapply verified repairs and rebuild `data.js`: `python3 tools/recovery.py`. Imports also apply repair records automatically.
- Check library, diagram rendering, marking, retakes and JSON export: `node tools/check-tests.cjs`. These checks do not replace visual browser QA.

## Appearance

Use the **Appearance** selector in the header to choose **System**, **Light**, or **Dark**. System is the default and follows changes to your device’s color scheme. Manual choices carry between the library and test pages using their link URLs. No cookies or browser storage are used. A fresh opening of `index.html` follows System again. Printing uses a light background.
