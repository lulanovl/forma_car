import { useState } from 'react';
import { login } from '../api/index.js';
import { saveToken } from '../utils/auth.js';
import { toastSuccess } from './toast.js';

export default function LoginModal({ onClose, onSuccess }) {
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!loginName || !password) return;
    setLoading(true);
    setError('');
    try {
      const { token } = await login(loginName, password);
      saveToken(token);
      toastSuccess('Добро пожаловать в CRM');
      onSuccess();
    } catch {
      setError('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className="modal-bg open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-x" onClick={onClose}>×</button>
        <div className="modal-title">CRM ПАНЕЛЬ</div>
        <div className="modal-sub">Введите логин и пароль администратора</div>
        <div className="mform">
          <input
            type="text"
            placeholder="Логин"
            autoComplete="username"
            autoFocus
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <input
            type="password"
            placeholder="Пароль"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {error && <p className="error-msg">{error}</p>}
          <button
            className="btn-primary"
            style={{ clipPath: 'none' }}
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'ВХОДИМ...' : 'ВОЙТИ'}
          </button>
        </div>
      </div>
    </div>
  );
}
