import { useState } from 'react';
import axios from 'axios';
import '../styles/SchedulePaymentModal.css';

function SchedulePaymentModal({ isOpen, onClose }) {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setDate('');
    setAmount('');
    setPurpose('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!date || !amount || !purpose) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/planned-payments', {
        payment_date: date,
        amount: amount,
        purpose: purpose
      });
      alert('Успешно запланировано!');
      handleClose();
    } catch (err) {
      console.error("Ошибка при добавлении платежа:", err);
      setError('Не удалось добавить платеж. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">Запланировать платеж</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="date"
            className="modal-input"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Сумма"
            className="modal-input"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Назначение платежа"
            className="modal-input"
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            required
          />
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button
              type="button"
              className="modal-button modal-button-cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="modal-button modal-button-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SchedulePaymentModal;