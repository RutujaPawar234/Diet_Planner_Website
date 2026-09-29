import { useContext } from 'react';
import { DietContext } from '../context/DietContext';

export function useDiet() {
  const context = useContext(DietContext);
  if (!context) throw new Error('useDiet must be used inside <DietProvider>');
  return context;
}
