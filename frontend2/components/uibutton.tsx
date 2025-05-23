import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// eslint-disable-next-line
export default function UIButton({
  type,
  content,
  handle,
  submit,
  className,
}: {
  type: string;
  content?: string | JSX.Element;
  handle: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  submit: boolean;
  className?: string;
}) {
  /*
    - type: confirm, deny, neutral
    - content: what the button says
    - handle: what ot do on click
  */
  let color = "";
  switch (type) {
    case "confirm":
      color = " bg-black ";
      break;
    case "deny":
      color = " bg-neutral-900 ";
      break;
    case "left":
    case "right":
    case "neutral":
      color = " bg-black ";
      break;
  }
  let actiontype: "submit" | "button" = "button";
  if (submit) {
    actiontype = "submit";
  }

  const buttonClass = `rounded-lg cursor-pointer ${color} ${className}`;
  return (
    <button
      className={buttonClass}
      onClick={(e) => handle(e)}
      type={actiontype}
    >
      {(() => {
        switch (type) {
          case "left":
            return (
              <FiChevronLeft className="rainbow-hover bright-text mx-2 inline" />
            );
          case "right":
            return (
              <FiChevronRight className="rainbow-hover bright-text mx-2 inline" />
            );
          default:
            return (
              <div className="rainbow-hover bright-text font-ui px-2 py-1 text-xl">
                {content || ""}
              </div>
            );
        }
      })()}
    </button>
  );
}
