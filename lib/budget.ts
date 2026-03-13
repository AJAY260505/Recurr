const BUDGET_KEY = 'recurr_monthly_budget';

export function getBudget(): number | null {
  if (typeof window === 'undefined') return null;
  const val = localStorage.getItem(BUDGET_KEY);
  return val ? parseFloat(val) : null;
}

export function setBudget(amount: number | null) {
  if (amount === null) localStorage.removeItem(BUDGET_KEY);
  else localStorage.setItem(BUDGET_KEY, String(amount));
}