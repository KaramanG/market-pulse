
import { useState, useEffect } from 'react';
import axios from 'axios';

const aggregateByDay = (transactions) => {
    const dailyData = {};
    transactions.forEach(item => {
        // Ключ для группировки - это дата в формате ГГГГ-ММ-ДД
        const dayKey = item.date.toISOString().split('T')[0];
        if (!dailyData[dayKey]) {
            dailyData[dayKey] = {
                name: new Date(item.date.getFullYear(), item.date.getMonth(), item.date.getDate()).toISOString(),
                value: 0
            };
        }
        dailyData[dayKey].value += item.value;
    });
    // Возвращаем массив объектов, отсортированный по дате
    return Object.values(dailyData).sort((a, b) => new Date(a.name) - new Date(b.name));
};

export function useChartData({ period, selectedMonth }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/api/account-history/1');
        const dailyBalances = Array.isArray(response.data) ? response.data : [];

        const formattedData = dailyBalances
          .filter(item => item && item.name && !isNaN(new Date(item.name).getTime()))
          .map(item => ({
            date: new Date(item.name),
            value: item.value
          }));

        let processedData = [];

        switch (period) {
          case 'year': {
            const monthlyData = {};
            formattedData.forEach(item => {
              const monthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;
              if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                  name: new Date(item.date.getFullYear(), item.date.getMonth(), 1).toISOString(),
                  value: 0
                };
              }
              monthlyData[monthKey].value += item.value;
            });
            processedData = Object.values(monthlyData).sort((a, b) => new Date(a.name) - new Date(b.name));
            break;
          }

          case 'month': {
            const filteredByMonth = formattedData.filter(item => {
                const itemMonthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;
                return itemMonthKey === selectedMonth;
            });
            processedData = aggregateByDay(filteredByMonth);
            break;
          }
          
          case 'week':
          default: {
            const today = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);
            
            const filteredByWeek = formattedData.filter(item => 
                item.date >= sevenDaysAgo && item.date <= today
            );
            processedData = aggregateByDay(filteredByWeek);
            break;
          }
        }
        
        setChartData(processedData);
      } catch (err) {
        console.error("КРИТИЧЕСКАЯ ОШИБКА В ХУКЕ:", err);
        setError("Не удалось загрузить данные для графика.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period, selectedMonth]);

  return { chartData, loading, error };
}