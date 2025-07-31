import React from 'react';
import '../styles/RecommendationsSection.css';

// Иконка для заголовка
const AdvisorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
        <path d="M12 16v-4"></path>
        <path d="M12 8h.01"></path>
    </svg>
);

const formatCurrency = (value) => {
    return value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 });
};

function RecommendationsSection({ gapInfo }) {
    if (!gapInfo || !gapInfo.minValue) {
        return null;
    }

    // Входные данные
    const cashGap = Math.abs(gapInfo.minValue); // Размер кассового разрыва
    const MARGIN = 0.20;                        // Маржинальность бизнеса клиента (20%)
    const CREDIT_RATE = 0.18;                   // Годовая ставка по кредиту Альфа-Банка (18%)
    const SUPPLIER_DISCOUNT = 0.05;             // Скидка от поставщика за оплату в срок (5%)
    
    // Моделируем данные по депозиту клиента
    const DEPOSIT_INFO = {
        amount: 150000,                         // ОБЩАЯ СУММА НА ВКЛАДЕ. Необходима для проверки возможности сценария.
        rate: 0.12,                             // Годовая ставка по депозиту (12%)
        remainingDays: 180,                     // Сколько дней осталось до конца вклада
        earlyWithdrawalRate: 0.0001           // Ставка до востребования (0.01%)
    };

    // УНИВЕРСАЛЬНЫЕ РАСЧЕТЫ ПО СЦЕНАРИЯМ

    const lossFromWorkingCapital = cashGap * MARGIN;
    const lossFromCredit = cashGap * CREDIT_RATE;

    // Расчет потерь по вкладу
    const expectedInterestOnGapAmount = cashGap * DEPOSIT_INFO.rate * (DEPOSIT_INFO.remainingDays / 365);
    const earlyWithdrawalInterestOnGapAmount = cashGap * DEPOSIT_INFO.earlyWithdrawalRate * (DEPOSIT_INFO.remainingDays / 365);
    const lossFromDeposit = expectedInterestOnGapAmount - earlyWithdrawalInterestOnGapAmount;
    
    // Проверяем, возможен ли вообще сценарий со вкладом
    const isDepositScenarioPossible = DEPOSIT_INFO.amount >= cashGap;

    const lossFromDelay = cashGap * SUPPLIER_DISCOUNT;
    const savingsFromCreditHoliday = (cashGap * CREDIT_RATE) / 12;

    // Собираем сценарии в массив
    let scenarios = [
        { name: 'Отсрочка по кредиту', loss: 0, note: `Экономия до ${formatCurrency(savingsFromCreditHoliday)}/мес. Требует одобрения.` },
        { name: 'Отсрочка поставщику', loss: lossFromDelay },
        // Условно добавляем сценарий с вкладом, только если он возможен
        isDepositScenarioPossible && { name: 'Снятие со вклада', loss: lossFromDeposit },
        { name: 'Кредит Альфа-Банка', loss: lossFromCredit },
        { name: 'Изъятие оборотных средств', loss: lossFromWorkingCapital },
    ].filter(Boolean) // Убираем возможные "пустые" значения из массива
     .sort((a, b) => a.loss - b.loss); // Сортируем по возрастанию потерь

    return (
        <section className="recommendations-container">
            <div className="recommendations-header">
                <AdvisorIcon />
                <h3>Рекомендации по управлению кассовым разрывом</h3>
            </div>
            <p className="recommendations-summary">
                Мы проанализировали ваш прогнозный кассовый разрыв в размере <strong>{formatCurrency(cashGap)}</strong> и подготовили рейтинг оптимальных решений для его покрытия.
            </p>
            
            <div className="recommendations-table-wrapper">
                <table className="recommendations-table">
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Решение</th>
                            <th>Потенциальные потери</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scenarios.map((scenario, index) => (
                            <tr key={index}>
                                <td className="rank-cell">{index + 1}</td>
                                <td>
                                    <strong>{scenario.name}</strong>
                                    {scenario.note && <small>{scenario.note}</small>}
                                </td>
                                <td className="loss-cell">{formatCurrency(scenario.loss)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="recommendations-footer">
                <button className="recommendations-cta">Обсудить с менеджером</button>
            </div>
        </section>
    );
}

export default RecommendationsSection;