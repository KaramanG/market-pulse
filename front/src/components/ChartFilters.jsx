function ChartFilters({ period, setPeriod, selectedMonth, setSelectedMonth, onScheduleClick }) {
  return (
    <section className="filters" aria-label="Фильтры данных">
      <select 
        className="filter-select"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
      >
        <option value="week">Период: неделя</option>
        <option value="month">Период: месяц</option>
        <option value="year">Период: год</option>
      </select>
      {period === 'month' && (
        <input
          type="month"
          className="filter-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      )}
      <button type="button" className="filter-select" onClick={onScheduleClick}>
        Запланированные счета
      </button>
    </section>
  );
}

export default ChartFilters;