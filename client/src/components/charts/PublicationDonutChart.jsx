import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const PublicationDonutChart = ({ data = [] }) => {
  const COLORS = ['#5B6CFF', '#2EC4A6', '#FFB88C', '#6EC1FF'];

  const filteredData = data.filter((d) => d.value > 0);
  const total = filteredData.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-[#8A91AD]">
        No publications recorded for this year.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full h-56 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} works`, name]}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF7',
                boxShadow: '0 8px 30px rgba(91,108,255,0.08)',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Centered label inside donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-[#1B2140]">{total}</span>
          <span className="text-[11px] text-[#8A91AD] font-medium">Total</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-2 mt-2 w-full px-4">
        {filteredData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-[#4A5170] truncate">{item.name}:</span>
            <span className="text-xs font-semibold text-[#1B2140] ml-auto">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
