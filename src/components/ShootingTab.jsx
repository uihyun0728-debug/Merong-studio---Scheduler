import { useState } from 'react'
import { getTodayKST, formatDateKorean, formatTime } from '../utils/dateUtils.js'
import { checkShootingConflicts } from '../utils/conflictCheck.js'
import { ConflictModal, DeleteModal } from './Modals.jsx'

const EMPTY_FORM = {
  schedule_date: '',
  start_time: '',
  end_time: '',
  is_pending: false,
  name: '',
  phone: '',
  draft_done: false,
  retouch_done: false,
  note: '',
}

export function ShootingTab({ shooting, rental, addShooting, updateShooting, deleteShooting }) {
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

  const openEdit = (s) => {
    setForm({
      schedule_date: s.schedule_date || '',
      start_time: s.start_time || '',
      end_time: s.end_time || '',
      is_pending: s.is_pending || false,
      name: s.name || '',
      phone: s.phone || '',
      draft_done: s.draft_done || false,
      retouch_done: s.retouch_done || false,
      note: s.note || '',
    })
    setEditId(s.id)
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

    const conflicts = checkShootingConflicts(form, shooting, rental, editId)
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
        schedule_date: form.is_pending ? null : form.schedule_date,
        start_time: form.is_pending ? null : form.start_time,
        end_time: form.is_pending ? null : form.end_time,
        is_pending: form.is_pending,
        name: form.name.trim(),
        phone: form.phone.trim(),
        draft_done: form.draft_done,
        retouch_done: form.retouch_done,
        note: form.note.trim(),
      }
      if (editId) {
        await updateShooting(editId, payload)
      } else {
        await addShooting(payload)
      }
      setShowForm(false)
      resetForm()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteShooting(deleteId)
      setDeleteId(null)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2 className="tab-title">촬영 일정</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ 일정 추가</button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3 className="form-title">{editId ? '일정 수정' : '새 촬영 일정'}</h3>

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

          <div className="form-row-checks">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.draft_done} onChange={e => handleChange('draft_done', e.target.checked)} />
              시안 작성
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.retouch_done} onChange={e => handleChange('retouch_done', e.target.checked)} />
              보정 여부
            </label>
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
        {shooting.length === 0 && <p className="empty-msg">등록된 촬영 일정이 없습니다.</p>}
        {shooting.map(s => (
          <div key={s.id} className={`schedule-card ${s.is_pending ? 'pending' : ''}`}>
            <div className="schedule-card-main">
              <div className="schedule-badge-row">
                {s.is_pending
                  ? <span className="badge badge-pending">미정</span>
                  : <span className="badge badge-date">{formatDateKorean(s.schedule_date)} {formatTime(s.start_time)} ~ {formatTime(s.end_time)}</span>
                }
              </div>
              <div className="schedule-name">{s.name}</div>
              {s.phone && <div className="schedule-detail">📞 {s.phone}</div>}
              <div className="schedule-checks">
                <span className={`check-tag ${s.draft_done ? 'on' : 'off'}`}>시안 {s.draft_done ? '✓' : '✗'}</span>
                <span className={`check-tag ${s.retouch_done ? 'on' : 'off'}`}>보정 {s.retouch_done ? '✓' : '✗'}</span>
              </div>
              {s.note && <div className="schedule-note">{s.note}</div>}
            </div>
            <div className="schedule-card-actions">
              <button className="btn-icon" onClick={() => openEdit(s)}>✏️</button>
              <button className="btn-icon btn-icon-del" onClick={() => setDeleteId(s.id)}>🗑️</button>
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
