import { useState, ReactNode } from "react";

interface TooltipProps {
  text?: string;
  children: ReactNode;
  hackNoArrow?: boolean;
}

const Tooltip = ({ text, children, hackNoArrow }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  if (typeof hackNoArrow === "undefined") {
    hackNoArrow = true;
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && text && (
        <div
          className={`bg-color font-ui pointer-events-none absolute left-1/2 top-0 z-40 -translate-x-1/2 translate-y-3 whitespace-nowrap text-wrap rounded-md border-b-2 border-r-2 px-3 py-2 text-lg text-white drop-shadow-xl`}
          role="tooltip"
        >
          {text}
          {!hackNoArrow && (
            <div
              className={`absolute left-1/2 z-50 aspect-square w-1/12 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-white bg-black drop-shadow-xl`}
            ></div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
