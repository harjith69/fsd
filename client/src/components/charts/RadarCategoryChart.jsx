import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export const RadarCategoryChart = ({ categories }) => {
  if (!categories) return null;

  const data = [
    { subject: 'Teaching', score: categories.teaching?.score || 0, fullMark: 100 },
    { subject: 'Publications', score: categories.publications?.score || 0, fullMark: 100 },
    { subject: 'FDP / Training', score: categories.fdp?.score || 0, fullMark: 100 },
    { subject: 'Consultancy', score: categories.consultancy?.score || 0, fullMark: 100 },
    { subject: 'Patents / IP', score: categories.patents?.score || 0, fullMark: 100 },
    { subject: 'Feedback', score: categories.feedback?.score || 0, fullMark: 100 },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#ECEEF7" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#4A5170', fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#8A91AD', fontSize: 10 }}
          />
          <Radar
            name="Score %"
            dataKey="score"
            stroke="#5B6CFF"
            fill="#5B6CFF"
            fillOpacity={0.25}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Normalized Score']}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #ECEEF7',
              boxShadow: '0 8px 30px rgba(91,108,255,0.08)',
              fontSize: '12px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
