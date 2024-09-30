import placeholderSquare from "./placeholder-square.png";
import spotify from "./spotify.png"
import youtube from "./youtube.png"
import apple from "./apple.png"
import tidal from "./tidal.png"
import bandcamp from "./bandcamp.png"
import amazon from "./amazon.png"

export function iconForService(service: string) {
  switch(service) {
  case "spotify":
    return spotify;
  case "apple":
    return apple;
  case "tidal":
    return tidal;
  case "amazon":
    return amazon;
  case "bandcamp":
    return bandcamp;
  case "youtube":
    return youtube;
  default:
    return placeholderSquare;
  }
}


export async function spotifySearch(term: string, type: string) {
  // Type: album, artist, track
  const params = new URLSearchParams()
  params.append("q", term)
  params.append("type", type)
  params.append("market", "US")
  params.append("limit", "1")
  const url = `https://api.spotify.com/v1/search?${params.toString()}`

  let result = null;
  try{
    const response = await fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${process.env.REACT_APP_SPOTIFY_API_KEY}` }
    });

    if (response.ok) {
      result = await response.json()
    } else {
      console.error(response.body)
      return ""
    }
  } catch(error) {
    console.error(error)
    return ""
  }

  try{  
    let userId = result['artists']['items'][0]['id']
    let spotArtistName = result['artists']['items'][0]['name']
    if (userId && term == spotArtistName) {
      return userId;
    }
  } catch(error) {
    console.error(error)
  }
  return "";

}
