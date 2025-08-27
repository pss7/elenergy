import React from 'react';
import styles from './Title.module.css';

interface TitleProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: React.ReactNode;
  className?: string;
}

export default function Title({ level = 1, children, className = '' }: TitleProps) {
  const Tag = `h${level}` as React.ElementType;
  const defaultClass = styles[`h${level}`]; // h1, h2 등 레벨별 기본 스타일
  const combinedClassName = `${defaultClass} ${className}`.trim();

  return <Tag className={combinedClassName}>{children}</Tag>;
}
