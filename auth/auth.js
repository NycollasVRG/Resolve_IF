import { sha256 } from './lib_sha256.js';

const USERS_KEY = 'resolve_if_users_v1';
const CURRENT_USER_KEY = 'resolve_if_current_v1';

export function getUsers(){
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

export function saveUsers(users){
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function hashPassword(password){
  return await sha256(password || '');
}

export async function registerUser({name, email, password, role='aluno', subject}){
  const users = getUsers();
  if(users.find(u=> u.email === email)){
    throw new Error('Email já cadastrado');
  }
  const passHash = await hashPassword(password);
  const user = { 
    id: Date.now().toString(36), 
    name, 
    email, 
    passHash, 
    role,
    subject: role === 'professor' ? subject : undefined 
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export async function loginUser(identifier, password){
  const users = getUsers();
  const user = users.find(u=> u.email === identifier || u.name === identifier);
  if(!user) throw new Error('Usuário não encontrado');
  const passHash = await hashPassword(password);
  if(passHash !== user.passHash) throw new Error('Senha incorreta');
  setCurrentUser(user);
  return user;
}

export function getCurrentUser(){
  const id = localStorage.getItem(CURRENT_USER_KEY);
  if(!id) return null;
  return getUsers().find(u=> u.id === id) || null;
}

export function setCurrentUser(user){
  if(!user) localStorage.removeItem(CURRENT_USER_KEY);
  else localStorage.setItem(CURRENT_USER_KEY, user.id);
  if(user) localStorage.setItem('resolve_if_me', user.id);
  else localStorage.removeItem('resolve_if_me');
}

export function logoutUser(){ setCurrentUser(null); }
