import { create } from 'zustand';
import { onAuthChange, loginUser, registerUser, logoutUser, resetPassword } from '../firebase/services';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  init: () => {
    const unsubscribe = onAuthChange((authUser) => {
      set({ user: authUser, loading: false });
    });
    return unsubscribe;
  },

  login: async (email, password) => {
    const authUser = await loginUser(email, password);
    set({ user: authUser });
    return authUser;
  },

  register: async (name, email, password) => {
    const authUser = await registerUser(name, email, password);
    set({ user: authUser });
    return authUser;
  },

  logout: async () => {
    await logoutUser();
    set({ user: null });
  },

  forgotPassword: async (email) => {
    await resetPassword(email);
  },
}));

export default useAuthStore;
