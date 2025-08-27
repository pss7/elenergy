import { FadeLoader } from "react-spinners";

interface FullScreenLoadingProps {
  width?: number;
  height?: number;
  color?: string;
  overlayColor?: string;
}

export default function FullScreenLoading({
  width,
  height,
  color,
  overlayColor
}: FullScreenLoadingProps) {

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: overlayColor,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <FadeLoader width={width} height={height} color={color} />
    </div>
  )

}