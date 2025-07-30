import React from 'react';
import { Search, Mail, Bell, Settings, LogOut } from 'lucide-react';
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
          <Search size={24} className="search-icon" />
          <input
            className="search"
            type="search"
            placeholder="Поиск"
            aria-label="Поиск по системе"
          />
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <button className="action-button">
            <Mail size={24} strokeWidth={2} />
          </button>
          
          <button className="action-button">
            <Bell size={24} strokeWidth={2} />
          </button>

          <div className="user-profile">
            <div className="user-avatar">
              <span>НВ</span>
            </div>
            <div className="user-info">
              <span className="user-name">ИП ЩИПЛЕЦОВА НАТАЛИЯ ВАЛЕНТИНОВНА</span>
              <span className="user-role">Щиплецова Н.В.</span>
            </div>
          </div>
          
          <button className="action-button">
            <Settings size={24} strokeWidth={2} />
          </button>
          
          <button className="action-button">
            <LogOut size={24} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;