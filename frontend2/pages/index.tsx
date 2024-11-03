export function UIButton({type, content, handle, submit}: {type: string, content: string, handle: Function, submit: boolean}) {
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

  let buttonClass = "mx-2 rounded-lg cursor-pointer bounce-button" + color;
  let textClass = "text-xl p-6 text-white bounce-text";
  return (
    <button className={buttonClass} onClick={(e) => handle(e)} type={actiontype}><span className={textClass}>{content}</span></button>
  );  
}

export default function Home() {
  return (
    <>
      <div className="h-screen flex-col content-center text-center">
        <img src="favicon.ico" alt="tunetree logo" className="w-36 mx-auto"/>
        <h1 className="text-7xl rainbow-text">tunetree</h1>
        <h2 className="text-2xl my-2">Join the music revolution</h2>
        <div className="mx-auto my-4">
          <a href="/login"><UIButton type="neutral" content="Login" handle={() => {}} submit={false}/></a>
          <a href="/signup"><UIButton type="neutral" content="Signup" handle={() => {}} submit={false}/></a>
        </div>
      </div>
    </>
  );
}
