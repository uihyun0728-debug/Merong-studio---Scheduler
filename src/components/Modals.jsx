export function ConflictModal({ conflicts, onSave, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon">⚠</div>
        <p className="modal-title">아래 일정과 시간이 겹칩니다.</p>
        <ul className="conflict-list">
          {conflicts.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
        <p className="modal-question">계속 저장하시겠습니까?</p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onSave}>저장</button>
          <button className="btn btn-secondary" onClick={onCancel}>취소</button>
        </div>
      </div>
    </div>
  )
}

export function DeleteModal({ onDelete, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <p className="modal-title">정말 삭제하시겠습니까?</p>
        <div className="modal-actions">
          <button className="btn btn-danger" onClick={onDelete}>삭제</button>
          <button className="btn btn-secondary" onClick={onCancel}>취소</button>
        </div>
      </div>
    </div>
  )
}
