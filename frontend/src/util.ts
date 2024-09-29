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
