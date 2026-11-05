// NBA Bracket 27
const S = (window.SEEDS || { west: {}, east: {} });
// Series definitions: id, conference, round, [seedA, seedB], next [seriesId, slotIndex]
const WEST_R1 = [ ['W11', 1, 8], ['W12', 4, 5], ['W13', 3, 6], ['W14', 2, 7] ];
const EAST_R1 = [ ['E11', 1, 8], ['E12', 4, 5], ['E13', 3, 6], ['E14', 2, 7] ];
const ROUNDS = {
  W1: { label: 'First round', conf: 'West', series: [] },
  W2: { label: 'Conf. semis', conf: 'West', series: [] },
  W3: { label: 'Conf. final', conf: 'West', series: [] },
  F:  { label: 'NBA Finals', conf: 'Finals', series: [] },
  E3: { label: 'Conf. final', conf: 'East', series: [] },
  E2: { label: 'Conf. semis', conf: 'East', series: [] },
  E1: { label: 'First round', conf: 'East', series: [] }
};
const SERIES = {}; // id -> {conf, roundKey, slots: [{seed, team}], next: [id, slotIdx]}
function defSeries(id, conf, roundKey, seedA, seedB, next){
  SERIES[id] = { id, conf, roundKey, next,
    slots: [ { seed: seedA, conf, team: (S[conf] || {})[seedA] || 'TBD' }, { seed: seedB, conf, team: (S[conf] || {})[seedB] || 'TBD' } ] };
  ROUNDS[roundKey].series.push(id);
}
WEST_R1.forEach(([id, a, b], i) => defSeries(id, 'west', 'W1', a, b, ['W2' + (i < 2 ? 1 : 2), i % 2]));
EAST_R1.forEach(([id, a, b], i) => defSeries(id, 'east', 'E1', a, b, ['E2' + (i < 2 ? 1 : 2), i % 2]));
defSeries('W21', 'west', 'W2', null, null, ['W31', 0]);
defSeries('W22', 'west', 'W2', null, null, ['W31', 1]);
defSeries('W31', 'west', 'W3', null, null, ['F', 0]);
defSeries('E21', 'east', 'E2', null, null, ['E31', 0]);
defSeries('E22', 'east', 'E2', null, null, ['E31', 1]);
defSeries('E31', 'east', 'E3', null, null, ['F', 1]);
defSeries('F', 'finals', 'F', null, null, null);

const winners = {}, gamesSel = {};
function slotLabel(s){ return s.team && s.team !== 'TBD' ? s.team : (s.seed ? (s.conf === 'west' ? 'West ' : s.conf === 'east' ? 'East ' : '') + '#' + s.seed : 'TBD'); }

function buildBracket(){
  const root = document.getElementById('bracket');
  root.innerHTML = '';
  ['W1','W2','W3','F','E3','E2','E1'].forEach(rk => {
    const r = ROUNDS[rk];
    const col = document.createElement('div'); col.className = 'round';
    col.innerHTML = `<div class="conf-tag">${r.conf === 'West' ? 'WEST' : r.conf === 'East' ? 'EAST' : ''}</div><div class="round-label">${r.label}</div>`;
    r.series.forEach(id => col.appendChild(buildSeries(id)));
    root.appendChild(col);
  });
}
function buildSeries(id){
  const s = SERIES[id];
  const card = document.createElement('div');
  card.className = 'series' + (id === 'F' ? ' champ-series' : '');
  s.slots.forEach((slot, i) => {
    const d = document.createElement('div');
    d.className = 'slot' + (winners[id] === slotLabel(slot) && slotLabel(slot) !== 'TBD' ? ' winner' : '');
    d.setAttribute('role', 'button'); d.tabIndex = 0;
    d.innerHTML = (slot.seed ? `<span class="seed-badge">${slot.seed}</span>` : '') + `<span class="slot-name">${slotLabel(slot)}</span>`;
    const pick = () => { if(slotLabel(slot) === 'TBD') return;
      winners[id] = winners[id] === slotLabel(slot) ? undefined : slotLabel(slot);
      if(!winners[id]) delete winners[id];
      recompute(); };
    d.addEventListener('click', pick);
    d.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); pick(); } });
    card.appendChild(d);
  });
  const g = document.createElement('select'); g.className = 'games';
  g.setAttribute('aria-label', 'Series length for ' + id);
  g.innerHTML = '<option value="">in ...</option><option>4-0</option><option>4-1</option><option>4-2</option><option>4-3</option>';
  g.value = gamesSel[id] || '';
  g.addEventListener('change', () => { gamesSel[id] = g.value; });
  card.appendChild(g);
  return card;
}
function recompute(){
  // propagate winners to next-round slots, clearing stale downstream picks
  for(const id of ['W11','W12','W13','W14','W21','W22','W31','E11','E12','E13','E14','E21','E22','E31','F']){
    const s = SERIES[id];
    // clear winner if it no longer matches either slot
    if(winners[id] && ![slotLabel(s.slots[0]), slotLabel(s.slots[1])].includes(winners[id])) delete winners[id];
    if(s.next){
      const [nid, idx] = s.next;
      SERIES[nid].slots[idx] = { seed: null, team: winners[id] || 'TBD' };
    }
  }
  buildBracket();
  const champ = winners['F'];
  document.querySelectorAll('.champ-name').forEach(el => el.textContent = champ || 'TBD');
}

