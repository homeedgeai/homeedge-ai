// lib/sales.ts
export type Sale = {
  id: string;
  label: string;
  amount: number; // in dollars
  date: number;   // timestamp for when sale closed
};

// Demo sales (replace with backend later)
const sales: Sale[] = [
  { id: "1", label: "Sale A", amount: 500000, date: Date.now() - 1000 * 60 * 60 * 24 * 25 },
  { id: "2", label: "Sale B", amount: 320000, date: Date.now() - 1000 * 60 * 60 * 24 * 18 },
  { id: "3", label: "Sale C", amount: 750000, date: Date.now() - 1000 * 60 * 60 * 24 * 10 },
  { id: "4", label: "Sale D", amount: 610000, date: Date.now() - 1000 * 60 * 60 * 24 * 3 },
];

export function getSales() {
  return sales;
}

// Simple perf % vs. last period
export function getPerformancePercent() {
  const now = Date.now();
  const cutoff = now - 1000 * 60 * 60 * 24 * 30; // last 30 days
  const thisMonth = sales.filter((s) => s.date >= cutoff);
  const lastMonth = sales.filter((s) => s.date < cutoff);

  const thisTotal = thisMonth.reduce((a, b) => a + b.amount, 0);
  const lastTotal = lastMonth.reduce((a, b) => a + b.amount, 0);

  if (lastTotal === 0) return 100;
  return Math.round(((thisTotal - lastTotal) / lastTotal) * 100);
}
