import placeholderSquare from "./placeholder-square.png";
import "./App.css";

function SongInfo() {
  let artist = "Honestus";
  let song = "Work That Back Boy";
  let art = placeholderSquare;

  return (
    <div id="song-info">
      <h1 id="artist-header">{artist}</h1>
      <img width="300" height="300" src={art} />
      <h2 id="song-or-album-title">{song}</h2>
    </div>
  );
}
function ButtonBox() {
  let providers = ["spotify", "applemusic", "youtube"];
  let buttons = providers.map((provider) => {
    return <IconLink provider={provider} />;
  });
  return <div id="button-box">{buttons}</div>;
}
function IconLink(provider) {
  return (
    <a href={provider}>
      <img width="100" height="100" src={placeholderSquare} />
    </a>
  );
}

function App() {
  return (
    <div className="App">
      <SongInfo />
      <ButtonBox />
    </div>
  );
}

export default App;
