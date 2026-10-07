import { lazy } from 'react';

const RELOAD_KEY = 'nutriplan_chunk_reload';

/**
 * React.lazy() that survives new deployments. When a new version is published,
 * the old hashed page files are removed, so a tab opened before the release
 * fails to load the next page. In that case reload once to fetch the new build.
 */
export function lazyWithRetry(importer) {
  return lazy(async () => {
    try {
      const module = await importer();
      sessionStorage.removeItem(RELOAD_KEY);
      return module;
    } catch (error) {
      let alreadyReloaded = true;
      try {
        alreadyReloaded = sessionStorage.getItem(RELOAD_KEY) === '1';
        if (!alreadyReloaded) sessionStorage.setItem(RELOAD_KEY, '1');
      } catch {
        /* storage unavailable — fall through to the error boundary */
      }
      if (!alreadyReloaded) {
        window.location.reload();
        return new Promise(() => {}); // keep showing the loader while the page reloads
      }
      throw error;
    }
  });
}
