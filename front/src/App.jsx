import { useState } from 'react';
import './styles/index.css';
import MyChart from './components/MyChart';
import ChartFilters from './components/ChartFilters';
import SchedulePaymentModal from './components/SchedulePaymentModal';
import FaqSection from './components/FaqSection';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

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
  
  const [period, setPeriod] = useState('now');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="app-container">
      <Header />

      <div className="content-area">
        <Sidebar />
        
        <main className="main-section main-grid">
          <div className="page-content">            
            <section className="view-switcher-section" aria-label="Переключатель вида">
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
            </section>

            <ChartFilters 
              period={period}
              setPeriod={setPeriod}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              onScheduleClick={() => setIsModalOpen(true)}
            />
      
            <section className="chart-section" aria-label="Финансовая аналитика">
              <div className="chart-box">
                <MyChart period={period} selectedMonth={selectedMonth} />
              </div>
            </section>

            <FaqSection />
          </div>
        </main>
      </div>

      <SchedulePaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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