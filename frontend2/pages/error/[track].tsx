import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image"

export const getServerSideProps = (async (ctx) => {
  // Fetch data from external API
  const slug = ctx.params!.track as string;
  return { props: { slug } }
}) satisfies GetServerSideProps<{ slug: string}>

export default function Error({slug}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const location = slug;
  return(
    <div className="min-h-dvh flex flex-col justify-evenly w-full">
      <div className="mx-auto w-fit relative">
        <span className="text-3xl text-center absolute top-16 left-8 -rotate-12"><i>{location}</i>? <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; never heard of &apos;em</span>
        <Image alt="tunetree logo saying not found" src="/404-logo-png.png" width={400} height={400}/>
      </div>
    </div>
  );
}
