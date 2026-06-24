// All date/time operations in KST (Asia/Seoul)
const KST = 'Asia/Seoul'

// Get today's date string in KST as YYYY-MM-DD
export function getTodayKST() {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: KST })
  return formatter.format(now) // Returns YYYY-MM-DD
}

// Format date string YYYY-MM-DD to Korean display YY.MM.DD.
export function formatDateKorean(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${year.slice(2)}.${month}.${day}.`
}

// Format time HH:MM
export function formatTime(timeStr) {
  if (!timeStr) return ''
  return timeStr.slice(0, 5)
}

// Format date range for display
export function formatDateRange(startDate, endDate, startTime, endTime) {
  const date = formatDateKorean(startDate)
  const start = formatTime(startTime)
  const end = formatTime(endTime)
  return `${date} ${start} ~ ${end}`
}

// Parse HH:MM to minutes
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

// Check if two time ranges overlap (both on same date)
export function timesOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1)
  const e1 = timeToMinutes(end1)
  const s2 = timeToMinutes(start2)
  const e2 = timeToMinutes(end2)
  return s1 < e2 && e1 > s2
}

// Get hours array 0..23
export function getHours() {
  return Array.from({ length: 24 }, (_, i) => i)
}

// Format hour to HH:00
export function formatHour(h) {
  return `${String(h).padStart(2, '0')}:00`
}

// Add days to a date string YYYY-MM-DD
export function addDays(dateStr, days) {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() + days)
  const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'UTC' })
  return formatter.format(date)
}

// Sort schedules: pending first, then by date asc, then by start_time asc
export function sortSchedules(schedules) {
  return [...schedules].sort((a, b) => {
    if (a.is_pending && !b.is_pending) return -1
    if (!a.is_pending && b.is_pending) return 1
    if (a.schedule_date < b.schedule_date) return -1
    if (a.schedule_date > b.schedule_date) return 1
    if ((a.start_time || '') < (b.start_time || '')) return -1
    if ((a.start_time || '') > (b.start_time || '')) return 1
    return 0
  })
}

// Get hours covered by a time range (for timetable)
// Returns array of hour numbers (0-23) that are covered
export function getHoursCovered(startTime, endTime) {
  if (!startTime || !endTime) return []
  const startH = parseInt(startTime.split(':')[0])
  const endH = parseInt(endTime.split(':')[0])
  const endM = parseInt(endTime.split(':')[1])
  const actualEnd = endM > 0 ? endH : endH
  const hours = []
  for (let h = startH; h < actualEnd; h++) {
    hours.push(h)
  }
  return hours
}
