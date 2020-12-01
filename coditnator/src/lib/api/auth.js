import client from './client';

// 로그인
export const login = ({ username, password }) =>
  client.get('/auth/session', { username, password });

// 회원가입
export const register = ({ username, password, name }) =>
  client.post('/auth/register', { username, password, name });

// 로그인 상태 확인
export const check = () => client.get('/auth/session');

// 로그아웃
export const logout = () => (window.location.href = '/auth/logout');
