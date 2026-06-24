import { useState } from 'react'
import { useSchedules } from './hooks/useSchedules.js'
import { ShootingTab } from './components/ShootingTab.jsx'
import { RentalTab } from './components/RentalTab.jsx'
import { OverviewTab } from './components/OverviewTab.jsx'

const TABS = ['촬영', '대관', '종합']

export default function App() {
  const [activeTab, setActiveTab] = useState('촬영')
  const {
    shooting, rental, loading, error, refresh,
    addShooting, updateShooting, deleteShooting,
    addRental, updateRental, deleteRental,
  } = useSchedules()

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <h1 className="app-logo">메롱스튜디오</h1>
          <p className="app-subtitle">스케줄 관리</p>
        </div>
      </header>

      <nav className="tab-nav">
        {TABS.map(t => (
          <button
            key={t}
            className={`tab-btn ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >{t}</button>
        ))}
      </nav>

      <main className="main-content">
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>불러오는 중...</p>
          </div>
        )}
        {error && (
          <div className="error-banner">
            <p>⚠ 데이터 로드 오류: {error}</p>
            <button className="btn btn-secondary" onClick={refresh}>다시 시도</button>
          </div>
        )}
        {!loading && !error && (
          <>
            {activeTab === '촬영' && (
              <ShootingTab
                shooting={shooting}
                rental={rental}
                addShooting={addShooting}
                updateShooting={updateShooting}
                deleteShooting={deleteShooting}
              />
            )}
            {activeTab === '대관' && (
              <RentalTab
                shooting={shooting}
                rental={rental}
                addRental={addRental}
                updateRental={updateRental}
                deleteRental={deleteRental}
              />
            )}
            {activeTab === '종합' && (
              <OverviewTab shooting={shooting} rental={rental} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