/* Copy + validate */
function collect(){
  return { name: document.getElementById('f-name').value.trim(),
    winners: { ...winners }, games: { ...gamesSel },
    submitted: new Date().toISOString().slice(0,10) };
}
const ORDER = ['W11','W12','W13','W14','W21','W22','W31','E11','E12','E13','E14','E21','E22','E31','F'];
function validate(p){
  if(!p.name) return 'Add your name.';
  const missing = ORDER.filter(id => !p.winners[id]);
  if(missing.length) return 'Pick a winner for every series (' + missing.length + ' left).';
  const noGames = ORDER.filter(id => !p.games[id]);
  if(noGames.length) return 'Set the games for every series (' + noGames.length + ' left).';
  return null;
}
const NAMES = { W1: 'West R1', W2: 'West semis', W3: 'West final', E1: 'East R1', E2: 'East semis', E3: 'East final', F: 'Finals' };
function fmt(p){
  const byRound = {};
  ORDER.forEach(id => {
    const s = SERIES[id], rk = s.roundKey;
    const loser = [slotLabel(s.slots[0]), slotLabel(s.slots[1])].find(x => x !== p.winners[id]) || '?';
    (byRound[rk] = byRound[rk] || []).push(`${p.winners[id]} over ${loser} (${p.games[id]})`);
  });
  let out = `NBA Bracket 27 - ${p.name}\n`;
  ['W1','W2','W3','E1','E2','E3','F'].forEach(rk => { out += `${NAMES[rk]}: ${byRound[rk].join('; ')}\n`; });
  out += `Champion: ${p.winners['F']}`;
  return out;
}
function flash(t, ok){ const m = document.getElementById('msg'); m.textContent = t; m.className = ok ? 'ok' : 'err'; }
function doCopy(text){
  if(navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
  const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); return Promise.resolve();
}
document.getElementById('btn-copy').addEventListener('click', () => {
  const p = collect(); const err = validate(p); if(err) return flash(err, false);
  doCopy(fmt(p)).then(() => flash('Copied. Now paste it in the group chat and send it to Miguel.', true))
    .catch(() => flash('Copy failed. Long-press and select the text instead.', false));
});
document.getElementById('btn-json').addEventListener('click', () => {
  const p = collect(); const err = validate(p); if(err) return flash(err, false);
  doCopy(JSON.stringify(p)).then(() => flash('JSON copied (for the admin file).', true))
    .catch(() => flash('Copy failed.', false));
});

/* Leaderboard */
const PTS = { 1: 5, 2: 8, 3: 12, F: 20 };
function roundOf(id){ return id === 'F' ? 'F' : id[1]; }
function score(p, r){
  let s = 0; const rw = r.winners || {}, rg = r.games || {};
  ORDER.forEach(id => {
    if(rw[id] && (p.winners || {})[id] === rw[id]){
      s += PTS[roundOf(id)];
      if(rg[id] && (p.games || {})[id] === rg[id]) s += 2;
    }
  });
  return s;
}
function renderBoard(){
  const b = document.getElementById('board'); if(!b) return;
  const picks = window.PICKS || [], r = window.RESULTS || {};
  if(!picks.length){ b.innerHTML = '<div class="panel"><p class="empty">No entries yet. Seeds are TBD until mid-April 2027; brackets open then.</p></div>'; return; }
  const scored = Object.keys(r.winners || {}).length > 0;
  const rows = picks.map(p => ({ p, s: score(p, r) })).sort((a, b) => b.s - a.s);
  let html = '<div class="panel"><h2>Leaderboard</h2><p class="sub">' + (scored ? 'Scored against finished series.' : 'Standings go live as series end (Apr-Jun 2027).') + '</p><table><tr><th>#</th><th>Name</th><th>Pts</th><th>Champion pick</th></tr>';
  rows.forEach((x, i) => {
    html += `<tr><td class="board-rank">${i+1}</td><td><span class="board-name">${x.p.name}</span><br><span class="picks-detail">in ${x.p.submitted || '-'}</span></td><td>${scored ? x.s : '-'}</td><td class="picks-detail">${(x.p.winners || {})['F'] || '?'}</td></tr>`;
  });
  b.innerHTML = html + '</table></div>';
}

/* Tabs */
function switchTab(name){
  document.querySelectorAll('.site-nav a').forEach(x => {
    if(x.dataset.tab === name) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current');
  });
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const target = document.getElementById('tab-' + name);
  if(target) target.classList.add('active');
  if(name === 'board') renderBoard();
}
document.querySelectorAll('.site-nav a').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if(document.startViewTransition) document.startViewTransition(() => switchTab(btn.dataset.tab));
    else switchTab(btn.dataset.tab);
  });
});

/* Champion banner inside Finals column (added after build) */
function addChampBanner(){
  const cols = document.querySelectorAll('#bracket .round');
  const fcol = cols[3];
  if(fcol && !fcol.querySelector('.champ-banner')){
    const d = document.createElement('div');
    d.className = 'champ-banner';
    d.innerHTML = '<div class="round-label">Champion</div><span class="champ-name">TBD</span>';
    fcol.appendChild(d);
  }
}
const origBuild = buildBracket;
buildBracket = function(){ origBuild(); addChampBanner(); };

/* Header shadow */
const header = document.querySelector('.site-header');
const onScroll = () => header && header.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* Reveal */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const els = document.querySelectorAll('.reveal');
els.forEach((el, i) => el.style.setProperty('--i', Math.min(i, 8)));
if(reduce || !('IntersectionObserver' in window)) els.forEach(el => el.classList.add('in-view'));
else {
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if(en.isIntersecting){ en.target.classList.add('in-view'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  els.forEach(el => io.observe(el));
}

buildBracket();
renderBoard();
window.siteReady = true;
