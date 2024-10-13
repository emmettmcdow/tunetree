import placeholderSquare from "./placeholder-square.png";
const spotify = "/spotify.png"
const youtube = "/youtube.png"
const apple = "/apple.png"
const tidal = "/tidal.png"
const bandcamp = "/bandcamp.png"
const amazon = "/amazon.png"


export function UIButton() {

}

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
  document.cookie = "link=" + body["Link"]
}

export function getAuthorizationHeader() {
  return "Bearer " + getCookieValue("token");
}

export function getAuthenticatedArtist() {
  return getCookieValue("artist")
}

export function getAuthenticatedArtistLink() {
  return getCookieValue("link");
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

export function encodeArtistLink (name: string) {
  return name.replaceAll(" ", "-")  // Spaces to dashes
             .replaceAll(/[^a-zA-Z0-9-_.~]/g, "")  // Remove not allowed characters
             .toLowerCase()
}
  
