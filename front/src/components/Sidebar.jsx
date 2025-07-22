import React from 'react';
import { PlusCircle, Rocket, Radio, RefreshCw, FileInput, FileText, Percent, Landmark, Wallet, Archive, Contact } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { text: 'Новый платёж', icon: PlusCircle },
    { text: 'Лента операций', icon: Rocket },
    { text: 'Эквайринг и касса', icon: Radio },
    { text: 'Платежи в работе', icon: RefreshCw },
    { text: 'Импорт реестров', icon: FileInput },
    { text: 'Выписка', icon: FileText },
    { text: 'Кредитные продукты', icon: Percent },
    { text: 'Депозиты', icon: Landmark },
    { text: 'Заказ наличных', icon: Wallet },
    { text: 'Самоинкассации', icon: Archive },
  ];

  return (
    <aside className="sidebar" aria-label="Боковая панель">
      <ul className="sidebar-menu">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <li key={index}>
              <a href="#">
                <IconComponent className="sidebar-icon" size={22} strokeWidth={2} />
                <span>{item.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;