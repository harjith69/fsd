import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const DepartmentComparisonBarChart = ({ data = [] }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F2FA" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#8A91AD', fontSize: 11 }}
            axisLine={{ stroke: '#ECEEF7' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#8A91AD', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`${value} / 100`, 'Avg Performance Index']}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #ECEEF7',
              boxShadow: '0 8px 30px rgba(91,108,255,0.08)',
              fontSize: '12px',
            }}
          />
          <Bar
            dataKey="averageIndex"
            fill="#5B6CFF"
            radius={[8, 8, 0, 0]}
            maxBarSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
