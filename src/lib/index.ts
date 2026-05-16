export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;
  return `${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${time}`;
}

export function getInitials(name: string): string {
  return name.substring(0, 2).toUpperCase();
}
