# Exam Prep – Practice Sets

A browser-based practice quiz with 5 sets of 125 questions each (625 total), covering Python, data handling/SQL/EDA, regression and ML, and GenAI/RAG. Difficulty rises from Easy (Set 1) to Hard (Set 5).

## Project Structure

```
exam-app/
├── index.html        # Page markup (home, quiz and results screens)
├── css/
│   └── style.css     # All styles
├── js/
│   ├── questions.js  # Question bank (the SETS object)
│   └── app.js        # State, navigation, rendering and quiz logic
└── README.md
```

## How to Run

No build step or server is needed. Open `index.html` in any modern browser.

Keep the folder structure intact, because `index.html` loads `css/style.css`, `js/questions.js` and `js/app.js` by relative path.

## Question Sets

| Set | Difficulty    |
|-----|---------------|
| 1   | Easy          |
| 2   | Easy–Medium   |
| 3   | Medium        |
| 4   | Medium–Hard   |
| 5   | Hard          |

Each set has 4 sections:

- **A** – Python Programming Foundations
- **B** – Data Handling, SQL & EDA
- **C** – Regression, Trees & Clustering
- **D** – GenAI, LLMs & RAG Systems

## Question Types

- **MCQ** – single correct answer; feedback is shown as soon as you pick an option.
- **MSQ** – multiple correct answers; select all that apply, then click *Submit Answer*.
- **NAT** – type a numerical answer, then click *Check*.

## Features

- Instant correct/wrong feedback with the right answer revealed
- *Clear & Remark* button to retry a wrongly answered question
- Live progress bar and score
- Section tabs to jump between A–D
- *Submit All* for a results summary (correct, wrong, skipped, accuracy)
- Best scores per set saved in the browser's `localStorage`

## Editing Questions

Questions live in `js/questions.js` inside the `SETS` object, keyed by set number (1–5). Each question is an object:

```js
// MCQ: c is the index of the correct option
{s:"A", type:"mcq", q:"Question text?", o:["Opt 1","Opt 2","Opt 3","Opt 4"], c:1}

// MSQ: c is an array of correct option indices
{s:"A", type:"msq", q:"Select all that apply", o:["A","B","C","D"], c:[0,2]}

// NAT: c is the answer as a string
{s:"A", type:"nat", q:"What is 2 ** 4?", c:"16"}
```

`s` is the section letter (`A`–`D`). Questions must stay grouped by section, because the section headers are rendered whenever the section changes.

## Notes

- `questions.js` must load before `app.js`, because the app reads `SETS` at startup.
- Scores are stored per browser. Clearing site data resets them.
