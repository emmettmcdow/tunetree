import { useEffect, useState } from 'react';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';

import { Track } from './artist';
import { getAuthenticatedArtistLink} from '../utils/utils';
import Display from '@/components/display';
import UIButton from '@/components/uibutton';
import Link from 'next/link';





function SubscriptionPrompt({trackInfo, link, toggle}: {trackInfo: Track, link: string, toggle: React.Dispatch<React.SetStateAction<string>>}) {
  if (link) {
    return (
      <div className="z-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 fg-color p-5 rounded-2xl text-center z-50 drop-shadow-lg">
        <p>{"wanna be notified when "+ trackInfo.artist + " drops? (it's free)"}</p>
        <form className="my-2">
          <input className="text-black rounded-xl p-2 " placeholder="email" name="email"/>
          <div className="flex">
            <Link href={link}><UIButton type="confirm" content="yes" handle={() => toggle("")} submit={false}/></Link>
            <Link href={link}><UIButton type="deny" content="no" handle={() => toggle("")} submit={false}/></Link>
          </div>
        </form>
      </div>
    );
  } else {
    return null;
  }
}

export async function getTrackInfo(artistLink: string|null) {  
  try {
    let response = null;
    if (!artistLink) {
      response = await fetch(process.env.NEXT_PUBLIC_API_URL + 'track/' + getAuthenticatedArtistLink(), {
        method: 'GET'
      });
    } else {
      response = await fetch(process.env.NEXT_PUBLIC_API_URL + 'track/' + artistLink, {
        method: 'GET'
      });
    }

    if (response.ok && response.body) {
      const body = await response.json()
      return body;
    }
  } catch (error) {
    console.error('Error FROM TUNETREE:', error);
  }
  return ""
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
  console.log("tRACKY")
  console.log(trackInfo);
  console.log("tRACKY")
  if (typeof trackInfo !== "undefined" && trackInfo != "") {
    // Pass data to the page via props
    return { props: { trackInfo, slug } }
  } else {
      return {
        redirect: {
          destination: '/error/'+ slug,
          permanent: false,
        },
      }
  }
}) satisfies GetServerSideProps<{ trackInfo: Track, slug: string}>
 

export default function TrackPage({trackInfo, slug}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [link, setLink] = useState("")
  const ti = new Track(typeof trackInfo !== "undefined" ? trackInfo : {});

  const [isClient, setClient] = useState(false);
  useEffect(() => {
    setClient(true);
  }, []);

  const title = ti.artist + " | " + ti.name;
  const description = "Listen to " + ti.name + " by " + ti.artist + " on tunetree!";
  
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
                alt: ti.name + " album art"
              }
            ],
            url: "https://tunetree.xyz/" + slug
          }}
          
        />
        {isClient && <Display track={ti} setLink={setLink} width={window.innerWidth} height={window.innerHeight}/>}
        <SubscriptionPrompt trackInfo={ti} link={link} toggle={setLink}/>
        {/*<ColorPalette trackInfo={ti}/>*/}
      </>
  );
}
