import { PieChart } from 'react-minimal-pie-chart';
import styles from './PowerDoughnutChart.module.css';

interface PowerDoughnutChartProps {
  powerReductionRate: number;
  textTitle: string;
  valueText: string;
  size?: number;
  color?: string;
  lineWidth?: number
  titleFontSize?: string;
  valueFontSize?: string;
}

export default function PowerDoughnutChart({
  lineWidth,
  powerReductionRate,
  textTitle,
  valueText,
  size = 141,
  titleFontSize,
  valueFontSize,
  color = '#0F7685',
}: PowerDoughnutChartProps) {
  return (
    <div className={styles.doughnutChartBox} style={{ width: size, height: size }}>
      <PieChart
        data={[{ value: powerReductionRate, color }]}
        totalValue={100}
        lineWidth={lineWidth}
        rounded
        background="#D9D9D9"
        startAngle={-90}
        style={{ width: size, height: size }}
        animate
      />
      <div className={styles.doughnutChartText}>
        <h3
          className={styles.title}
          style={{ fontSize: titleFontSize }}
        >
          {textTitle}
        </h3>
        <span style={{ fontSize: valueFontSize }}>
          {valueText}
        </span>

      </div>
    </div>
  );
}
