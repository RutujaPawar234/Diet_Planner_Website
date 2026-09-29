import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · NutriPlan` : 'NutriPlan – Personalized Diet Planner';
  }, [title]);
}
