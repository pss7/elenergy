import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, ReferenceLine } from 'recharts';

export interface ChartDataPoint {
  label: string;
  value: number;
  /** 시간별 전용: 숫자형 X축을 위해 사용 (1~24 권장) */
  hour?: number;
  /** 일/주/월 전용: 인덱스 기반 숫자축 */
  idx?: number;
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

  /** X축 제어 */
  xType?: 'category' | 'number';
  xDataKey?: string;
  xTicks?: (string | number)[];
  xTickFormatter?: (v: any) => string;
  xDomain?: any; // [min,max] or ['dataMin','dataMax']
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
    const { value } = payload[0] || {};
    return (
      <div style={{ background: 'white', border: '1px solid #ccc', padding: 8, fontSize: 12, lineHeight: 1.4 }}>
        <div><strong>사용량:</strong> {value} {unit}</div>
        {/* number형 X축일 때는 payload의 label 사용 */}
        <div><strong>날짜:</strong> {payload?.[0]?.payload?.label ?? label}</div>
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

  xType = 'category',
  xDataKey = 'label',
  xTicks,
  xTickFormatter,
  xDomain,
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
        <BarChart
          data={data}
          // ✅ 우측 여백 살짝 추가(축선/툴팁 겹침 완화)
          margin={{ top: 34, right: yAxisWidth + 6, left: yAxisWidth, bottom: 0 }}
        >
          <XAxis
            type={xType}
            dataKey={xDataKey}
            ticks={xTicks}
            tickFormatter={xTickFormatter}
            tick={{ fontSize: 11, fill: '#909090', fontWeight: 500 }}
            padding={{ left: 0, right: 0 }}
            domain={xDomain}
            allowDuplicatedCategory={false}
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
              stroke="#FF1E00"
              strokeWidth={2}
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
