import { useState, useEffect, useMemo } from 'react'; // Добавляем useMemo
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Меняем LineChart на AreaChart и Line на Area

// Функции-форматтеры остаются без изменений
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
};

const formatValue = (value) => {
  if (value === 0) return '0';
  const thousands = value / 1000;
  return `${thousands.toFixed(1).replace('.0', '')} тыс.`;
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

  // --- НОВЫЙ БЛОК: Вычисляем точку для смены цвета градиента ---
  // useMemo кэширует результат, чтобы не пересчитывать на каждый рендер
  const gradientOffset = useMemo(() => {
    if (chartData.length === 0) {
      return 0.5; // Значение по умолчанию, если данных нет
    }

    const dataValues = chartData.map((i) => i.value);
    const maxValue = Math.max(...dataValues);
    const minValue = Math.min(...dataValues);
    
    // Если все значения одинаковые, градиент не нужен
    if (maxValue === minValue) {
        return maxValue >= 0 ? 1 : 0;
    }
    
    // Если все значения положительные или нулевые, весь градиент синий
    if (minValue >= 0) {
        return 1;
    }
    
    // Рассчитываем, на какой доле высоты графика находится нулевая отметка
    return maxValue / (maxValue - minValue);
  }, [chartData]);


  if (loading) return <div>Загрузка графика...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <ResponsiveContainer width="90%" height={500}>
      {/* Используем AreaChart вместо LineChart */}
      <AreaChart 
        data={chartData} 
        margin={{ top: 30, right: 20, bottom: 40, left: 20 }}
      >
        {/* --- НОВЫЙ БЛОК: Определяем наш градиент --- */}
        <defs>
          <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
            {/* 
              Цвет для положительных значений. 
              offset - это точка, где цвет заканчивается. Мы ее рассчитали.
            */}
            <stop offset={gradientOffset} stopColor="#0078d7" stopOpacity={0.8}/>
            {/* 
              Цвет для отрицательных значений.
              Начинается в той же точке и идет до конца.
              Можно использовать красный цвет для наглядности: stopColor="#ff4d4f"
            */}
            <stop offset={gradientOffset} stopColor="#0078d7" stopOpacity={0.8}/>
          </linearGradient>
        </defs>

        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        
        <XAxis 
          dataKey="name" 
          tickFormatter={formatDate} 
          tick={{ fontSize: 12, angle: -30, textAnchor: 'end' }} 
        />
        
        <YAxis tickFormatter={formatValue} />
        
        <Tooltip 
          formatter={(value) => [formatValue(value), 'Баланс']}
          labelFormatter={formatDate}
        />
        
        {/* --- Используем Area вместо Line --- */}
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#0078d7"   // Цвет самой линии
          strokeWidth={2}
          fill="url(#splitColor)" // Применяем наш градиент в качестве заливки
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default MyChart;