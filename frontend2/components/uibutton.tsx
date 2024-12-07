// We want any funciton here.

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// eslint-disable-next-line
export default function UIButton({type, content, handle, submit}: {type: string, content?: string, handle: Function, submit: boolean}) {
  /*
    - type: confirm, deny, neutral
    - content: what the button says
    - handle: what ot do on click
  */
  let color = "";
  switch(type) {
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

  const buttonClass = "m-4 rounded-lg cursor-pointer bounce-button " + color;
  return (
    <button className={buttonClass} onClick={(e) => handle(e)} type={actiontype}>
      {(() => {
        switch(type) {
        case "left":
          return <FiChevronLeft className="inline mx-2 rainbow-hover"/>;
        case "right":
          return <FiChevronRight className="inline mx-2 rainbow-hover"/>;
        default:
          return (<span className="text-xl p-6 rainbow-hover">{content || ""}</span>);
      }})()}
    </button>
  );  
}
