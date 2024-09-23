export default function Home() {
  return (
    <>
      <div className="h-screen flex-col content-center text-center">
        <h1 className="text-7xl rainbow-text">tunetree</h1>
        <h2 className="text-2xl my-2">Join the music revolution</h2>
        <div className="mx-auto my-4">
          <a href="/login"><button className="mx-2 bg-indigo-500 rounded-lg"><span className="text-xl p-6 text-white">login</span></button></a>
          <a href="/signup"><button className="mx-2 bg-indigo-500 rounded-lg"><span className="text-xl p-6 text-white">sign-up</span></button></a>
        </div>
      </div>
    </>
  );
}
