import './styles/index.css';
import MyChart from './MyChart';

function App() {
  return (
    <div className="app-container">
      <header className="app-header" role="banner">
        <div className="sidebar-logo">
          <img src="/img/alfa.svg" alt="Логотип Альфа-Бизнес" />
          <span className="brand-name">Альфа-Бизнес</span>
        </div>

        <div className="page-header">
          <div className="search-wrapper" role="search">
            <input
              className="search"
              type="search"
              placeholder="Поиск..."
              aria-label="Поиск по системе"
            />
          </div>
        </div>
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
              <button className="period-button" aria-haspopup="listbox" aria-expanded="false">
                Период: <span className="selected-value">День</span>
                <span className="arrow">▼</span>
              </button>
            </section>

            <section className="chart-section" aria-label="Финансовая аналитика">
              <h2 className="visually-hidden">График финансовых показателей</h2>
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
