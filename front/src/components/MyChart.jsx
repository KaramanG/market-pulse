import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const pointData = payload.find(p => p.name.includes('value_'))?.payload;
    if (!pointData) return null;

    return (
      <div style={{ background: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{new Date(label).toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'})}</p>
        <p style={{ margin: '5px 0 0', color: pointData.value >= 0 ? 'green' : '#d9534f', fontWeight: 'bold' }}>
          {`${pointData.value.toLocaleString('ru-RU')} ₽`}
        </p>
        <small style={{ color: '#555' }}>{pointData.type === 'forecast' ? 'Прогнозный баланс' : 'Фактический баланс'}</small>
      </div>
    );
  }
  return null;
};

const formatXAxis = (tickItem, period) => {
    const date = new Date(tickItem);
    if (period === 'year') {
        return date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
    }
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};


function MyChart({ period, selectedMonth, dataVersion }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const accountNumber = 1;
        const params = new URLSearchParams();
        params.append('period', period);
        if (period === 'month' && selectedMonth) {
          params.append('month', selectedMonth);
        }
        const response = await axios.get(`http://localhost:5000/api/account-history/${accountNumber}`, { params });
        
        const { actual, forecast } = response.data;
        
        const todayBoundary = new Date();
        todayBoundary.setHours(0, 0, 0, 0);

        const allPoints = [...actual, ...forecast].sort((a, b) => new Date(a.date) - new Date(b.date));

        let processedData = allPoints.map(p => ({
          ...p,
          date: new Date(p.date), 
          type: new Date(p.date) < todayBoundary ? 'actual' : 'forecast'
        }));
        
        const lastActualIndex = processedData.findLastIndex(p => p.type === 'actual');

        if (lastActualIndex !== -1 && lastActualIndex < processedData.length - 1) {
          const lastActualPoint = processedData[lastActualIndex];
          
          const bridgePoint = {
            date: todayBoundary,
            value: lastActualPoint.value,
            type: 'forecast',
            isBridge: true
          };

          processedData.splice(lastActualIndex + 1, 0, bridgePoint);
        }
        
        const finalData = processedData.map(p => ({
            ...p,
            value_actual: (p.type === 'actual' || p.isBridge) ? p.value : null,
            value_forecast: (p.type === 'forecast' || p.isBridge) ? p.value : null,
        }));

        setChartData(finalData);

      } catch (err) {
        setError("Не удалось загрузить данные для графика.");
        console.error("Ошибка при загрузке данных для графика:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period, selectedMonth, dataVersion]);

  const yAxisTicks = useMemo(() => {
    if (chartData.length === 0) return [];
    const yValues = chartData.map(p => p.value).filter(v => v !== null && v !== undefined);
    if (yValues.length === 0) return [0];
    const yMax = Math.max(...yValues);
    const yMin = Math.min(...yValues);
    const top = Math.ceil(yMax / 10000) * 10000;
    const bottom = Math.floor(yMin / 10000) * 10000;
    const ticks = [];
    const range = Math.max(Math.abs(top), Math.abs(bottom));
    const step = Math.ceil((range / 4) / 10000) * 10000;
    if (step === 0) return [0];
    for (let i = 0; i <= top + step; i += step) {
      if (i <= top * 1.1) ticks.push(i);
    }
    for (let i = -step; i >= bottom - step; i -= step) {
      if (i >= bottom * 1.1) ticks.push(i);
    }
    return [...new Set(ticks)].sort((a, b) => a - b);
  }, [chartData]);


  if (loading) return <div>Загрузка графика...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (chartData.length === 0) return <div style={{ textAlign: 'center', padding: '50px' }}>Нет данных для отображения.</div>;
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <defs>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0078d7" stopOpacity={0.7}/>
            <stop offset="95%" stopColor="#0078d7" stopOpacity={0.1}/>
          </linearGradient>
          <pattern id="pattern-stripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="8" transform="translate(0,0)" fill="#0078d7" fillOpacity="0.4"></rect>
          </pattern>
        </defs>

        <XAxis 
          dataKey="date" 
          tickFormatter={(tick) => formatXAxis(tick, period)}
          angle={-30} textAnchor="end" height={60} dy={10}
        />
        <YAxis 
            tickFormatter={(value) => `${Math.round(value / 1000)} тыс.`} 
            ticks={yAxisTicks}
            domain={[yAxisTicks[0], yAxisTicks[yAxisTicks.length - 1]]}
        />
        
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#666" strokeWidth={1}/>
        
        <Area type="monotone" dataKey="value_actual" name="value_actual" fill="url(#colorActual)" stroke="none" baseValue={0} />
        
        <Area type="monotone" dataKey="value_forecast" name="value_forecast" fill="url(#pattern-stripe)" stroke="none" baseValue={0} />

        <Line 
            type="monotone" 
            dataKey="value_actual"
            name="value_actual"
            stroke="#005a9e" 
            strokeWidth={2} 
            activeDot={{ r: 6 }}
        />
        <Line 
            type="monotone"
            dataKey="value_forecast"
            name="value_forecast"
            stroke="#005a9e" 
            strokeWidth={2} 
            dot={{ r: 3, fill: '#fff', stroke: '#005a9e', strokeWidth: 1 }} 
            activeDot={{ r: 6, strokeWidth: 1 }} 
        />

      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default MyChart;