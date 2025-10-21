import { sha256 } from '../auth/lib_sha256.js';
import { getUsers, saveUsers, registerUser, loginUser, getCurrentUser, setCurrentUser, logoutUser } from '../auth/auth.js';

// Utilitários
const $ = sel=> document.querySelector(sel);
const $$ = sel=> Array.from(document.querySelectorAll(sel));

// Navegação entre views
const navButtons = $$('.nav button');
const views = $$('.view');
navButtons.forEach(btn=> btn.addEventListener('click', ()=>{
  navButtons.forEach(b=> b.classList.remove('active'));
  btn.classList.add('active');
  const target = btn.dataset.view;
  views.forEach(v=> v.classList.toggle('hidden', v.id !== target));
  // render dynamic views
  if(target === 'prof') renderProfList();
  if(target === 'coordportal') renderCoordPortalList();
}));

// Dados e persistência
const STORAGE_KEY = 'resolve_if_posts_v1';

let posts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

function savePosts(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

// Hashing para integridade (assume sha256 import fornecido)
async function computeSignature(item){
  const base = [item.title, item.type, item.priority, item.desc, item.date].join('|');
  return await sha256(base);
}

// Render posts (visão pública)
const postsList = $('#postsList');
function renderPosts(filter={priority:'all',state:'open',mine:false}){
  let list = posts.slice().reverse();
  if(filter.priority && filter.priority !== 'all') list = list.filter(p=> p.priority===filter.priority);
  if(filter.state && filter.state !== 'all'){
    if(filter.state==='open') list = list.filter(p=> !p.resolved && !p.archived);
    if(filter.state==='resolved') list = list.filter(p=> p.resolved && !p.archived);
    if(filter.state==='archived') list = list.filter(p=> p.archived);
  }
  if(filter.mine){
    const me = localStorage.getItem('resolve_if_me') || '';
    list = list.filter(p=> p.authorId && p.authorId === me);
  }
  postsList.innerHTML = list.map(p=> renderPostHtml(p)).join('') || '<p class="meta">Nenhum post encontrado.</p>';
}

function renderPostHtml(p){
  return `
    <article class="post">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong>${escapeHtml(p.title)}</strong>
        <span class="meta">${p.date}</span>
      </div>
      <div class="meta">Prioridade: ${p.priority} • Tipo: ${p.type}</div>
      <div class="meta">Por ${p.anonymous? 'Anônimo' : escapeHtml(p.author || '—')}</div>
      <p style="margin-top:8px">${escapeHtml(p.desc)}</p>
    </article>`;
}

function escapeHtml(str){
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// Form criação
const form = $('#complaintForm');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const current = getCurrentUser();
  if(!current){
    alert('Você precisa entrar antes de criar uma reclamação.');
    document.getElementById('loginBtn').click?.();
    return;
  }
  const title = form.title.value.trim();
  const type = form.type.value;
  const priority = form.priority.value;
  const desc = form.desc.value.trim();
  const anonymous = $('#anonymous').checked;
  const author = anonymous? null : (current.name || current.email || '');
  const date = new Date().toISOString().slice(0,10);
  const item = {
    id: Date.now().toString(36),
    title: `${type.toUpperCase()}: ${title}`,
    type,
    priority,
    desc,
    date,
    anonymous: !!anonymous,
    author: anonymous? null : author,
    authorId: anonymous? null : current.id,
    resolved: false,
    archived: false,
    signature: ''
  };
  item.signature = await computeSignature(item);
  posts.push(item);
  savePosts();
  renderPosts({priority: $('#filterPriority').value, state: $('#filterState').value});
  document.querySelector('[data-view="posts"]').click();
  form.reset();
  alert('Enviado com sucesso. Sua submissão possui assinatura de integridade.');
});

$('#clearBtn').addEventListener('click', ()=> form.reset());

// filtros
$('#filterPriority').addEventListener('change', ()=> renderPosts({priority: $('#filterPriority').value, state: $('#filterState').value}));
$('#filterState').addEventListener('change', ()=> renderPosts({priority: $('#filterPriority').value, state: $('#filterState').value}));
$('#myPostsBtn').addEventListener('click', ()=> renderPosts({priority: $('#filterPriority').value, state: $('#filterState').value, mine:true}));

// Auth UI wiring
const authStatus = $('#authStatus');
const loginBtn = $('#loginBtn');
const logoutBtn = $('#logoutBtn');
const createAuthWarning = $('#createAuthWarning');
const openRegister = $('#openRegister');
const profBtn = $('#profBtn');
const coordPortalBtn = $('#coordPortalBtn');

function renderAuthState(){
  const cur = getCurrentUser();
  if(cur){
    authStatus.textContent = `Autenticado como ${cur.name || cur.email} (${cur.role||'aluno'})`;
    logoutBtn.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    createAuthWarning.classList.add('hidden');
    // mostrar abas por papel
    if(cur.role === 'professor') profBtn.classList.remove('hidden'); else profBtn.classList.add('hidden');
    if(cur.role === 'coordenador') coordPortalBtn.classList.remove('hidden'); else coordPortalBtn.classList.add('hidden');
  } else {
    authStatus.textContent = 'Não autenticado';
    logoutBtn.classList.add('hidden');
    loginBtn.classList.remove('hidden');
    createAuthWarning.classList.remove('hidden');
    profBtn.classList.add('hidden');
    coordPortalBtn.classList.add('hidden');
  }
}

