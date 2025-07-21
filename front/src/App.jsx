import { useState } from 'react';
import './styles/index.css';
import MyChart from './components/MyChart';
import ChartFilters from './components/ChartFilters';
import SchedulePaymentModal from './components/SchedulePaymentModal';

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
      <header className="app-header" role="banner">
        <div className="header-left">
          <div className="sidebar-logo">
            <img src="/img/alfa.svg" alt="Логотип Альфа-Бизнес" />
            <span className="brand-name">Альфа-Бизнес</span>
          </div>
        </div>
        <div className="header-center">
          <div className="search-wrapper" role="search">
            <input
              className="search"
              type="search"
              placeholder="Поиск..."
              aria-label="Поиск по системе"
            />
          </div>
        </div>
        <div className="header-right"></div>
      </header>

      <div className="content-area">
        <aside className="sidebar" aria-label="Боковая панель">
          <ul className="sidebar-menu">
            <li><a href="#">Новый платёж</a></li>
            <li><a href="#">Лента операций</a></li>
            <li><a href="#">Эквайринг и касса</a></li>
            <li><a href="#">Платежи в работе</a></li>
            <li><a href="#">Импорт реестров</a></li>
            <li><a href="#">Выписка</a></li>
            <li><a href="#">Кредитные продукты</a></li>
            <li><a href="#">Депозиты</a></li>
            <li><a href="#">Заказ наличных</a></li>
            <li><a href="#">Самоинкассации</a></li>
            <li><a href="#">Контрагенты</a></li>
          </ul>
        </aside>
        
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
          </div>
        </main>
      </div>

      <SchedulePaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default App;