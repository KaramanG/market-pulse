import React from 'react';
import '../styles/CashGapNotification.css';

function CashGapNotification({ gapInfo }) {
  if (!gapInfo) {
    return (
      <div className="notification-box ok">
        <span className="notification-icon">✓</span>
        <div>
          <p>С балансом все в порядке</p>
          <small>На прогнозном периоде кассовых разрывов не обнаружено.</small>
        </div>
      </div>
    );
  }

  const startDate = new Date(gapInfo.startDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  const minValueFormatted = Math.round(gapInfo.minValue).toLocaleString('ru-RU');

  return (
    <div className="notification-box warning">
      <span className="notification-icon">⚠️</span>
      <div>
        <p>Высокая вероятность кассового разрыва</p>
        <small>
          С {startDate} прогнозируется отрицательный баланс. Минимальное значение может достигнуть {minValueFormatted} ₽.
        </small>
      </div>
    </div>
  );
}

export default CashGapNotification;