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

export function setAuthenticatedUser(user: any) {
  document.cookie = "artist=" + user["Artist"];
  document.cookie = "email=" + user["Email"];
  document.cookie = "spotify_id=" + user["SpotifyId"];
}

export function getAuthenticatedArtist() {
  return getCookieValue("artist")
}

export function getAuthenticatedUser() {
  const token = getCookieValue("user");
  if (!token) {
    return ""
  }
  const jwt = parseJwt(token);
  return jwt["sub"];
}

const getCookieValue = (name: string) => (
  document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)

function parseJwt (token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
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
