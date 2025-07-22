import React from 'react';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="app-header" role="banner">
      <div className="header-left">
        <div className="sidebar-logo">
          <img src="/img/alfa.svg" alt="Логотип Альфа-Бизнес" className='brand-logo' />
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
  );
};

export default Header;