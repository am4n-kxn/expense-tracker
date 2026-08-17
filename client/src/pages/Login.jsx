import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { googleSignIn } from '../api';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState('');

  async function handleSuccess(credentialResponse) {
    setError('');
    try {
      const { token, user } = await googleSignIn(credentialResponse.credential);
      login(token, user);
    } catch (err) {
      setError('Sign-in failed. Please try again.');
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          Ledger<span>.</span>
        </div>
        <p className="login-tagline">Kept honestly, mostly.</p>
        <div className="login-google-btn">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError('Sign-in failed. Please try again.')}
          />
        </div>
        {error && <p className="form-error">{error}</p>}
      </div>
    </div>
  );
}
