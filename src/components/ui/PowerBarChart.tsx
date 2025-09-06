import React, { useMemo } from 'react';
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
  yMax?: number;      // 없으면 자동 계산
  unit?: string;      // 기본 Wh
}

function calcNiceMax(vals: number[]) {
  const max = Math.max(0, ...(vals.length ? vals : [0]));
  if (max <= 100) return 100;
  const mag = Math.pow(10, Math.floor(Math.log10(max)));
  const step = mag / 2;
  return Math.ceil(max / step) * step;
}

const CustomTooltip = ({ active, payload, label, unit = 'Wh' }: any) => {
  if (active && payload && payload.length > 0) {
    const { value } = payload[0];
    return (
      <div style={{ background: 'white', border: '1px solid #ccc', padding: 8, fontSize: 12, lineHeight: 1.4 }}>
        <div><strong>사용량:</strong> {value} {unit}</div>
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
  yMax,
  unit = 'Wh',
}) => {
  const values = useMemo(() => data.map(d => d.value), [data]);
  const dynamicMax = useMemo(() => (yMax ?? calcNiceMax(values)), [yMax, values]);

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height={227}>
        <BarChart data={data} margin={{ top: 30 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#909090', fontWeight: 500 }}
          />
          <YAxis
            orientation="right"
            domain={[0, dynamicMax]}
            tickCount={5}
            tick={{ fontSize: 9, fill: '#909090', fontWeight: 500 }}
          />

          <text
            x="100%"
            y={10}
            textAnchor="end"
            fontSize="7"
            fill="#909090"
            fontWeight="500"
          >
            ({unit})
          </text>

          <Tooltip content={<CustomTooltip unit={unit} />} />
          {/* radius 제거(둥근 모서리 X) */}
          <Bar dataKey="value" fill={barColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PowerBarChart;
