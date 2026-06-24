import { useState } from 'react'
import { getTodayKST, formatDateKorean, addDays, getHours, formatHour } from '../utils/dateUtils.js'

function getHoursCovered(startTime, endTime) {
  if (!startTime || !endTime) return []
  const startH = parseInt(startTime.split(':')[0])
  const startM = parseInt(startTime.split(':')[1])
  const endH = parseInt(endTime.split(':')[0])
  const endM = parseInt(endTime.split(':')[1])
  const hours = []
  for (let h = startH; h < endH; h++) {
    hours.push(h)
  }
  // If end time has minutes, the last hour is still "covered"
  if (endM > 0 && endH <= 23) {
    // already included up to endH-1, don't add partial
  }
  return hours
}

export function OverviewTab({ shooting, rental }) {
  const [selectedDate, setSelectedDate] = useState(getTodayKST())
  const [pendingCollapsed, setPendingCollapsed] = useState(false)

  const hours = getHours() // 0..23

  // Filter schedules for selected date
  const dayShoot = shooting.filter(s => !s.is_pending && s.schedule_date === selectedDate)
  const dayHoriz = rental.filter(r => !r.is_pending && r.schedule_date === selectedDate && (r.space_type === '호리존' || r.space_type === '전체대관'))
  const dayConcept = rental.filter(r => !r.is_pending && r.schedule_date === selectedDate && (r.space_type === '컨셉룸' || r.space_type === '전체대관'))
  const dayAll = rental.filter(r => !r.is_pending && r.schedule_date === selectedDate && r.space_type === '전체대관')

  // Pending schedules
  const pendingShoot = shooting.filter(s => s.is_pending)
  const pendingRental = rental.filter(r => r.is_pending)
  const hasPending = pendingShoot.length > 0 || pendingRental.length > 0
  const pendingCount = pendingShoot.length + pendingRental.length

  // Build timetable data structure
  // For each hour, find which schedules cover it
  const getCellData = (hour, type) => {
    let items = []
    if (type === 'shoot') {
      items = dayShoot.filter(s => {
        const covered = getHoursCovered(s.start_time, s.end_time)
        return covered.includes(hour)
      })
    } else if (type === 'horiz') {
      items = dayHoriz.filter(r => {
        const covered = getHoursCovered(r.start_time, r.end_time)
        return covered.includes(hour)
      })
    } else if (type === 'concept') {
      items = dayConcept.filter(r => {
        if (r.space_type === '전체대관') {
          const covered = getHoursCovered(r.start_time, r.end_time)
          return covered.includes(hour)
        }
        const covered = getHoursCovered(r.start_time, r.end_time)
        return covered.includes(hour)
      })
    }
    return items
  }

  // For full-rental (전체대관), we need to merge horiz+concept columns
  // Returns merged cell info per hour
  const getFullRentalForHour = (hour) => {
    return dayAll.filter(r => {
      const covered = getHoursCovered(r.start_time, r.end_time)
      return covered.includes(hour)
    })
  }

  // We need to determine rowspan for cells
  // For each schedule, find start hour and how many hours it spans
  const getScheduleSpan = (schedule) => {
    const hours = getHoursCovered(schedule.start_time, schedule.end_time)
    return { startHour: hours[0], span: hours.length }
  }

  // For timetable rendering, track which cells are "consumed" by rowspans
  const buildTimetable = () => {
    // consumed[col][hour] = true if covered by a rowspan from earlier
    const consumed = { shoot: {}, horiz: {}, concept: {} }
    const rows = []

    for (const hour of hours) {
      const fullRental = getFullRentalForHour(hour)

      // Check if this hour has a full-rental starting
      const fullRentalStarting = fullRental.filter(r => {
        return parseInt(r.start_time.split(':')[0]) === hour
      })

      // shoot cell
      const shootItems = getCellData(hour, 'shoot').filter(s => parseInt(s.start_time.split(':')[0]) === hour)
      const shootContinued = getCellData(hour, 'shoot').filter(s => parseInt(s.start_time.split(':')[0]) !== hour)

      // horiz cell (only non-full-rental)
      const horizItems = dayHoriz.filter(r => r.space_type === '호리존' && getHoursCovered(r.start_time, r.end_time).includes(hour) && parseInt(r.start_time.split(':')[0]) === hour)
      const horizContinued = dayHoriz.filter(r => r.space_type === '호리존' && getHoursCovered(r.start_time, r.end_time).includes(hour) && parseInt(r.start_time.split(':')[0]) !== hour)

      // concept cell
      const conceptItems = dayConcept.filter(r => r.space_type === '컨셉룸' && getHoursCovered(r.start_time, r.end_time).includes(hour) && parseInt(r.start_time.split(':')[0]) === hour)
      const conceptContinued = dayConcept.filter(r => r.space_type === '컨셉룸' && getHoursCovered(r.start_time, r.end_time).includes(hour) && parseInt(r.start_time.split(':')[0]) !== hour)

      rows.push({
        hour,
        shoot: { starting: shootItems, continued: shootContinued },
        horiz: { starting: horizItems, continued: horizContinued },
        concept: { starting: conceptItems, continued: conceptContinued },
        fullRental: { starting: fullRentalStarting, all: fullRental },
      })
    }
    return rows
  }

  const timetableRows = buildTimetable()

  // Track which hours are "inside" a span for each column
  const horizConsumed = {}
  const conceptConsumed = {}
  const fullConsumed = {}
  const shootConsumed = {}

  // Pre-calculate spans
  dayShoot.forEach(s => {
    const hc = getHoursCovered(s.start_time, s.end_time)
    if (hc.length > 1) {
      hc.slice(1).forEach(h => { shootConsumed[h] = (shootConsumed[h] || []).concat(s.id) })
    }
  })
  dayHoriz.filter(r => r.space_type === '호리존').forEach(r => {
    const hc = getHoursCovered(r.start_time, r.end_time)
    if (hc.length > 1) hc.slice(1).forEach(h => { horizConsumed[h] = (horizConsumed[h] || []).concat(r.id) })
  })
  dayConcept.filter(r => r.space_type === '컨셉룸').forEach(r => {
    const hc = getHoursCovered(r.start_time, r.end_time)
    if (hc.length > 1) hc.slice(1).forEach(h => { conceptConsumed[h] = (conceptConsumed[h] || []).concat(r.id) })
  })
  dayAll.forEach(r => {
    const hc = getHoursCovered(r.start_time, r.end_time)
    if (hc.length > 1) hc.slice(1).forEach(h => { fullConsumed[h] = (fullConsumed[h] || []).concat(r.id) })
  })

  const renderTimetable = () => {
    const renderedShoot = {}
    const renderedHoriz = {}
    const renderedConcept = {}
    const renderedFull = {}

    return hours.map(hour => {
      // Build cells
      const shootSchedulesHere = dayShoot.filter(s => getHoursCovered(s.start_time, s.end_time).includes(hour))
      const horizSchedulesHere = dayHoriz.filter(r => r.space_type === '호리존' && getHoursCovered(r.start_time, r.end_time).includes(hour))
      const conceptSchedulesHere = dayConcept.filter(r => r.space_type === '컨셉룸' && getHoursCovered(r.start_time, r.end_time).includes(hour))
      const fullSchedulesHere = dayAll.filter(r => getHoursCovered(r.start_time, r.end_time).includes(hour))

      const shootCells = []
      const horizCells = []
      const conceptCells = []
      const fullCells = []

      // Shoot
      shootSchedulesHere.forEach(s => {
        if (renderedShoot[s.id]) return
        const hc = getHoursCovered(s.start_time, s.end_time)
        renderedShoot[s.id] = true
        shootCells.push({ schedule: s, span: hc.length })
      })

      // Full rental
      fullSchedulesHere.forEach(r => {
        if (renderedFull[r.id]) return
        const hc = getHoursCovered(r.start_time, r.end_time)
        renderedFull[r.id] = true
        fullCells.push({ schedule: r, span: hc.length })
      })

      // Horiz (only non-full)
      horizSchedulesHere.forEach(r => {
        if (renderedHoriz[r.id]) return
        const hc = getHoursCovered(r.start_time, r.end_time)
        renderedHoriz[r.id] = true
        horizCells.push({ schedule: r, span: hc.length })
      })

      // Concept (only non-full)
      conceptSchedulesHere.forEach(r => {
        if (renderedConcept[r.id]) return
        const hc = getHoursCovered(r.start_time, r.end_time)
        renderedConcept[r.id] = true
        conceptCells.push({ schedule: r, span: hc.length })
      })

      const hasFullRentalStarting = fullCells.length > 0
      const isInsideFull = fullSchedulesHere.some(r => {
        const startH = parseInt(r.start_time.split(':')[0])
        return startH !== hour && renderedFull[r.id]
      })

      // Determine if horiz/concept cols are suppressed by an ongoing full rental
      const ongoingFull = fullSchedulesHere.find(r => parseInt(r.start_time.split(':')[0]) !== hour || renderedFull[r.id] && fullCells.every(fc => fc.schedule.id !== r.id))

      return (
        <tr key={hour}>
          <td className="tt-time">{formatHour(hour)}</td>

          {/* Shoot */}
          {shootCells.length > 0
            ? shootCells.map(({ schedule, span }) => (
                <td key={schedule.id} className="tt-cell shoot-cell" rowSpan={span}>
                  <div className="tt-name">{schedule.name}</div>
                </td>
              ))
            : shootSchedulesHere.some(s => renderedShoot[s.id] && !shootCells.find(sc => sc.schedule.id === s.id))
              ? null
              : <td className="tt-cell tt-empty"></td>
          }

          {/* Full rental spanning horiz+concept */}
          {fullCells.length > 0
            ? fullCells.map(({ schedule, span }) => (
                <td key={schedule.id} className="tt-cell full-cell" colSpan={2} rowSpan={span}>
                  <div className="tt-name">{schedule.name}</div>
                  <div className="tt-sub">전체대관</div>
                </td>
              ))
            : fullSchedulesHere.some(r => renderedFull[r.id] && !fullCells.find(fc => fc.schedule.id === r.id))
              ? null
              : (
                <>
                  {/* Horiz */}
                  {horizCells.length > 0
                    ? horizCells.map(({ schedule, span }) => (
                        <td key={schedule.id} className="tt-cell horiz-cell" rowSpan={span}>
                          <div className="tt-name">{schedule.name}</div>
                        </td>
                      ))
                    : horizSchedulesHere.some(r => renderedHoriz[r.id] && !horizCells.find(hc2 => hc2.schedule.id === r.id))
                      ? null
                      : <td className="tt-cell tt-empty"></td>
                  }
                  {/* Concept */}
                  {conceptCells.length > 0
                    ? conceptCells.map(({ schedule, span }) => (
                        <td key={schedule.id} className="tt-cell concept-cell" rowSpan={span}>
                          <div className="tt-name">{schedule.name}</div>
                        </td>
                      ))
                    : conceptSchedulesHere.some(r => renderedConcept[r.id] && !conceptCells.find(cc => cc.schedule.id === r.id))
                      ? null
                      : <td className="tt-cell tt-empty"></td>
                  }
                </>
              )
          }
        </tr>
      )
    })
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2 className="tab-title">종합 일정</h2>
      </div>

      {/* Pending schedules */}
      {hasPending && (
        <div className="pending-section">
          <div className="pending-header">
            <span className="pending-title">📌 미정 일정 ({pendingCount})</span>
            <button className="btn-collapse" onClick={() => setPendingCollapsed(c => !c)}>
              {pendingCollapsed ? '펼치기' : '접기'}
            </button>
          </div>
          {!pendingCollapsed && (
            <div className="pending-list">
              {pendingShoot.map(s => (
                <div key={s.id} className="pending-item pending-shoot">
                  <span className="pending-type">촬영</span>
                  <span className="pending-name">{s.name}</span>
                </div>
              ))}
              {pendingRental.map(r => (
                <div key={r.id} className="pending-item pending-rental">
                  <span className="pending-type">{r.space_type}</span>
                  <span className="pending-name">{r.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Date navigation */}
      <div className="date-nav">
        <button className="btn btn-secondary btn-nav" onClick={() => setSelectedDate(d => addDays(d, -1))}>◀ 이전날</button>
        <div className="date-nav-center">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="input date-nav-input"
          />
          <button className="btn btn-secondary btn-nav" onClick={() => setSelectedDate(getTodayKST())}>오늘</button>
        </div>
        <button className="btn btn-secondary btn-nav" onClick={() => setSelectedDate(d => addDays(d, 1))}>다음날 ▶</button>
      </div>
      <p className="selected-date-label">{formatDateKorean(selectedDate)} 일정</p>

      {/* Timetable */}
      <div className="tt-wrapper">
        <table className="timetable">
          <thead>
            <tr>
              <th className="tt-time-head">시간</th>
              <th className="tt-col-head shoot-head">촬영</th>
              <th className="tt-col-head horiz-head">호리존</th>
              <th className="tt-col-head concept-head">컨셉룸</th>
            </tr>
          </thead>
          <tbody>
            {renderTimetable()}
          </tbody>
        </table>
      </div>
    </div>
  )
}
