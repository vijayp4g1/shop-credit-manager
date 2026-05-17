export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDateIST(
  dateInput: Date | string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...options }).format(date);
}

export function formatTimeIST(
  dateInput: Date | string,
  options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: true }
): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...options }).format(date).toUpperCase();
}

export function isTodayIST(dateInput: Date | string): boolean {
  if (!dateInput) return false;
  const date = new Date(dateInput);
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date) === formatter.format(now);
}

export function formatRelativeTime(dateStr: Date | string): string {
  if (!dateStr) return "";
  const time = formatTimeIST(dateStr);
  if (isTodayIST(dateStr)) return `Today, ${time}`;
  return `${formatDateIST(dateStr, { day: "numeric", month: "short" })}, ${time}`;
}

export function formatDateTimeSplit(dateStr: Date | string) {
  if (!dateStr) return { dateString: "", timeString: "" };
  const timeString = formatTimeIST(dateStr);
  const dateString = isTodayIST(dateStr)
    ? "Today"
    : formatDateIST(dateStr, { day: "numeric", month: "short", year: "numeric" });
  return { dateString, timeString };
}

export function getStartOfMonthISTISO(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value?.padStart(2, "0");

  const istStartStr = `${year}-${month}-01T00:00:00+05:30`;
  return new Date(istStartStr).toISOString();
}

export function getCurrentMonthNameIST(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "long",
    year: "numeric",
  }).format(now);
}

export function getInitials(name: string): string {
  return name ? name.substring(0, 2).toUpperCase() : "";
}

