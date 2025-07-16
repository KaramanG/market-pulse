import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';

// --- НАЧАЛО: Кастомный компонент для красивой всплывающей подсказки ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const date = new Date(label);
    const formattedDate = date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
    const formattedValue = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(value);

    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        padding: '10px 15px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}>
        <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>{formattedDate}</p>
        <p style={{
          margin: '4px 0 0',
          color: value >= 0 ? '#2e8b57' : '#d9534f', // Зеленый для плюса, красный для минуса
          fontSize: '16px',
          fontWeight: 'bold'
        }}>{formattedValue}</p>
      </div>
    );
  }
  return null;
};
// --- КОНЕЦ: Кастомный компонент для всплывающей подсказки ---


// Функции-форматтеры для осей
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
};

const formatValue = (value) => {
  if (value === 0) return '0';
  const thousands = value / 1000;
  return `${Math.round(thousands)} тыс.`;
};


function MyChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/account-history/1');
        setChartData(response.data);
      } catch (err) {
        console.error("Ошибка при получении данных:", err);
        setError("Не удалось загрузить данные для графика.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Вычисляем точку для смены цвета градиента
  const gradientOffset = useMemo(() => {
    if (!chartData || chartData.length === 0) return 0.5;
    const dataValues = chartData.map((i) => i.value);
    const maxValue = Math.max(...dataValues);
    const minValue = Math.min(...dataValues);
    if (maxValue === minValue) return maxValue >= 0 ? 1 : 0;
    if (minValue >= 0) return 1;
    return maxValue / (maxValue - minValue);
  }, [chartData]);


  if (loading) return <div>Загрузка графика...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <ResponsiveContainer width="100%" height={500}>
      <AreaChart 
        data={chartData} 
        margin={{ top: 20, right: 30, bottom: 50, left: 20 }}
      >
        <defs>
          <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset={gradientOffset} stopColor="#0078d7" stopOpacity={0.6}/>
            <stop offset={gradientOffset} stopColor="#d9534f" stopOpacity={0.6}/>
          </linearGradient>
        </defs>

        <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
        
        <XAxis 
          dataKey="name" 
          tickFormatter={formatDate} 
          tick={{ fontSize: 12, fill: '#666' }} 
          angle={-35} 
          textAnchor="end"
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        
        <YAxis 
          tickFormatter={formatValue} 
          tick={{ fontSize: 12, fill: '#666' }}
          axisLine={false}
          tickLine={false}
          dx={-5}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        <ReferenceLine y={0} stroke="#666" strokeWidth={1} strokeDasharray="3 3">
          <Label value="0" offset={10} position="insideTopLeft" fill="#666" fontSize={12} />
        </ReferenceLine>
        
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#005a9e"
          strokeWidth={2}
          fill="url(#splitColor)"
          // Добавляем стилизованные точки для каждого дня
          dot={{ r: 3, stroke: '#fff', strokeWidth: 1, fill: '#005a9e' }}
          // Точка при наведении остается больше для лучшей интерактивности
          activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default MyChart;