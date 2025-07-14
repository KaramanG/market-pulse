// src/MyChart.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function MyChart() {
  // Состояние для хранения данных, полученных с сервера
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect для выполнения запроса при монтировании компонента
  useEffect(() => {
    // Асинхронная функция для получения данных
    const fetchData = async () => {
      try {
        // Делаем GET-запрос к нашему API
        const response = await axios.get('http://localhost:5000/api/chart-data');
        setChartData(response.data); // Сохраняем данные в состояние
      } catch (err) {
        console.error("Ошибка при получении данных:", err);
        setError("Не удалось загрузить данные для графика.");
      } finally {
        setLoading(false); // Завершаем загрузку в любом случае
      }
    };

    fetchData();
  }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз

  // Показываем сообщение о загрузке
  if (loading) {
    return <div>Загрузка графика...</div>;
  }
  
  // Показываем сообщение об ошибке
  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  // Если данные загружены, рендерим график
  return (
    <ResponsiveContainer width="90%" height={300}>
      <LineChart data={chartData}> {/* Используем данные из состояния */}
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#0078d7" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default MyChart;