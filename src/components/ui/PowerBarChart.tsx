import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, ReferenceLine } from 'recharts';

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
  /** 평균선 표시 여부 & 값 (없으면 data로 평균 계산) */
  showAverageLine?: boolean;
  averageValue?: number;
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
  height = 227,
  barColor = '#0F7685',
  yMax,
  unit = 'Wh',
  showAverageLine = false,
  averageValue,
}) => {
  const values = useMemo(() => data.map(d => d.value), [data]);
  const computedAvg = useMemo(() => {
    if (!values.length) return 0;
    const sum = values.reduce((s, v) => s + v, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }, [values]);

  const avg = averageValue ?? computedAvg;
  // 평균선도 축 범위 계산에 포함
  const maxForScale = useMemo(() => Math.max(...values, avg || 0), [values, avg]);
  const dynamicMax = useMemo(() => (yMax ?? calcNiceMax([maxForScale])), [yMax, maxForScale]);

  const yAxisWidth = 32;

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 34, right: yAxisWidth, left: yAxisWidth, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#909090', fontWeight: 500 }}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis
            width={yAxisWidth}
            orientation="right"
            domain={[0, dynamicMax]}
            tickCount={5}
            tick={{ fontSize: 9, fill: '#909090', fontWeight: 500 }}
            axisLine
            tickLine={false}
          >
            <Label
              value={`(${unit})`}
              position="top"
              offset={10}
              angle={0}
              style={{ fill: '#909090', fontSize: 7, fontWeight: 500 }}
            />
          </YAxis>

          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Bar dataKey="value" fill={barColor} />

          {showAverageLine && (
            <ReferenceLine
              y={avg}
              stroke="#C9443F"
              strokeWidth={1}
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
          )}

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PowerBarChart;
