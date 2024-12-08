import { useState, ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

const Tooltip = ({ text, children}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={`
            absolute z-40 px-3 py-2 top-0 left-1/2 -translate-x-1/2 translate-y-3 
            bg-color text-white drop-shadow-xl
            border-r-2 border-b-2
            text-sm rounded-md
            whitespace-nowrap
            pointer-events-none
          `}
          role="tooltip"
        >
          {text}
          <div className={`absolute -translate-x-1/2 rotate-45 left-1/2
                            bg-black w-1/12 aspect-square z-50
                            border-r-2 border-b-2 drop-shadow-xl
                            border-white`}></div>
       </div>
      )}
    </div>
  );
};

export default Tooltip;
