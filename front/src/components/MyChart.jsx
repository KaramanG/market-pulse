import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const pointData = payload.find(p => p.payload.value !== null && p.payload.value !== undefined)?.payload;
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

function MyChart({ period, selectedMonth, dataVersion, onGapCheck }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const analyzeAndReportGap = (data) => {
        if (!onGapCheck) return;

        const forecastGapPoints = data.filter(p => p.type === 'forecast' && p.value < 0);

        if (forecastGapPoints.length === 0) {
            onGapCheck(null);
            return;
        }

        const startDate = forecastGapPoints[0].date;
        const endDate = forecastGapPoints[forecastGapPoints.length - 1].date;
        
        const paymentsForDetails = forecastGapPoints.map(point => ({
            date: point.date,
            description: point.purpose || 'Прогнозный платеж',
            amount: point.transactionAmount || point.value
        }));

        onGapCheck({
            startDate: startDate,
            endDate: endDate,
            payments: paymentsForDetails
        });
    };
    
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

        let allPoints = [...actual];
        if (period === 'week') { allPoints.push(...forecast); }
        allPoints.sort((a, b) => new Date(a.date) - new Date(b.date));

        let processedData = allPoints.map(p => ({
          ...p,
          date: new Date(p.date), 
          type: new Date(p.date) < todayBoundary ? 'actual' : 'forecast'
        }));
        
        if (period === 'week') {
            const lastActualIndex = processedData.findLastIndex(p => p.type === 'actual');
            if (lastActualIndex !== -1 && lastActualIndex < processedData.length - 1) {
              const lastActualPoint = processedData[lastActualIndex];
              const bridgePoint = { ...lastActualPoint, date: todayBoundary, type: 'forecast', isBridge: true };
              processedData.splice(lastActualIndex + 1, 0, bridgePoint);
            }
        }
        
        const finalData = processedData.map(p => ({
            ...p,
            value_actual: (p.type === 'actual' || p.isBridge) ? p.value : null,
            value_forecast: (p.type === 'forecast' || p.isBridge) ? p.value : null,
        }));

        setChartData(finalData);
        analyzeAndReportGap(processedData);

      } catch (err) {
        setError("Не удалось загрузить данные для графика.");
        console.error("Ошибка при загрузке данных для графика:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, selectedMonth, dataVersion, onGapCheck]);

  const yAxisTicks = useMemo(() => {
    if (chartData.length === 0) return [];
    const allValues = chartData.map(p => p.value).filter(v => v !== null && v !== undefined);
    if (allValues.length === 0) return [0];
    const yMax = Math.max(...allValues, 0);
    const yMin = Math.min(...allValues, 0);
    const top = Math.ceil(yMax / 30000) * 30000;
    const bottom = Math.floor(yMin / 30000) * 30000;
    const step = 30000;
    const ticks = [];
    for (let i = top; i >= bottom; i -= step) { ticks.push(i); }
    return ticks.length > 0 ? ticks : [0];
  }, [chartData]);


  if (loading) return <div>Загрузка графика...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (chartData.length === 0) return <div style={{ textAlign: 'center', padding: '50px' }}>Нет данных для отображения.</div>;
  
  const actualColor = "#0d47a1";
  const forecastColor = "#3F51B5";

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={actualColor} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={actualColor} stopOpacity={0.3}/>
          </linearGradient>
          <pattern id="pattern-forecast" width="12" height="8" patternUnits="userSpaceOnUse">
            <rect width="3" height="8" fill={forecastColor} fillOpacity="0.9"></rect>
          </pattern>
        </defs>
        <XAxis dataKey="date" tickFormatter={(tick) => formatXAxis(tick, period)} angle={-30} textAnchor="end" height={60} dy={10} />
        <YAxis tickFormatter={(value) => `${Math.round(value / 1000)} тыс.`} ticks={yAxisTicks} domain={[yAxisTicks[yAxisTicks.length - 1], yAxisTicks[0]]} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#666" strokeWidth={1}/>
        <Area type="monotone" dataKey="value_actual" name="value_actual" fill="url(#colorActual)" stroke="none" baseValue={0} />
        {period === 'week' && (
            <>
                <Area type="monotone" dataKey="value_forecast" name="value_forecast" fill="url(#pattern-forecast)" stroke="none" baseValue={0} />
                <Line type="monotone" dataKey="value_forecast" name="value_forecast" stroke={forecastColor} strokeWidth={2} dot={{ r: 3, fill: '#fff', stroke: forecastColor, strokeWidth: 1 }} />
            </>
        )}
        <Line type="monotone" dataKey="value_actual" name="value_actual" stroke={actualColor} strokeWidth={2} dot={{r: 4}} activeDot={{ r: 6 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default MyChart;