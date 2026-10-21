
// ══════════════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════════════
let currentSet = null;
let answers = {}; // qIndex -> { value, submitted }
let scores = {}; // setNum -> {correct,wrong,skip}

function loadScores(){
  try{ const s = JSON.parse(localStorage.getItem('examScores')||'{}'); scores = s; }catch(e){}
  updateHomeScores();
}
function saveScores(){ localStorage.setItem('examScores', JSON.stringify(scores)); }
function updateHomeScores(){
  for(let i=1;i<=5;i++){
    const el = document.getElementById('score-display-'+i);
    if(scores[i]){ el.innerHTML = `✅ ${scores[i].correct} / 125`; el.style.color='#43e97b'; }
    else { el.innerHTML = 'Not attempted'; el.style.color=''; }
  }
}

// ══════════════════════════════════════════════════════════════════
//  NAV
// ══════════════════════════════════════════════════════════════════
function goHome(){
  document.getElementById('home').style.display='flex';
  document.getElementById('quiz').style.display='none';
  document.getElementById('results').style.display='none';
  updateHomeScores();
}

function startSet(num){
  currentSet = num;
  answers = {};
  document.getElementById('home').style.display='none';
  document.getElementById('results').style.display='none';
  document.getElementById('quiz').style.display='block';
  document.getElementById('quizTitle').textContent = `Set ${num} · ${['','Easy','Easy–Medium','Medium','Medium–Hard','Hard'][num]}`;
  renderQuestions();
  updateProgress();
  window.scrollTo(0,0);
}

function retrySet(){ startSet(currentSet); }

function jumpSection(idx){
  const anchors = document.querySelectorAll('.section-header');
  if(anchors[idx]) anchors[idx].scrollIntoView({behavior:'smooth'});
  document.querySelectorAll('.sec-tab').forEach((t,i)=>t.classList.toggle('active',i===idx));
}

// ══════════════════════════════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════════════════════════════
const SECTIONS = {
  A:{label:'Section A · Python Programming Foundations',desc:'MCQ ×20  ·  MSQ ×9  ·  NAT ×2  =  31 questions'},
  B:{label:'Section B · Data Handling, SQL & EDA',desc:'MCQ ×20  ·  MSQ ×9  ·  NAT ×2  =  31 questions'},
  C:{label:'Section C · Regression, Trees & Clustering',desc:'MCQ ×20  ·  MSQ ×9  ·  NAT ×2  =  31 questions'},
  D:{label:'Section D · GenAI, LLMs & RAG Systems',desc:'MCQ ×20  ·  MSQ ×10  ·  NAT ×2  =  32 questions'}
};

function renderQuestions(){
  const qs = SETS[currentSet];
  const area = document.getElementById('questionsArea');
  let html = '';
  let lastSection = null;
  qs.forEach((q,i)=>{
    if(q.s !== lastSection){
      lastSection = q.s;
      const sec = SECTIONS[q.s];
      html += `<div class="section-header" id="sec${q.s}">
        <h2>📚 ${sec.label}</h2>
        <p>${sec.desc}</p>
      </div>`;
    }
    html += renderCard(q, i);
  });
  area.innerHTML = html;
}

