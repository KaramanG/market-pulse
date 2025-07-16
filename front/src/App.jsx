import { useState } from 'react';
import './styles/index.css';
import MyChart from './components/MyChart';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Кассовые разрывы', 'Прогнозирование', 'События'];

  return (
    <div className="app-container">
      <header className="app-header" role="banner">
        {/* ИЗМЕНЕНИЕ: Логотип обернут в контейнер для балансировки */}
        <div className="header-left">
          <div className="sidebar-logo">
            <img src="/img/alfa.svg" alt="Логотип Альфа-Бизнес" />
            <span className="brand-name">Альфа-Бизнес</span>
          </div>
        </div>

        {/* ИЗМЕНЕНИЕ: Поиск теперь находится в центральной части хедера */}
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
        
        {/* ИЗМЕНЕНИЕ: Пустой блок справа для идеального центрирования поиска */}
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
            <section className="filters" aria-label="Фильтры данных">
              <select className="filter-select">
                <option value="day">Период: день</option>
                <option value="week">Период: неделя</option>
                <option value="month">Период: месяц</option>
              </select>
              <select className="filter-select">
                <option value="scheduled">Запланированные счета</option>
                <option value="paid">Оплаченные счета</option>
              </select>
              <select className="filter-select">
                <option value="gaps">Даты разрывов</option>
                <option value="payments">Даты платежей</option>
              </select>
            </section>
            
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
            
            <section className="chart-section" aria-label="Финансовая аналитика">
              <div className="chart-box">
                <MyChart />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;