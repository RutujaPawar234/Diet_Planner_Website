import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import { authService } from '../services/authService';
import { tokenStorage, UNAUTHORIZED_EVENT } from '../services/api';

/**
 * AuthContext — global authentication state.
 * Provides: user, status, isAuthenticated, isAdmin, hasProfile,
 *           login(), register(), logout(), setHasProfile(), updateUser()
 */
export const AuthContext = createContext(null);

const initialState = {
  user: null,
  hasProfile: false,
  // 'checking' while a saved token is verified on first load
  status: tokenStorage.get() ? 'checking' : 'guest',
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { user: action.user, hasProfile: action.hasProfile, status: 'authenticated' };
    case 'LOGOUT':
      return { user: null, hasProfile: false, status: 'guest' };
    case 'SET_HAS_PROFILE':
      return { ...state, hasProfile: action.value };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.user } };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Restore the session from a saved token on first load.
  useEffect(() => {
    if (!tokenStorage.get()) return;
    authService
      .me()
      .then(({ user, hasProfile }) => dispatch({ type: 'AUTH_SUCCESS', user, hasProfile }))
      .catch(clearSession);
  }, [clearSession]);

  // Any 401 from the API (expired token, deleted account) ends the session.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, clearSession);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, clearSession);
  }, [clearSession]);

  const handleAuth = useCallback(({ token, user, hasProfile }) => {
    tokenStorage.set(token);
    dispatch({ type: 'AUTH_SUCCESS', user, hasProfile });
    return { user, hasProfile };
  }, []);

  const login = useCallback((credentials) => authService.login(credentials).then(handleAuth), [handleAuth]);

  const register = useCallback((details) => authService.register(details).then(handleAuth), [handleAuth]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* token may already be invalid — log out locally regardless */
    }
    clearSession();
  }, [clearSession]);

  const setHasProfile = useCallback((value) => dispatch({ type: 'SET_HAS_PROFILE', value }), []);
  const updateUser = useCallback((user) => dispatch({ type: 'UPDATE_USER', user }), []);

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: state.status === 'authenticated',
      isAdmin: state.user?.role === 'admin',
      login,
      register,
      logout,
      setHasProfile,
      updateUser,
    }),
    [state, login, register, logout, setHasProfile, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