function renderCard(q, i){
  const typeTag = {mcq:'MCQ',msq:'MSQ',nat:'NAT'}[q.type];
  const tagClass = {mcq:'tag-mcq',msq:'tag-msq',nat:'tag-nat'}[q.type];
  const hint = q.type==='msq'?'Select all correct options':q.type==='nat'?'Type a numerical answer':'Select one option';

  let optionsHtml = '';
  if(q.type==='mcq'){
    optionsHtml = q.o.map((opt,oi)=>`
      <div class="opt" id="opt-${i}-${oi}" onclick="selectMCQ(${i},${oi})">
        <div class="opt-circle">${String.fromCharCode(65+oi)}</div>
        <div class="opt-label">${opt}</div>
      </div>`).join('');
  } else if(q.type==='msq'){
    optionsHtml = q.o.map((opt,oi)=>`
      <div class="opt" id="opt-${i}-${oi}" onclick="selectMSQ(${i},${oi})">
        <div class="opt-circle opt-sq">${String.fromCharCode(65+oi)}</div>
        <div class="opt-label">${opt}</div>
      </div>`).join('');
  } else {
    optionsHtml = `<div class="nat-wrap">
      <input class="nat-input" type="text" id="nat-${i}" placeholder="Type answer..." oninput="saveNAT(${i})"/>
      <button class="submit-btn" onclick="checkNAT(${i})">Check</button>
    </div>`;
  }

  return `<div class="q-card unanswered" id="card-${i}">
    <div class="q-top">
      <span class="q-num">Q${i+1}</span>
      <span class="q-type-tag ${tagClass}">${typeTag}</span>
      <div class="q-text">${q.q}</div>
    </div>
    <div class="q-hint">${hint}</div>
    <div class="options">${optionsHtml}</div>
    <div class="q-actions">
      <button class="clear-btn" id="clear-${i}" onclick="clearAnswer(${i})">🔄 Clear & Remark</button>
    </div>
    <div class="q-result" id="result-${i}"></div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════════
//  INTERACTION
// ══════════════════════════════════════════════════════════════════
function selectMCQ(qi, oi){
  if(answers[qi]?.submitted) return;
  const q = SETS[currentSet][qi];
  // clear previous selection visually
  q.o.forEach((_,i)=>{
    const el = document.getElementById(`opt-${qi}-${i}`);
    if(el){ el.classList.remove('selected','opt-correct','opt-wrong','opt-reveal'); }
  });
  answers[qi] = {value: oi, submitted: false};
  document.getElementById(`opt-${qi}-${oi}`).classList.add('selected');
  // Auto-check on selection
  checkMCQ(qi);
  updateProgress();
}

function checkMCQ(qi){
  const q = SETS[currentSet][qi];
  const ans = answers[qi];
  if(ans === undefined || ans.submitted) return;
  const correct = q.c;
  const chosen = ans.value;
  ans.submitted = true;

  q.o.forEach((_,i)=>{
    const el = document.getElementById(`opt-${qi}-${i}`);
    if(!el) return;
    el.classList.remove('selected');
    if(i === correct){ el.classList.add(chosen===correct?'opt-correct':'opt-reveal'); }
    if(i === chosen && chosen !== correct){ el.classList.add('opt-wrong'); }
  });

  const card = document.getElementById(`card-${qi}`);
  const res = document.getElementById(`result-${qi}`);
  const clr = document.getElementById(`clear-${qi}`);

  if(chosen === correct){
    card.className='q-card correct';
    res.className='q-result res-correct'; res.style.display='block';
    res.innerHTML = '✅ Correct!';
    ans.isCorrect = true;
  } else {
    card.className='q-card wrong';
    res.className='q-result res-wrong'; res.style.display='block';
    res.innerHTML = `❌ Incorrect. Correct answer: <strong>${String.fromCharCode(65+correct)}. ${q.o[correct]}</strong>`;
    ans.isCorrect = false;
    clr.style.display='inline-block';
  }
  updateProgress();
}

function selectMSQ(qi, oi){
  if(answers[qi]?.submitted) return;
  if(!answers[qi]) answers[qi]={value:[],submitted:false};
  const arr = answers[qi].value;
  const idx = arr.indexOf(oi);
  if(idx>=0) arr.splice(idx,1); else arr.push(oi);
  const el = document.getElementById(`opt-${qi}-${oi}`);
  el.classList.toggle('selected', arr.includes(oi));

  // Show check button on first selection
  if(arr.length > 0 && !document.getElementById(`msq-check-${qi}`)){
    const actions = document.getElementById(`card-${qi}`).querySelector('.q-actions');
    const btn = document.createElement('button');
    btn.className='submit-btn'; btn.id=`msq-check-${qi}`;
    btn.textContent='Submit Answer';
    btn.onclick=()=>checkMSQ(qi);
    actions.prepend(btn);
  }
}

function checkMSQ(qi){
  const q = SETS[currentSet][qi];
  const ans = answers[qi];
  if(!ans || ans.submitted) return;
  ans.submitted = true;

  const chosen = [...(ans.value||[])].sort();
  const correct = [...q.c].sort();
  const isCorrect = JSON.stringify(chosen)===JSON.stringify(correct);
  ans.isCorrect = isCorrect;

  q.o.forEach((_,i)=>{
    const el = document.getElementById(`opt-${qi}-${i}`);
    if(!el) return;
    el.classList.remove('selected');
    const inCorrect = q.c.includes(i);
    const inChosen = chosen.includes(i);
    if(inCorrect && inChosen) el.classList.add('opt-correct');
    else if(!inCorrect && inChosen) el.classList.add('opt-wrong');
    else if(inCorrect && !inChosen) el.classList.add('opt-reveal');
  });

  const card = document.getElementById(`card-${qi}`);
  const res = document.getElementById(`result-${qi}`);
  const clr = document.getElementById(`clear-${qi}`);
  const checkBtn = document.getElementById(`msq-check-${qi}`);
  if(checkBtn) checkBtn.style.display='none';

  if(isCorrect){
    card.className='q-card correct';
    res.className='q-result res-correct'; res.style.display='block';
    res.innerHTML='✅ All correct!';
  } else {
    card.className='q-card wrong';
    const correctOpts = q.c.map(i=>`${String.fromCharCode(65+i)}. ${q.o[i]}`).join(', ');
    res.className='q-result res-wrong'; res.style.display='block';
    res.innerHTML=`❌ Incorrect. Correct: <strong>${correctOpts}</strong>`;
    clr.style.display='inline-block';
  }
  updateProgress();
}

function saveNAT(qi){
  if(!answers[qi]) answers[qi]={value:'',submitted:false};
  answers[qi].value = document.getElementById(`nat-${qi}`)?.value || '';
}

function checkNAT(qi){
  const q = SETS[currentSet][qi];
  const ans = answers[qi];
  if(!ans || ans.submitted) return;
  ans.submitted = true;

  const input = document.getElementById(`nat-${qi}`);
  const userVal = (ans.value+'').trim();
  const correctVal = (q.c+'').trim();
  // Accept close numeric match
  const isCorrect = userVal === correctVal || parseFloat(userVal) === parseFloat(correctVal);
  ans.isCorrect = isCorrect;

  const card = document.getElementById(`card-${qi}`);
  const res = document.getElementById(`result-${qi}`);
  const clr = document.getElementById(`clear-${qi}`);

  if(input){
    input.disabled = true;
    input.classList.add(isCorrect?'nat-correct':'nat-wrong');
  }

  if(isCorrect){
    card.className='q-card correct';
    res.className='q-result res-correct'; res.style.display='block';
    res.innerHTML='✅ Correct!';
  } else {
    card.className='q-card wrong';
    res.className='q-result res-wrong'; res.style.display='block';
    res.innerHTML=`❌ Incorrect. Correct answer: <strong>${q.c}</strong>`;
    clr.style.display='inline-block';
  }
  updateProgress();
}

function clearAnswer(qi){
  const q = SETS[currentSet][qi];
  answers[qi] = null;

  const card = document.getElementById(`card-${qi}`);
  card.className='q-card unanswered';

  if(q.type==='nat'){
    const input = document.getElementById(`nat-${qi}`);
    if(input){ input.value=''; input.disabled=false; input.className='nat-input'; }
  } else {
    q.o.forEach((_,i)=>{
      const el = document.getElementById(`opt-${qi}-${i}`);
      if(el) el.className='opt';
    });
    const checkBtn = document.getElementById(`msq-check-${qi}`);
    if(checkBtn) checkBtn.remove();
  }

  const res = document.getElementById(`result-${qi}`);
  res.style.display='none'; res.innerHTML='';
  document.getElementById(`clear-${qi}`).style.display='none';
  updateProgress();
}

// ══════════════════════════════════════════════════════════════════
//  PROGRESS
// ══════════════════════════════════════════════════════════════════
function updateProgress(){
  const qs = SETS[currentSet];
  const total = qs.length;
  const answered = Object.values(answers).filter(a=>a && a.submitted).length;
  const correct = Object.values(answers).filter(a=>a && a.isCorrect).length;

  document.getElementById('progressFill').style.width = (answered/total*100)+'%';
  document.getElementById('progressText').textContent = `${answered} / ${total} answered`;
  document.getElementById('liveScore').textContent = `✅ ${correct}`;
}

// ══════════════════════════════════════════════════════════════════
//  SUBMIT ALL
// ══════════════════════════════════════════════════════════════════
function submitAll(){
  const qs = SETS[currentSet];
  // Auto-submit any unsubmitted
  qs.forEach((q,i)=>{
    if(!answers[i] || !answers[i].submitted){
      if(q.type==='mcq' && answers[i]) checkMCQ(i);
      else if(q.type==='msq' && answers[i]?.value?.length) checkMSQ(i);
      else if(q.type==='nat') checkNAT(i);
    }
  });

  const correct = Object.values(answers).filter(a=>a && a.isCorrect).length;
  const wrong = Object.values(answers).filter(a=>a && a.submitted && !a.isCorrect).length;
  const skip = qs.length - correct - wrong;
  const pct = Math.round(correct/qs.length*100);

  scores[currentSet] = {correct, wrong, skip};
  saveScores();

  document.getElementById('quiz').style.display='none';
  document.getElementById('results').style.display='block';
  document.getElementById('bigScore').textContent = `${correct} / ${qs.length}`;
  document.getElementById('r-correct').textContent = correct;
  document.getElementById('r-wrong').textContent = wrong;
  document.getElementById('r-skip').textContent = skip;
  document.getElementById('r-pct').textContent = pct+'%';

  let msg='', emoji='';
  if(pct>=90){emoji='🏆';msg='Outstanding! You\'re exam ready!';}
  else if(pct>=75){emoji='🎉';msg='Great work! Keep practising!';}
  else if(pct>=60){emoji='💪';msg='Good effort! Review the wrong ones!';}
  else if(pct>=40){emoji='📖';msg='Keep studying — you\'re getting there!';}
  else{emoji='🔁';msg='More practice needed — review the notes!';}

  document.getElementById('confettiMsg').textContent = emoji;
  document.getElementById('resultMsg').textContent = msg;
  window.scrollTo(0,0);
}

// ══════════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════════
loadScores();
