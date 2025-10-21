import { loginUser } from './auth.js';

const idEl = document.getElementById('identifier');
const pwEl = document.getElementById('password');
const submit = document.getElementById('submit');
const msg = document.getElementById('msg');

submit.addEventListener('click', async ()=>{
  const id = idEl.value.trim();
  const pw = pwEl.value;
  try{
    await loginUser(id, pw);
    msg.textContent = 'Login realizado. Redirecionando...';
    setTimeout(()=> location.href = 'index.html', 800);
  }catch(err){
    msg.textContent = err.message || 'Erro no login';
  }
});
