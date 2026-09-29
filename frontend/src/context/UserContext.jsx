import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { profileService } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';

/**
 * UserContext — the signed-in user's health profile (age, weight, goal …)
 * and the metrics the API derives from it (BMI, BMR, TDEE, calorie target).
 * Shared by the dashboard, planner, progress and profile pages so they never
 * show stale numbers after one of them changes the profile.
 */
export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { isAuthenticated, setHasProfile } = useAuth();
  const [profile, setProfileState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.get();
      setProfileState(data);
      setHasProfile(Boolean(data));
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setHasProfile]);

  // Load the profile after login; clear it after logout.
  useEffect(() => {
    if (isAuthenticated) refreshProfile();
    else setProfileState(null);
  }, [isAuthenticated, refreshProfile]);

  /** PUT /api/profile — creates or updates the profile and stores the recalculated result. */
  const saveProfile = useCallback(
    async (data) => {
      const saved = await profileService.save(data);
      setProfileState(saved);
      setHasProfile(true);
      return saved;
    },
    [setHasProfile]
  );

  /** Used when another API response already contains the updated profile (e.g. progress sync). */
  const setProfile = useCallback((data) => data && setProfileState(data), []);

  const value = useMemo(
    () => ({ profile, loading, error, refreshProfile, saveProfile, setProfile }),
    [profile, loading, error, refreshProfile, saveProfile, setProfile]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
