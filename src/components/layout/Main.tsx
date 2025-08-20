import type { ReactNode } from "react";
import Footer from "./Footer";

interface mainProps {

  children?: ReactNode;
  id?: string;
  className?: string;
  style?: React.CSSProperties;

}


export default function Main({ id, children, className, style }: mainProps) {

  return (
    <>
      <main
        id={id}
        className={className}
        style={style}
      >
        {children}
      </main>
      <Footer />
    </>
  )

}