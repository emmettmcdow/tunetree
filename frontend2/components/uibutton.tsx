// We want any funciton here.
// eslint-disable-next-line
export default function UIButton({type, content, handle, submit}: {type: string, content: string, handle: Function, submit: boolean}) {
  /*
    - type: confirm, deny, neutral
    - content: what the button says
    - handle: what ot do on click
  */
  let color = "";
  switch(type) {
  case "confirm":
      color = " bg-emerald-500 ";
      break;
  case "deny":
      color = " bg-rose-500 ";
      break;
  case "neutral":
      color = " bg-indigo-500 ";
      break;
  }
  let actiontype: "submit" | "button" = "button";
  if (submit) {
    actiontype = "submit";
  }

  const buttonClass = "m-4 rounded-lg cursor-pointer bounce-button" + color;
  const textClass = "text-xl p-6 text-white bounce-text";
  return (
    <button className={buttonClass} onClick={(e) => handle(e)} type={actiontype}><span className={textClass}>{content}</span></button>
  );  
}
