const BASE_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'ledger-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error('Session expired, please sign in again');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

// ---------- Auth ----------
export async function googleSignIn(credential) {
  return request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export async function getCurrentUser() {
  return request('/auth/me');
}

// ---------- Transactions ----------
export async function getTransactions() {
  return request('/transactions');
}

export async function createTransaction(data) {
  return request('/transactions', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTransaction(id, data) {
  return request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteTransaction(id) {
  return request(`/transactions/${id}`, { method: 'DELETE' });
}

// ---------- Budgets ----------
export async function getBudgets(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/budgets${query ? `?${query}` : ''}`);
}

export async function saveBudget(data) {
  return request('/budgets', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteBudget(id) {
  return request(`/budgets/${id}`, { method: 'DELETE' });
}

// ---------- Categories ----------
export async function getCategories() {
  return request('/categories');
}

export async function createCategory(name) {
  return request('/categories', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function renameCategory(id, name) {
  return request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
}

export async function deleteCategory(id) {
  return request(`/categories/${id}`, { method: 'DELETE' });
}
