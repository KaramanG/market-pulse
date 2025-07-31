import { useState } from 'react';
import './styles/index.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MyChart from './components/MyChart';
import ChartFilters from './components/ChartFilters';
import SchedulePaymentModal from './components/SchedulePaymentModal';
import FaqSection from './components/FaqSection';
import CashGapNotification from './components/CashGapNotification';
import RecommendationsSection from './components/RecommendationsSection';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Кассовые разрывы', 'Прогнозирование', 'События'];
  
  const [period, setPeriod] = useState('week');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dataVersion, setDataVersion] = useState(0);
  const [gapInfo, setGapInfo] = useState(null);

  const handleDataUpdate = () => {
    setDataVersion(currentVersion => currentVersion + 1);
  };

  return (
    <div className="app-container">
      <Header />

      <div className="content-area">
        <Sidebar />
        
        <main className="main-section">
          <div className="page-content">            
            
            <div className="page-header-container">
              <div className="view-switcher-section">
                <h2 className="view-title">Обзор</h2>
                <nav className="tabs-nav">
                  {tabs.map((tabName, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`tab-button ${activeTab === index ? 'active' : ''}`}
                      onClick={() => setActiveTab(index)}
                    >
                      {tabName}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="notification-wrapper">
                {period === 'week' && <CashGapNotification gapInfo={gapInfo} />}
              </div>
            </div>
            
            <ChartFilters 
              period={period}
              setPeriod={setPeriod}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              onScheduleClick={() => setIsModalOpen(true)}
            />
      
            <section className="chart-section">
              <div className="chart-box">
                <MyChart 
                  period={period} 
                  selectedMonth={selectedMonth} 
                  dataVersion={dataVersion}
                  onGapCheck={setGapInfo}
                />
              </div>
            </section>

            {/* Условный рендеринг блока рекомендаций */}
            {gapInfo && <RecommendationsSection gapInfo={gapInfo} />}

            <FaqSection />
          </div>
        </main>
      </div>

      <SchedulePaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPaymentAdded={handleDataUpdate}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;