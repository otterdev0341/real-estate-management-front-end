export default function formatDate(dateStr: string) {
  if (!dateStr) return "-"
  const date = new Date(dateStr)
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}