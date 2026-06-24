import { timesOverlap, formatDateKorean, formatTime } from './dateUtils.js'

// Check duplicates for a shooting schedule
// Returns array of conflict descriptions
export function checkShootingConflicts(newSchedule, allShooting, allRental, excludeId = null) {
  if (newSchedule.is_pending) return []
  const conflicts = []
  const { schedule_date, start_time, end_time } = newSchedule

  // shooting vs shooting
  for (const s of allShooting) {
    if (s.id === excludeId) continue
    if (s.is_pending) continue
    if (s.schedule_date !== schedule_date) continue
    if (timesOverlap(start_time, end_time, s.start_time, s.end_time)) {
      conflicts.push(`촬영 - ${s.name} (${formatDateKorean(s.schedule_date)} ${formatTime(s.start_time)} ~ ${formatTime(s.end_time)})`)
    }
  }

  // shooting vs rental (all types)
  for (const r of allRental) {
    if (r.id === excludeId) continue
    if (r.is_pending) continue
    if (r.schedule_date !== schedule_date) continue
    if (timesOverlap(start_time, end_time, r.start_time, r.end_time)) {
      const label = r.space_type === '호리존' ? '호리존' : r.space_type === '컨셉룸' ? '컨셉룸' : '전체대관'
      conflicts.push(`${label} - ${r.name} (${formatDateKorean(r.schedule_date)} ${formatTime(r.start_time)} ~ ${formatTime(r.end_time)})`)
    }
  }

  return conflicts
}

// Check duplicates for a rental schedule
export function checkRentalConflicts(newSchedule, allShooting, allRental, excludeId = null) {
  if (newSchedule.is_pending) return []
  const conflicts = []
  const { schedule_date, start_time, end_time, space_type } = newSchedule

  // rental vs rental (same or compatible spaces)
  for (const r of allRental) {
    if (r.id === excludeId) continue
    if (r.is_pending) continue
    if (r.schedule_date !== schedule_date) continue
    if (!timesOverlap(start_time, end_time, r.start_time, r.end_time)) continue

    // Check space overlap
    const overlaps = rentalSpacesOverlap(space_type, r.space_type)
    if (overlaps) {
      const label = r.space_type === '호리존' ? '호리존' : r.space_type === '컨셉룸' ? '컨셉룸' : '전체대관'
      conflicts.push(`${label} - ${r.name} (${formatDateKorean(r.schedule_date)} ${formatTime(r.start_time)} ~ ${formatTime(r.end_time)})`)
    }
  }

  // rental vs shooting (all rental types conflict with shooting)
  for (const s of allShooting) {
    if (s.id === excludeId) continue
    if (s.is_pending) continue
    if (s.schedule_date !== schedule_date) continue
    if (timesOverlap(start_time, end_time, s.start_time, s.end_time)) {
      conflicts.push(`촬영 - ${s.name} (${formatDateKorean(s.schedule_date)} ${formatTime(s.start_time)} ~ ${formatTime(s.end_time)})`)
    }
  }

  return conflicts
}

// Check if two space types conflict
function rentalSpacesOverlap(type1, type2) {
  if (type1 === '전체대관' || type2 === '전체대관') return true
  return type1 === type2
}
