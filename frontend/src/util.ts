import placeholderSquare from "./placeholder-square.png";
import spotify from "./spotify.png"
import youtube from "./youtube.png"
import apple from "./apple.png"
import tidal from "./tidal.png"
import bandcamp from "./bandcamp.png"
import amazon from "./amazon.png"

export function validPassword(password: string) {
  /* Rules:
   *   - All characters must be between 33 and 126 ascii inclusive
   *   - Password must be between 8-64 characters
   *   - One number
   *   - One Special
   *   - One Caps
   */

  let caps = false;
  let special = false;
  let number = false;

  if (password.length < 8 || password.length > 64) {
    return false;
  }
  for (let i = 0; i < password.length; i++) {
    let code = password.charCodeAt(i);
    if (code < 33 || code > 126) {
      return false
    }
    if (code > 47 && code < 58) {
      number = true;
    }
    if ((code > 32 && code < 48) || (code > 57 && code < 65) || (code > 90 && code < 97) || (code > 122 && code < 127)) {
      special = true;
    }
    if (code > 64 && code < 91) {
      caps = true;
    }
  }
  return caps && special && number;
}

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

export function setAuthenticatedUser(body: any) {
  document.cookie = "token=" + body["token"];
  document.cookie = "artist=" + body["Artist"];
  document.cookie = "email=" + body["Email"];
  document.cookie = "spotify_id=" + body["SpotifyId"];
}

export function getAuthorizationHeader() {
  return "Bearer " + getCookieValue("token");
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

export async function spotifyGetArt(albumId: string){
  const params = new URLSearchParams()
  params.append("ids", albumId)
  params.append("market", "US")
  const url = `https://api.spotify.com/v1/albums?${params.toString()}`

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
      return ["", ""]
    }
  } catch(error) {
    console.error(error)
    return ["", ""]
  }
  let imageUrl = "";
  let name = '';
  try{  
    imageUrl = result['albums'][0]['images'][0]['url'];
    name = result['albums'][0]['name']
  } catch(error) {
    console.error(error)
  }
  console.log(imageUrl);
  return [imageUrl, name];
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
