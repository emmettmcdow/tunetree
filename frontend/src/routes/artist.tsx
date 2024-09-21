
export default function Artist() {
  return (
    <div className="h-screen flex flex-col">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-200 w-3/4 p-4 rounded-lg">
        <h1 className="text-xl mb-2">Release new record</h1>
        <form>
          <input className="w-full rounded-lg p-1 mb-2" type="text" name="record" placeholder="Record Name"/>
          <input className="w-full rounded-lg p-1 mb-2" type="text" name="youtube" placeholder="Spotify URL"/>
          <input className="w-full rounded-lg p-1 mb-2" type="text" name="apple" placeholder="Apple Music URL"/>
          <input className="w-full rounded-lg p-1 mb-2" type="text" name="youtube" placeholder="Youtube URL"/>
          <textarea  className="w-full rounded-lg p-1 mb-2" name="message" placeholder="A message to your fans"/>
          <button className="w-full bg-emerald-500 rounded-lg"><span className="p-4 py-2 text-white">preview</span></button>
        </form>
      </div>
    </div>
  );
}
