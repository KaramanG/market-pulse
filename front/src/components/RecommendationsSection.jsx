import '../styles/RecommendationsSection.css';

const AdvisorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

const formatCurrency = (value) => {
    return value.toLocaleString('ru-RU', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }) + ' ₽';
};

function RecommendationsSection({ gapInfo }) {
    if (!gapInfo || !gapInfo.minValue) {
        return null;
    }

    // Входные данные
    const cashGap = Math.abs(gapInfo.minValue); // Размер кассового разрыва (КР)
    const MARGIN = 0.20;                        // Маржинальность бизнеса клиента (20%)
    const CREDIT_RATE = 0.18;                   // Годовая ставка по кредиту Альфа-Банка (18%)
    const SUPPLIER_DISCOUNT = 0.05;             // Скидка от поставщика за оплату в срок (5%)
    
    // Моделируем данные по депозиту клиента
    const DEPOSIT_INFO = {
        amount: 150000,
        rate: 0.12,                             // Годовая ставка по депозиту (12%)
        remainingDays: 180,                     // Сколько дней осталось до конца вклада
        earlyWithdrawalRate: 0.0001           // Ставка до востребования (0.01%)
    };

    // Расчеты потерь для каждого сценария
    const lossFromWorkingCapital = cashGap * MARGIN;
    const lossFromCredit = cashGap * CREDIT_RATE;
    const expectedInterestOnGapAmount = cashGap * DEPOSIT_INFO.rate * (DEPOSIT_INFO.remainingDays / 365);
    const earlyWithdrawalInterestOnGapAmount = cashGap * DEPOSIT_INFO.earlyWithdrawalRate * (DEPOSIT_INFO.remainingDays / 365);
    const lossFromDeposit = expectedInterestOnGapAmount - earlyWithdrawalInterestOnGapAmount;
    const lossFromDelay = cashGap * SUPPLIER_DISCOUNT;
    const savingsFromCreditHoliday = (cashGap * CREDIT_RATE) / 12;

    // Формирование и сортировка сценариев
    const scenarios = [
        { name: 'Отсрочка по кредиту', loss: 0, note: `Экономия до ${savingsFromCreditHoliday.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽/мес (при ставке ${CREDIT_RATE * 100}%). Требует одобрения.` },
        { name: 'Отсрочка поставщику', loss: lossFromDelay, note: `При потере скидки за срочность в ${SUPPLIER_DISCOUNT * 100}%.` },
        { name: 'Снятие со вклада', loss: lossFromDeposit, note: `Потеря процентов по ставке ${DEPOSIT_INFO.rate * 100}% годовых.` },
        { name: 'Кредит Альфа-Банка', loss: lossFromCredit, note: `Годовая стоимость при ставке ${CREDIT_RATE * 100}%.` },
        { name: 'Изъятие оборотных средств', loss: lossFromWorkingCapital, note: `Упущенная выгода при маржинальности ${MARGIN * 100}%.` },
    ].sort((a, b) => a.loss - b.loss);

    return (
        <section className="recommendations-container">
            <div className="recommendations-header">
                <AdvisorIcon />
                <h3>Рекомендации по управлению кассовым разрывом</h3>
            </div>
            <p className="recommendations-summary">
                Мы проанализировали ваш прогнозный кассовый разрыв в размере <strong>{cashGap.toLocaleString('ru-RU')} ₽</strong> и подготовили рейтинг оптимальных решений для его покрытия.
            </p>
            
            <table className="recommendations-table">
                <thead>
                    <tr>
                        <th>№</th>
                        <th className="solution-column">Решение</th>
                        <th>Потенциальные потери</th>
                    </tr>
                </thead>
                <tbody>
                    {scenarios.map((scenario, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td className="solution-column">
                                <strong>{scenario.name}</strong>
                                {scenario.note && <small>{scenario.note}</small>}
                            </td>
                            <td>{formatCurrency(scenario.loss)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <p className="recommendations-footer-note">
                Дополнительно советуем сформировать резервный фонд на 5% от объёма платежей.
            </p>
        </section>
    );
}

export default RecommendationsSection;