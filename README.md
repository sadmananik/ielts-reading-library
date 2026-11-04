# IELTS Reading Library

A personal IELTS Academic Reading practice website with **150 tests**, each containing three reading passages. Most have 40 questions; a few supplied exports have different counts, which are preserved rather than padded or truncated. Built with HTML, CSS and vanilla JavaScript; no server or installation is required.

**[Open the live library](https://sadmananik.github.io/ielts-reading-library/)**

## What you can do

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
tests/           The 150 test HTML entry pages
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

Test 127 is marked red: its supplied key conflicts with the options for Q5–14. These ten questions are excluded from scoring until a corrected key is supplied. Their original key entries are retained for review.

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
