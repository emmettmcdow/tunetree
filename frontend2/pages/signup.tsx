import { useState, useEffect } from "react";

import { Password, Message, Header } from "./login";
import { validPassword, encodeArtistLink } from "../utils/utils";
import { spotifySearch } from "../utils/spotify";
import UIButton from "@/components/uibutton";

export const UIPaths = [
  "login",
  "signup",
  "artist",
  "about",
  "track",
  "settings",
  "admin",
  "error",
  "help",
];

export default function Signup() {
  const [message, setMessage] = useState("");
  const [separateLink, setSeparateLink] = useState(false);
  const [lastArtist, setLastArtist] = useState("");

  const [formData, setFormData] = useState({
    artist: "",
    link: "",
    email: "",
    password: "",
    cpassword: "",
    spotifyId: "",
  });

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name == "artist" && !separateLink) {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
        link: encodeArtistLink(value),
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // MAKE SURE TO UPDATE THIS ON BACKEND IF YOU CHANGE THIS
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!formData.email.match(emailRegex)) {
      setMessage("Not a valid email");
      return;
    }
    if (!validPassword(formData.password)) {
      setMessage(
        "Invalid password. Password must have between 8-64 characters, with one number, one special character, and one capital letter",
      );
      return;
    }
    if (formData.password != formData.cpassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (formData.artist == "") {
      setMessage("Invalid artist");
      return;
    }
    if (UIPaths.some((path) => path == formData.link)) {
      setMessage("Link " + formData.link + " is already taken.");
      return;
    }
    const validUrlPath = /^[a-zA-Z0-9\-_\.~]+$/;
    const res = validUrlPath.test(formData.link);
    if (!res) {
      setMessage("Invalid link");
      return;
    }

    // Convert form data to JSON
    const jsonData = JSON.stringify(formData);
    let responseBody = "";
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "signup/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: jsonData,
        },
      );

      if (response.ok) {
        // TODO: show this to users better
        window.location.replace("/login/");
      } else {
        responseBody = await response.text();
        console.log(responseBody);
        switch (response.status) {
          case 400:
            // Bad Request
            setMessage(responseBody);
            break;
          case 405:
            // Method not allowed
            throw new Error(responseBody);
          case 500:
            // Internal error
            throw new Error(responseBody);
          default:
            throw new Error(
              "Unhandled response(" + response.status + "): " + responseBody,
            );
        }
      }
    } catch (error) {
      // Handle network or other errors
      setMessage("Something has gone critically wrong: " + error);
    }
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (formData["artist"] != lastArtist) {
        spotifySearch(formData["artist"], "artist").then((spotifyId) => {
          setFormData((prevState) => ({
            ...prevState,
            spotifyId: spotifyId,
          }));
        });
        setLastArtist(formData["artist"]);
      }
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [formData, lastArtist]);

  return (
    <div className="flex h-screen flex-col">
      <div className="fg-color absolute left-1/2 top-1/2 w-11/12 -translate-x-1/2 -translate-y-1/2 transform rounded-lg p-4 md:w-3/5 md:p-8">
        <div className="mx-auto w-11/12 md:w-5/6">
          <Header left="signing up..." />
          <Message content={message} />
          <form onSubmit={handleSubmit} className="my-4 flex flex-col">
            <input
              className="font-light-bg-norm mb-2 w-full rounded-lg p-1 text-black"
              type="text"
              name="artist"
              placeholder="artist name"
              value={formData.artist}
              onChange={handleChange}
            />
            <div className="mb-2">your link will look like:</div>
            <div className="flex">
              <span className="bg-color mx-0 mb-2 inline w-fit cursor-not-allowed rounded-l-lg pl-2 text-white">
                <span className="rainbow-svg">tunetree.xyz/</span>
              </span>
              <input
                name="link"
                type="text"
                className={
                  separateLink
                    ? "rainbow-input font-light-bg-norm mx-0 mb-2 inline w-full rounded-r-lg text-black focus:outline-black"
                    : "rainbow-input font-light-bg-norm bg-color selectable-none mx-0 mb-2 inline w-full cursor-not-allowed rounded-r-lg text-white focus:outline-none"
                }
                value={formData.link}
                onChange={handleChange}
                readOnly={!separateLink}
                placeholder={separateLink ? " make me custom pls" : ""}
              />
            </div>
            <UIButton
              type="neutral"
              content={
                <>
                  {separateLink ? "want a default " : "want a custom "}
                  <span className="text-sm">🔗</span>?
                </>
              }
              submit={false}
              handle={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                setSeparateLink(!separateLink);
                if (separateLink) {
                  setFormData((prevState) => ({
                    ...prevState,
                    link: encodeArtistLink(formData.artist),
                  }));
                } else {
                  setFormData((prevState) => ({
                    ...prevState,
                    link: "",
                  }));
                }
              }}
            />
            <input
              className="font-light-bg-norm my-2 w-full rounded-lg p-1 text-black"
              type="text"
              name="email"
              placeholder="e-mail address"
              value={formData.email}
              onChange={handleChange}
            />

            <Password
              password={formData.password}
              setPassword={(password: string) => {
                setFormData({
                  ...formData,
                  password: password,
                });
              }}
              name="password"
            />
            <Password
              password={formData.cpassword}
              setPassword={(cpassword: string) => {
                setFormData({
                  ...formData,
                  cpassword: cpassword,
                });
              }}
              name="cpassword"
            />
            <UIButton
              type="confirm"
              content="submit"
              submit={true}
              handle={() => {}}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
