import { memo } from "react";

interface SwapArrowsIconProps {
  readonly className?: string;
  readonly width?: number;
  readonly height?: number;
}

const SwapArrowsIcon = memo(function SwapArrowsIcon({
  className,
  width = 24,
  height = 24,
}: SwapArrowsIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      width={width}
      height={height}
      aria-hidden="true"
    >
      <path
        d="M7 16V4m0 0L3 8m4-4 4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 8v12m0 0 4-4m-4 4-4-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

export default SwapArrowsIcon;
