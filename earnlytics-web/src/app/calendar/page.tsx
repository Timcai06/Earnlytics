import CalendarClient from "./CalendarClient"

export default function CalendarPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  return <CalendarClient initialYear={year} initialMonth={month} />
}