loginBtn.addEventListener('click', ()=> { location.href = 'login.html'; });
logoutBtn.addEventListener('click', ()=> { logoutUser(); alert('Logout realizado'); renderAuthState(); });
openRegister?.addEventListener('click', ()=> { location.href = 'register.html'; });

// Login and registration handled on separate pages (login.html, register.html)

// Coordenação — login simples (demo)
const COORD_PASS = 'coord1234'; // DEMO. em produção, usar backend e autenticação real
// Coordenação: permitir acesso via papel do usuário ou senha demo
$('#coordLoginBtn').addEventListener('click', ()=>{
  const pass = $('#coordPass').value;
  const cur = getCurrentUser();
  if((cur && cur.role === 'coordenador') || pass === COORD_PASS){
    $('#coordLogin').classList.add('hidden');
    $('#coordPanel').classList.remove('hidden');
    renderCoordList();
  } else {
    alert('Acesso negado: senha incorreta ou usuário sem permissão');
  }
});

$('#coordLogout').addEventListener('click', ()=>{
  $('#coordPass').value = '';
  $('#coordPanel').classList.add('hidden');
  $('#coordLogin').classList.remove('hidden');
});

function renderCoordList(){
  const list = $('#coordList');
  if(posts.length===0){ list.innerHTML = '<p class="meta">Nenhum post.</p>'; return }
  list.innerHTML = posts.slice().reverse().map(p=>{
    return `
      <article class="post">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${escapeHtml(p.title)}</strong>
          <span class="meta">${p.date}</span>
        </div>
        <div class="meta">Prioridade: ${p.priority} • Tipo: ${p.type} • Estado: ${p.archived? 'Arquivado' : p.resolved? 'Resolvido' : 'Aberto'}</div>
        <div class="meta">Autor: ${p.anonymous? 'Anônimo' : escapeHtml(p.author || '—')}</div>
        <p style="margin-top:8px">${escapeHtml(p.desc)}</p>
        <div class="post-controls">
          <button data-id="${p.id}" data-action="toggleResolved" class="outline">${p.resolved? 'Marcar como aberto' : 'Marcar como resolvido'}</button>
          <button data-id="${p.id}" data-action="toggleArchive" class="outline">${p.archived? 'Desarquivar' : 'Arquivar'}</button>
          <button data-id="${p.id}" data-action="viewSignature" class="outline">Ver assinatura</button>
        </div>
      </article>`;
  }).join('');
  // delegar eventos
  list.querySelectorAll('button').forEach(b=> b.addEventListener('click', (e)=>{
    const id = b.dataset.id;
    const action = b.dataset.action;
    const idx = posts.findIndex(x=> x.id===id);
    if(idx===-1) return;
    if(action==='toggleResolved'){
      posts[idx].resolved = !posts[idx].resolved;
      savePosts();
      renderCoordList();
      renderPosts({priority: $('#filterPriority').value, state: $('#filterState').value});
    }
    if(action==='toggleArchive'){
      posts[idx].archived = !posts[idx].archived;
      savePosts();
      renderCoordList();
      renderPosts({priority: $('#filterPriority').value, state: $('#filterState').value});
    }
    if(action==='viewSignature'){
      alert('Assinatura (SHA-256):\n'+posts[idx].signature);
    }
  }));
}

// Professor and Coordenador portals
function renderProfList(){
  const cur = getCurrentUser();
  const listEl = $('#profList');
  if(!cur || cur.role !== 'professor') { listEl.innerHTML = '<p class="meta">Acesso negado. Apenas professores.</p>'; return }
  const list = posts.slice().reverse().filter(p=> !p.archived);
  listEl.innerHTML = list.map(p=> `
    <article class="post"><strong>${escapeHtml(p.title)}</strong><div class="meta">${p.date} • ${p.priority}</div><p>${escapeHtml(p.desc)}</p></article>
  `).join('') || '<p class="meta">Nenhum post.</p>';
}

function renderCoordPortalList(){
  const cur = getCurrentUser();
  const el = $('#coordPortalList');
  if(!cur || cur.role !== 'coordenador') { el.innerHTML = '<p class="meta">Acesso negado. Apenas coordenadores.</p>'; return }
  const list = posts.slice().reverse();
  el.innerHTML = list.map(p=> `
    <article class="post"><strong>${escapeHtml(p.title)}</strong><div class="meta">${p.date} • ${p.priority} • ${p.type}</div><p>${escapeHtml(p.desc)}</p></article>
  `).join('') || '<p class="meta">Nenhum post.</p>';
}

// inicial render
renderPosts({priority: $('#filterPriority').value || 'all', state: $('#filterState').value || 'open'});
renderAuthState();

// helpers simples
function hashString(s){
  // função pequena não-criptográfica apenas para id local do autor
  let h=0; for(let i=0;i<s.length;i++){h=(h<<5)-h+ s.charCodeAt(i); h |=0} return String(h >>> 0);
}

// export pequeno para uso por testes (opcional)
window.__resolve_if = { posts, savePosts, renderPosts, getUsers, getCurrentUser };
