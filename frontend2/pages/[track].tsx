import { useEffect, useState } from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { NextSeo } from "next-seo";

import { Track } from "./artist";
import { getAuthenticatedArtistLink } from "../utils/utils";
import Display from "@/components/display";
import UIButton from "@/components/uibutton";
import Link from "next/link";
import { Header } from "./login";

function SubscriptionPrompt({
  trackInfo,
  link,
  toggle,
}: {
  trackInfo: Track;
  link: string;
  toggle: React.Dispatch<React.SetStateAction<string>>;
}) {
  if (link) {
    return (
      <div
        className={
          "fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50"
        }
      >
        <div className="fg-color md:3/5 z-50 w-11/12 flex-col items-center rounded-2xl p-5 text-center shadow-inner drop-shadow-2xl">
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
            />
            <div className="flex justify-center">
              <Link href={link}>
                <UIButton
                  type="deny"
                  content="no"
                  handle={() => toggle("")}
                  submit={false}
                />
              </Link>
              <Link href={link}>
                <UIButton
                  type="confirm"
                  content="yes"
                  handle={() => toggle("")}
                  submit={false}
                />
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export async function getTrackInfo(artistLink: string | null) {
  try {
    let response = null;
    if (!artistLink) {
      response = await fetch(
        process.env.NEXT_PUBLIC_API_URL +
          "track/" +
          getAuthenticatedArtistLink(),
        {
          method: "GET",
        },
      );
    } else {
      response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "track/" + artistLink,
        {
          method: "GET",
        },
      );
    }

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
  const ti = new Track(typeof trackInfo !== "undefined" ? trackInfo : {});

  const [isClient, setClient] = useState(false);
  useEffect(() => {
    setClient(true);
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
      {isClient && (
        <Display
          track={ti}
          setLink={setLink}
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}
      <SubscriptionPrompt trackInfo={ti} link={link} toggle={setLink} />
      {/*<ColorPalette trackInfo={ti}/>*/}
    </>
  );
}
