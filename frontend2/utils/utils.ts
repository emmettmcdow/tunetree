import { UIPaths } from "@/pages/signup";

const placeholderSquare = "/white-logos/placeholder.png";
const spotify = "/white-logos/spotify.png";
const youtube = "/white-logos/youtube.png";
const apple = "/white-logos/apple.png";
const tidal = "/white-logos/tidal.png";
const bandcamp = "/white-logos/bandcamp.png";
const amazon = "/white-logos/amazon.png";
const black_spotify = "/black-logos/spotify.png";
const black_youtube = "/black-logos/youtube.png";
const black_apple = "/black-logos/apple.png";
const black_tidal = "/black-logos/tidal.png";
const black_bandcamp = "/black-logos/bandcamp.png";
const black_amazon = "/black-logos/amazon.png";

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
      return false;
    }
    if (code > 47 && code < 58) {
      number = true;
    }
    if (
      (code > 32 && code < 48) ||
      (code > 57 && code < 65) ||
      (code > 90 && code < 97) ||
      (code > 122 && code < 127)
    ) {
      special = true;
    }
    if (code > 64 && code < 91) {
      caps = true;
    }
  }
  return caps && special && number;
}

export function iconForService(service: string, black: boolean) {
  if (black) {
    switch (service) {
      case "spotify":
        return black_spotify;
      case "apple":
        return black_apple;
      case "tidal":
        return black_tidal;
      case "amazon":
        return black_amazon;
      case "bandcamp":
        return black_bandcamp;
      case "youtube":
        return black_youtube;
      default:
        return placeholderSquare;
    }
  }
  switch (service) {
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
  document.cookie = "token=" + body["Token"];
  document.cookie = "id=" + body["Id"];
}

export function getAuthorizationHeader() {
  return "Bearer " + getCookieValue("token");
}

export function getAuthenticatedUser() {
  const id = getCookieValue("id");
  return id;
}

const getCookieValue = (name: string) =>
  document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")?.pop() || "";

function parseJwt(token: string) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );

  return JSON.parse(jsonPayload);
}

export function encodeArtistLink(name: string) {
  name = name
    .replaceAll(" ", "-") // Spaces to dashes
    .replaceAll(/[^a-zA-Z0-9-_.~]/g, "") // Remove not allowed characters
    .toLowerCase();
  if (UIPaths.some((path) => path == name)) {
    name += "~";
  }
  return name;
}
