import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, loginUser, registerUser, logoutUser, resetPassword, signInWithGoogle } from '../firebase/services';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const authUser = await loginUser(email, password);
      setUser(authUser);
      toast.success('Welcome back!');
      return authUser;
    } catch (err) {
      const msg = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : err.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Try again later.'
        : err.code === 'auth/network-request-failed'
        ? 'Network error. Check your connection.'
        : err.message;
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const register = async (name, email, password) => {
    try {
      const authUser = await registerUser(name, email, password);
      setUser(authUser);
      toast.success('Account created successfully!');
      return authUser;
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : err.code === 'auth/weak-password'
        ? 'Password must be at least 6 characters'
        : err.message;
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    toast.success('Logged out');
  };

  const googleLogin = async () => {
    try {
      const authUser = await signInWithGoogle();
      setUser(authUser);
      toast.success('Signed in with Google!');
      return authUser;
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(err.message);
      }
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    await resetPassword(email);
    toast.success('Password reset email sent! Check your inbox.');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, forgotPassword, googleLogin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
