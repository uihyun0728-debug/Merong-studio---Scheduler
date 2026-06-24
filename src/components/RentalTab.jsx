import { useState } from 'react'
import { formatDateKorean, formatTime } from '../utils/dateUtils.js'
import { checkRentalConflicts } from '../utils/conflictCheck.js'
import { ConflictModal, DeleteModal } from './Modals.jsx'

const SPACE_TYPES = ['호리존', '컨셉룸', '전체대관']

const EMPTY_FORM = {
  space_type: '호리존',
  schedule_date: '',
  start_time: '',
  end_time: '',
  is_pending: false,
  name: '',
  phone: '',
  note: '',
}

export function RentalTab({ shooting, rental, addRental, updateRental, deleteRental }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [conflictData, setConflictData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [pendingSubmit, setPendingSubmit] = useState(null)
  const [error, setError] = useState('')

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setError('')
  }

  const openAdd = () => {
    resetForm()
    setShowForm(true)
  }

  const openEdit = (r) => {
    setForm({
      space_type: r.space_type || '호리존',
      schedule_date: r.schedule_date || '',
      start_time: r.start_time || '',
      end_time: r.end_time || '',
      is_pending: r.is_pending || false,
      name: r.name || '',
      phone: r.phone || '',
      note: r.note || '',
    })
    setEditId(r.id)
    setShowForm(true)
    setError('')
  }

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const setPending = (val) => {
    setForm(f => ({ ...f, is_pending: val, schedule_date: val ? '' : f.schedule_date, start_time: val ? '' : f.start_time, end_time: val ? '' : f.end_time }))
  }

  const validate = () => {
    if (!form.name.trim()) return '이름을 입력하세요.'
    if (!form.is_pending) {
      if (!form.schedule_date) return '날짜를 선택하세요.'
      if (!form.start_time) return '시작 시간을 입력하세요.'
      if (!form.end_time) return '종료 시간을 입력하세요.'
      if (form.start_time >= form.end_time) return '종료 시간은 시작 시간보다 늦어야 합니다.'
    }
    return null
  }

  const handleSubmit = () => {
    const err = validate()
    if (err) { setError(err); return }

    const conflicts = checkRentalConflicts(form, shooting, rental, editId)
    if (conflicts.length > 0) {
      setConflictData(conflicts)
      setPendingSubmit(() => () => doSave())
      return
    }
    doSave()
  }

  const doSave = async () => {
    setConflictData(null)
    try {
      const payload = {
        space_type: form.space_type,
        schedule_date: form.is_pending ? null : form.schedule_date,
        start_time: form.is_pending ? null : form.start_time,
        end_time: form.is_pending ? null : form.end_time,
        is_pending: form.is_pending,
        name: form.name.trim(),
        phone: form.phone.trim(),
        note: form.note.trim(),
      }
      if (editId) {
        await updateRental(editId, payload)
      } else {
        await addRental(payload)
      }
      setShowForm(false)
      resetForm()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteRental(deleteId)
      setDeleteId(null)
    } catch (e) {
      setError(e.message)
    }
  }

  const spaceLabel = (type) => {
    if (type === '호리존') return '호리존'
    if (type === '컨셉룸') return '컨셉룸'
    return '전체대관'
  }

  const spaceBadgeClass = (type) => {
    if (type === '호리존') return 'badge-horiz'
    if (type === '컨셉룸') return 'badge-concept'
    return 'badge-all'
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2 className="tab-title">대관 일정</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ 일정 추가</button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3 className="form-title">{editId ? '일정 수정' : '새 대관 일정'}</h3>

          <div className="form-group">
            <label>공간</label>
            <div className="space-type-row">
              {SPACE_TYPES.map(t => (
                <button
                  key={t}
                  className={`space-type-btn ${form.space_type === t ? 'active' : ''}`}
                  onClick={() => handleChange('space_type', t)}
                >{t}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>날짜</label>
            <div className="date-row">
              <input
                type="date"
                value={form.schedule_date}
                disabled={form.is_pending}
                onChange={e => handleChange('schedule_date', e.target.value)}
                className="input"
              />
              <button
                className={`btn-pending ${form.is_pending ? 'active' : ''}`}
                onClick={() => setPending(!form.is_pending)}
              >미정</button>
            </div>
          </div>

          {!form.is_pending && (
            <div className="form-group">
              <label>시간</label>
              <div className="time-row">
                <input type="time" value={form.start_time} onChange={e => handleChange('start_time', e.target.value)} className="input" />
                <span className="time-sep">~</span>
                <input type="time" value={form.end_time} onChange={e => handleChange('end_time', e.target.value)} className="input" />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>이름</label>
            <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} className="input" placeholder="이름" />
          </div>

          <div className="form-group">
            <label>연락처</label>
            <input type="text" value={form.phone} onChange={e => handleChange('phone', e.target.value)} className="input" placeholder="연락처" />
          </div>

          <div className="form-group">
            <label>특이사항</label>
            <textarea value={form.note} onChange={e => handleChange('note', e.target.value)} className="input textarea" placeholder="특이사항 (선택)" />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSubmit}>저장</button>
            <button className="btn btn-secondary" onClick={() => { setShowForm(false); resetForm() }}>취소</button>
          </div>
        </div>
      )}

      <div className="schedule-list">
        {rental.length === 0 && <p className="empty-msg">등록된 대관 일정이 없습니다.</p>}
        {rental.map(r => (
          <div key={r.id} className={`schedule-card ${r.is_pending ? 'pending' : ''}`}>
            <div className="schedule-card-main">
              <div className="schedule-badge-row">
                <span className={`badge ${spaceBadgeClass(r.space_type)}`}>{spaceLabel(r.space_type)}</span>
                {r.is_pending
                  ? <span className="badge badge-pending">미정</span>
                  : <span className="badge badge-date">{formatDateKorean(r.schedule_date)} {formatTime(r.start_time)} ~ {formatTime(r.end_time)}</span>
                }
              </div>
              <div className="schedule-name">{r.name}</div>
              {r.phone && <div className="schedule-detail">📞 {r.phone}</div>}
              {r.note && <div className="schedule-note">{r.note}</div>}
            </div>
            <div className="schedule-card-actions">
              <button className="btn-icon" onClick={() => openEdit(r)}>✏️</button>
              <button className="btn-icon btn-icon-del" onClick={() => setDeleteId(r.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {conflictData && (
        <ConflictModal
          conflicts={conflictData}
          onSave={() => { pendingSubmit && pendingSubmit(); setPendingSubmit(null) }}
          onCancel={() => { setConflictData(null); setPendingSubmit(null) }}
        />
      )}
      {deleteId && (
        <DeleteModal onDelete={handleDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  )
}
