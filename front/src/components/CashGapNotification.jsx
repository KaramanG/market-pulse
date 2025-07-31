import React, { useState } from 'react';
import '../styles/CashGapNotification.css';

const WarningIcon = () => (
    <svg className="notification-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path d="M955.7 856.3L546.5 135.5c-14.7-25.5-49.2-25.5-63.9 0L76.3 856.3c-14.7 25.5 4.1 58.9 32 58.9h815.5c27.9 0 46.6-33.4 31.9-58.9zM487 398.8c0-13.2 10.8-24 24-24s24 10.8 24 24v184c0 13.2-10.8 24-24 24s-24-10.8-24-24V398.8z m24 328.4c-20.6 0-37.4-16.8-37.4-37.4s16.8-37.4 37.4-37.4 37.4 16.8 37.4 37.4-16.8 37.4-37.4 37.4z"></path>
    </svg>
);

const SuccessIcon = () => (
    <svg className="notification-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0z m243.4 365.2L470.9 650.8c-10.2 10.2-26.7 10.2-36.9 0L292.5 509.3c-10.2-10.2-10.2-26.7 0-36.9 10.2-10.2 26.7-10.2 36.9 0l123.1 123.1 247.6-247.6c10.2-10.2 26.7-10.2 36.9 0 10.2 10.2 10.2 26.7 0 36.9z"></path>
    </svg>
);

function getPaymentPhrase(number) {
    if (typeof number !== 'number') return 'нагрузочных платежей';
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'нагрузочных платежей';
    }
    if (lastDigit === 1) {
        return 'нагрузочный платеж'; 
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'нагрузочных платежа';
    }
    return 'нагрузочных платежей';
}

function CashGapNotification({ gapInfo }) {
  const [detailsVisible, setDetailsVisible] = useState(false);

  const toggleDetails = (e) => {
    e.preventDefault();
    setDetailsVisible(!detailsVisible);
  };

  if (!gapInfo) {
    return (
      <div className="notification-box ok">
        <div className="notification-main">
            <SuccessIcon />
            <div className="notification-text">
                <p>С балансом все в порядке</p>
                <small>На прогнозном периоде кассовых разрывов не обнаружено.</small>
            </div>
        </div>
      </div>
    );
  }

  const payments = Array.isArray(gapInfo.payments) ? gapInfo.payments : [];
  const paymentCount = payments.length;

  const options = { day: 'numeric', month: 'long' };
  const startDate = new Date(gapInfo.startDate).toLocaleDateString('ru-RU', { day: 'numeric' });
  const endDate = new Date(gapInfo.endDate).toLocaleDateString('ru-RU', options);
  
  const endDateFormatted = endDate.replace(` ${new Date().getFullYear()} г.`, '');
  
  const dateText = `На период с ${startDate} по ${endDateFormatted} приходится ${paymentCount} ${getPaymentPhrase(paymentCount)}`;

  return (
    <div className="notification-box warning">
      <div className="notification-main">
        <WarningIcon />
        <div className="notification-text">
          <p>Высокая вероятность кассового разрыва</p>
          <small>{dateText}</small>
          {payments.length > 0 && (
            <a href="#" className="details-link" onClick={toggleDetails}>
              {detailsVisible ? 'Скрыть' : 'Подробнее'}
            </a>
          )}
        </div>
      </div>
      
      {detailsVisible && payments.length > 0 && (
        <div className="payment-details">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Назначение</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index}>
                  <td>{new Date(payment.date).toLocaleDateString('ru-RU')}</td>
                  <td>{payment.description}</td>
                  <td>{payment.amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CashGapNotification;