import React, { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

interface ScrollPromptProps {
  target?: React.RefObject<HTMLDivElement>; // ID of element to check visibility
}

const ScrollPrompt = ({ target }: ScrollPromptProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkVisibility = () => {
      if (typeof target !== "undefined" && target && target.current) {
        // Check if specific element is in viewport
        const element = target.current;
        if (element) {
          const rect = element.getBoundingClientRect();
          setIsVisible(rect.top > window.innerHeight);
        }
      }
    };

    // Check initially
    checkVisibility();

    // Add scroll listener
    window.addEventListener("scroll", checkVisibility);
    return () => window.removeEventListener("scroll", checkVisibility);
  }, [target]);

  const scrollDown = () => {
    if (typeof target !== "undefined" && target && target.current) {
      // Scroll to specific element
      const element = target.current;
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      // Scroll down by viewport height
      window.scrollBy({
        top: window.innerHeight,
        behavior: "smooth",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fg-color fixed bottom-8 right-0 z-50 cursor-pointer rounded-l-2xl border-2 border-r-0"
      onClick={scrollDown}
    >
      <div className="ml-2 mt-4 flex animate-bounce flex-col items-center">
        <span className="font-ui text-lg text-white">more</span>
        <FiChevronDown size={32} className="text-white transition-colors" />
      </div>
    </div>
  );
};

export default ScrollPrompt;
