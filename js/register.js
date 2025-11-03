import { registerUser, setCurrentUser, getUsers } from '../auth/auth.js';

const nameEl = document.getElementById('name');
const emailEl = document.getElementById('email');
const pwEl = document.getElementById('password');
const pw2El = document.getElementById('password2');
const submit = document.getElementById('submit');
const msg = document.getElementById('msg');

// Função para mostrar/esconder campo de disciplina
window.toggleSubjectField = function() {
  const role = document.getElementById('role').value;
  const subjectField = document.querySelector('.subject-field');
  const profField = document.querySelector('.prof-field');
  // professor selects a subject, students may select a responsible professor
  subjectField.classList.toggle('hidden', role !== 'professor');
  profField.classList.toggle('hidden', role !== 'aluno');
};

// Popular o select de professores registrados
function populateProfessors(){
  const sel = document.getElementById('professorSelect');
  sel.innerHTML = '<option value="">Selecione seu professor (opcional)</option>';
  const users = getUsers();
  const profs = users.filter(u=> u.role === 'professor');
  profs.forEach(p=>{
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} (${p.subject || '—'})`;
    sel.appendChild(opt);
  });
}

// popular ao carregar a página
document.addEventListener('DOMContentLoaded', ()=>{
  populateProfessors();
});

submit.addEventListener('click', async ()=>{
  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const role = document.getElementById('role')?.value || 'aluno';
  const subject = document.getElementById('subject')?.value;
  const professorId = document.getElementById('professorSelect')?.value || undefined;
  const pw = pwEl.value;
  const pw2 = pw2El.value;
  if(!name||!email||!pw) return msg.textContent = 'Preencha todos os campos';
  if(role === 'professor' && !subject) return msg.textContent = 'Selecione uma disciplina';
  if(pw !== pw2) return msg.textContent = 'Senhas não conferem';
  try{
    const user = await registerUser({
      name,
      email,
      password: pw, 
      role,
      subject: role === 'professor' ? subject : undefined,
      professorId: role === 'aluno' ? professorId : undefined
    });
    setCurrentUser(user);
    msg.textContent = 'Registro realizado. Redirecionando...';
    setTimeout(()=> location.href = 'index.html', 800);
  }catch(err){
    msg.textContent = err.message || 'Erro no registro';
  }
});
