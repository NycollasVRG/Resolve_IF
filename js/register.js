import { registerUser, setCurrentUser } from '../auth/auth.js';

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
  subjectField.classList.toggle('hidden', role !== 'professor');
};

submit.addEventListener('click', async ()=>{
  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const role = document.getElementById('role')?.value || 'aluno';
  const subject = document.getElementById('subject')?.value;
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
      subject: role === 'professor' ? subject : undefined
    });
    setCurrentUser(user);
    msg.textContent = 'Registro realizado. Redirecionando...';
    setTimeout(()=> location.href = 'index.html', 800);
  }catch(err){
    msg.textContent = err.message || 'Erro no registro';
  }
});
