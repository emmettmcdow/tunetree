export class Track {
  message: string;
  name: string;
  artist: string;
  image: string;
  colors: string;
  animation: string;
  display: string;
  links: {
    apple: string;
    spotify: string;
    youtube: string;
    tidal: string;
    amazon: string;
    bandcamp: string;
  };
  // eslint-disable-next-line
  constructor(data: any) {
    this.artist = "";
    this.name = "not yet set //";
    this.display = "minimal";
    this.message = "";
    this.image = "";
    this.colors = "";
    this.animation = "cube";
    this.links = {
      apple: "",
      spotify: "",
      youtube: "",
      tidal: "",
      amazon: "",
      bandcamp: "",
    };
    if (Object.hasOwn(data, "artistName")) {
      this.artist = data["artistName"];
    }
    if (Object.hasOwn(data, "track")) {
      this.name = data["track"]["name"];
      this.message = data["track"]["message"];
      this.image = data["track"]["image"];
      this.colors = data["track"]["colors"];
      this.animation = data["track"]["animation"];
      this.display = data["track"]["display"];
      this.links = {
        apple: data["track"]["links"]["apple"] || "",
        spotify: data["track"]["links"]["spotify"] || "",
        youtube: data["track"]["links"]["youtube"] || "",
        tidal: data["track"]["links"]["tidal"] || "",
        amazon: data["track"]["links"]["amazon"] || "",
        bandcamp: data["track"]["links"]["bandcamp"] || "",
      };
    }
  }
}

export class User {
  id: string = "";
  email: string = "";
  artist: string = "";
  link: string = "";
  spotify_id: string = "";

  constructor(...args: (string | User)[]) {
    if (args.length != 0) {
      let param = args[0];
      if (typeof param === "string") {
        this.id = param;
      } else if (typeof param !== "undefined") {
        // Must then be a User type
        Object.assign(this, param);
      }
    }
  }
}

export class AnimationJob {
  user_id: string = "";
  status: string = "";
  art_link: string = "";
  animation_link: string = "";
  prompt: string = "";

  constructor(params: AnimationJob) {
    Object.assign(this, params);
  }
}
