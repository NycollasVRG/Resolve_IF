import { registerUser, setCurrentUser } from './auth.js';

const nameEl = document.getElementById('name');
const emailEl = document.getElementById('email');
const pwEl = document.getElementById('password');
const pw2El = document.getElementById('password2');
const submit = document.getElementById('submit');
const msg = document.getElementById('msg');

submit.addEventListener('click', async ()=>{
  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const role = document.getElementById('role')?.value || 'aluno';
  const pw = pwEl.value;
  const pw2 = pw2El.value;
  if(!name||!email||!pw) return msg.textContent = 'Preencha todos os campos';
  if(pw !== pw2) return msg.textContent = 'Senhas não conferem';
  try{
  const user = await registerUser({name,email,password:pw, role});
    setCurrentUser(user);
    msg.textContent = 'Registro realizado. Redirecionando...';
    setTimeout(()=> location.href = 'index.html', 800);
  }catch(err){
    msg.textContent = err.message || 'Erro no registro';
  }
});
