import React from 'react';
import '../styles/Sidebar.css'

const Sidebar = () => {
  return (
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
  );
};

export default Sidebar;