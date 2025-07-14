import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Пн', value: 240 },
  { name: 'Вт', value: 221 },
  { name: 'Ср', value: 229 },
  { name: 'Чт', value: 200 },
  { name: 'Пт', value: 278 },
  { name: 'Сб', value: 189 },
  { name: 'Вс', value: 239 },
];

function MyChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
