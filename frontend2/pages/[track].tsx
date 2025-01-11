import { useEffect, useState } from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { NextSeo } from "next-seo";

import { Subscription, Track } from "../model";
import Display from "@/components/display";
import UIButton from "@/components/uibutton";
import Link from "next/link";
import { Header } from "./login";
import Head from "next/head";

function SubscriptionPrompt({
  trackInfo,
  link,
  toggle,
  artistLink,
}: {
  trackInfo: Track;
  link: string;
  toggle: React.Dispatch<React.SetStateAction<string>>;
  artistLink: string;
}) {
  const [email, setEmail] = useState("");

  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  const subscribeTo = async () => {
    const jsonData = JSON.stringify(
      new Subscription({ email: email, artist_link: artistLink }),
    );
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}subscribe/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: jsonData,
        },
      );

      if (response.ok && response.body) {
        const body = await response.json();
        return body;
      }
    } catch (error) {
      console.error("Error FROM TUNETREE:", error);
    }
    return "";
  };

  if (link) {
    return (
      <div
        className={
          "fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50"
        }
      >
        <div className="fg-color z-50 w-11/12 flex-col items-center rounded-2xl p-5 text-center shadow-inner drop-shadow-2xl md:w-3/5">
          <Header left={"going to '" + trackInfo.name + "'..."} />
          <div className="mt-2">
            {"wanna be notified when " +
              trackInfo.artist +
              " drops? (it's free)"}
          </div>
          <form className="my-2">
            <input
              className="font-light-bg-norm rounded-xl p-2 text-black"
              placeholder="email"
              name="email"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
            <div className="mt-2 flex justify-center">
              <Link href={link} className="mx-2">
                <UIButton
                  type="deny"
                  content="no"
                  handle={() => toggle("")}
                  submit={false}
                />
              </Link>
              <div className="mx-2">
                <UIButton
                  type="confirm"
                  content="yes"
                  handle={() => {
                    if (!email.match(emailRegex)) {
                      alert("Not a valid email");
                      return;
                    }
                    subscribeTo().then(() => {
                      console.log("subscribed");
                      toggle("");
                      window.location.href = link;
                    });
                  }}
                  submit={false}
                />
              </div>
            </div>
            <Link href={link}>
              <UIButton
                type="deny"
                content="just go to the music"
                handle={() => toggle("")}
                className="m-2"
                submit={false}
              />
            </Link>
          </form>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export async function getTrackInfo(artistLink: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}track/${artistLink}`,
      {
        method: "GET",
      },
    );

    if (response.ok && response.body) {
      const body = await response.json();
      return body;
    }
  } catch (error) {
    console.error("Error FROM TUNETREE:", error);
  }
  return "";
}

/*
interface Styles {
  container: React.CSSProperties;
  colorBox: React.CSSProperties;
  square: React.CSSProperties;
  colorCode: React.CSSProperties;
}

function ColorPalette({ trackInfo }: {trackInfo: Track}){
  if (!trackInfo.colors) {
    return (<></>);
  }
  // Split the input string into an array of color codes
  const colors = trackInfo.colors.split(';').map((color: string) => color.trim());

  // Styles for the component
  const styles: Styles = {
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      justifyContent: 'center',
    },
    colorBox: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    square: {
      width: '100px',
      height: '100px',
      border: '1px solid #ddd',
    },
    colorCode: {
      marginTop: '5px',
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.container}>
      {colors.map((color: string, index: number) => (
        <div key={index} style={styles.colorBox}>
          <div 
            style={{
              ...styles.square,
              backgroundColor: color,
            }}
          />
          <span style={styles.colorCode}>{color}</span>
        </div>
      ))}
    </div>
  );
};
*/

export const getServerSideProps = (async (ctx) => {
  // Fetch data from external API
  const slug = ctx.params!.track as string;
  const trackInfo = await getTrackInfo(slug);
  if (typeof trackInfo !== "undefined" && trackInfo != "") {
    // Pass data to the page via props
    return { props: { trackInfo, slug } };
  } else {
    return {
      redirect: {
        destination: "/error/" + slug,
        permanent: false,
      },
    };
  }
}) satisfies GetServerSideProps<{ trackInfo: Track; slug: string }>;

export default function TrackPage({
  trackInfo,
  slug,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [link, setLink] = useState("");
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const ti = new Track(typeof trackInfo !== "undefined" ? trackInfo : {});

  const [isClient, setClient] = useState(false);
  useEffect(() => {
    setClient(true);

    const handleResize = () => {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    };

    // Add event listener for resize
    window.addEventListener("resize", handleResize);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const title = ti.artist + " | " + ti.name;
  const description =
    "Listen to " + ti.name + " by " + ti.artist + " on tunetree!";

  return (
    <>
      <NextSeo
        title={title}
        description={description}
        openGraph={{
          title: title,
          description: description,
          type: "audio.music",
          images: [
            {
              url: ti.image,
              width: 1024,
              height: 1024,
              alt: ti.name + " album art",
            },
          ],
          url: "https://tunetree.xyz/" + slug,
        }}
      />
      <Head>
        <link rel="icon" href={ti.image || "./favicon.ico"} />
      </Head>
      {isClient && (
        <Display
          track={ti}
          setLink={setLink}
          width={width || window.innerWidth}
          height={height || window.innerHeight}
        />
      )}
      <SubscriptionPrompt
        artistLink={slug}
        trackInfo={ti}
        link={link}
        toggle={setLink}
      />
      {/*<ColorPalette trackInfo={ti}/>*/}
    </>
  );
}
