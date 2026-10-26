import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const YoYTrendLineChart = ({ data = [] }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5B6CFF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#5B6CFF" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F2FA" vertical={false} />
          <XAxis
            dataKey="yearLabel"
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
            formatter={(value) => [`${value} / 100`, 'Performance Index']}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #ECEEF7',
              boxShadow: '0 8px 30px rgba(91,108,255,0.08)',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="performanceIndex"
            stroke="#5B6CFF"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorIndex)"
            dot={{ r: 4, fill: '#5B6CFF', strokeWidth: 2, stroke: '#FFFFFF' }}
            activeDot={{ r: 6, fill: '#4A59E8' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
