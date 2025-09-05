import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export interface ChartDataPoint {
  label: string;
  value: number;
}

interface PowerBarChartProps {
  data: ChartDataPoint[];
  width?: number | string;
  height?: number;
  barColor?: string;
  yMax?: number;
  unit?: string;
}

//커스텀 툴팁
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    const { value } = payload[0];

    return (
      <div
        style={{
          background: 'white',
          border: '1px solid #ccc',
          padding: '8px',
          fontSize: '12px',
          lineHeight: '1.4',
        }}
      >
        <div><strong>사용량:</strong> {value} Wh</div>
        <div><strong>날짜:</strong> {label}</div>
      </div>
    );
  }
  return null;
};

const PowerBarChart: React.FC<PowerBarChartProps> = ({
  data,
  width = '100%',
  height = 200,
  barColor = '#0F7685',
  yMax = 400,
}) => {
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height={227}>
        <BarChart data={data} margin={{ top: 30 }}>
          <XAxis
            dataKey="label"
            tick={{
              fontSize: 11,      // 폰트 크기
              fill: '#909090',      // 폰트 색상
              fontWeight: 500,   // 두께
            }}
          />

          {/* Y축 오른쪽에 눈금 표시 */}
          <YAxis
            orientation="right"
            domain={[0, yMax]}
            tickCount={5}
            tick={{
              fontSize: 9,
              fill: '#909090',
              fontWeight: 500,
            }}
          />

          {/* 직접 단위 텍스트 추가 */}
          <text
            x="100%"              // 오른쪽 끝
            y={10}                // 맨 위 약간 아래
            textAnchor="end"      // 오른쪽 정렬
            fontSize="7"
            fill="#909090"
            fontWeight="500"
          >
            (Wh)
          </text>

          {/* 사용자 정의 툴팁 */}
          <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PowerBarChart;
