export default function Home() {
  return (
    <>
      <div className="h-screen flex-col content-center text-center">
        <h1 className="text-6xl">tunetree</h1>
        <h2 className="text-xl my-2">Join the music revolution</h2>
        <div className="mx-auto my-2">
          <button className="mx-2 bg-indigo-500 rounded-lg"><span className="px-4 py-2 text-white">login</span></button>
          <button className="mx-2 bg-indigo-500 rounded-lg"><span className="px-4 py-2 text-white">sign-up</span></button>
        </div>
      </div>
    </>
  );
}
