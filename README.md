# IELTS Reading Library

A personal IELTS Academic Reading practice website with **200 tests**, each containing three reading passages. Most have 40 questions; a few supplied exports have different counts, which are preserved rather than padded or truncated. Built with HTML, CSS and vanilla JavaScript; no server or installation is required.

**[Open the live library](https://sadmananik.github.io/ielts-reading-library/)**

## What you can do

- Browse 10 tests per page using numbered pages and Previous/Next controls above or below the list. Search and filtering apply to the whole library, and changes reset the list to page 1.
- Find tests by passage title, test number or question type. Filter by type and sort by best score or fastest completion.
- Practise multiple choice, matching headings and information, True/False/Not Given, Yes/No/Not Given, and completion questions with local diagrams where needed.
- Navigate all 40 question numbers; answered questions are underlined.
- Take a timed 60-minute test. The timer turns red in the last 10 minutes, gives brief warnings at 10 and 5 minutes, and submits automatically at zero.
- Highlight passage and question text, choose Light/Dark/System appearance, and adjust passage text size.
- Submit to see your score, correct answers and available supporting paragraph links. Download the full result with **Save JSON**.

## Saved progress

Answers, highlights, current passage and the timer deadline are saved as one unfinished recovery draft in your browser. Reloading resumes that draft; time continues while the page is closed. **Start fresh** on the index, **Fresh start** inside a test and **Retake test** begin with blank answers and 60 minutes. Submission clears the unfinished draft.

Submitted attempt counts, best scores, fastest completion times and passage text size are remembered in the same browser. Fastest completion and highest score may come from different attempts. Old attempts without recorded timing show a dash.

Progress does **not** sync across devices or browsers. Clearing browser data removes saved progress. If storage is blocked or full, practice and result downloads still work, and the app explains that recovery could not be saved. The browser controls whether it displays the leave/reload confirmation.

## Open locally

Download the repository and open `index.html`. Keep the folder structure intact. No Python, npm packages or backend is needed. Browser storage for local files varies; use the hosted site for consistent progress tracking.

## Project structure

```text
index.html       Searchable test library
app.js           Test forms, marking, timer, recovery and library controls
data.js          All passages, questions, options, keys and source provenance
highlights.js    Text selection, highlight rendering and draft serialisation
theme.js         Light, dark and system appearance
style.css        Shared styling and responsive layouts
tests/           The 200 test HTML entry pages
assets/          Local diagrams and other required images
.nojekyll        Serve the repository as a plain GitHub Pages site
```

The test pages use `<base href="../">` so shared scripts, images and the library link resolve from the project root. `test-01.html` was an obsolete redirect to Test 50 and has been removed; open Test 50 from the library instead.

## Publishing and updates

GitHub Pages serves this repository from **main → /(root)**. Push changes to `main` to deploy an update. Allow the Pages deployment to finish, then refresh the website.

To add a test, update `data.js` with its complete passages, numbered questions, options and answer mapping; add its entry page in `tests/` using an existing page and a unique `data-test` ID. Store required diagrams in `assets/`. Missing content must remain flagged and excluded from scoring until verified. Keep existing tests intact.

## Content and marking

This is an independent personal practice tool, not an official IELTS product. Test material remains the property of its respective rights holders. Source links are retained with recovered diagrams and in embedded provenance records. Scores use the included answer keys and documented corrections. Paragraph evidence links are review aids, not official explanations; a complete independent audit of every supplied answer has not been performed.

## Tests 101–150

Added from the supplied text exports. Missing diagrams and task images in Tests 104, 112, 118, 123, 132, 133, 146 and 147 were recovered and saved locally in `assets/recovered/`; their source links are shown beside the diagrams. Existing Tests 1–100 are preserved.

Test 127’s shifted key has been repaired against the matching task and answer key in [IELTS Reading Academic Exam Practice](https://aspiresquare.com/wp-content/uploads/2022/01/IELTS-Reading-Academic-Exam-Practice.pdf). Q1–14 are verified, including corrections to Q2–4; Q8 accepts A or B. All 40 questions are available, and original key values are preserved as `sourceAnswer`.

Nonstandard question counts in the exports are shown accurately throughout the library and marking:

| Test | Supplied questions |
| --- | --- |
| 110 | 39 |
| 112 | 39 |
| 121 | 37 |
| 122 | 42 |
| 123 | 41 |
| 124 | 38 |
| 134 | 39 |

Abbreviated keys such as NG are interpreted as NOT GIVEN. Where YES/NO instructions have TRUE/FALSE keys, equivalent YES/NO values are used in the controls, with the original key retained as `sourceAnswer`. Multi-answer groups accept the correct selections in any order.

## Tests 151–200

All 50 tests from this batch have 40 available questions. Twenty-six original task images were recovered and stored locally, including missing diagrams, flowcharts and Test 169’s omitted table. Earlier tests are preserved.

Verified repairs and source-format handling:

- Test 160 Q27–34: restored the omitted paragraph-matching task using paraphrased descriptions from a [matching published task](https://engnovate.com/ielts-reading-answers/source-of-knowledge/).
- Test 170 Q28: changed the invalid key S to A, confirmed by the passage and the [matching answer key](https://www.ieltsvisa.com/academic-reading-passages/organisational-conflict-and-change-reading-answers/).
- Test 180 Q25–26: replaced unrelated options with paraphrased choices from a [matching task](https://www.ieltsvisa.com/academic-reading-passages/clicks-bricks-and-bargains-reading-answers/). Q26 accepts A and C in the restored option order, supported by paragraph F. Original options and key are retained as `sourceOptions` and `sourceAnswer`.
- Test 184 Q36: enter the temperature decrease and distance together, separated by “per”; both parts are required.
- Repeated full answer sets are displayed as multi-answer checkbox groups. Spelling error Ture is normalised to TRUE while retaining the supplied value.

Test 127 has also been repaired. All 200 tests now have their included questions available for scoring.
