import Talk from "@/components/talk";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";

export const getServerSideProps = (async (ctx) => {
  // Fetch data from external API
  const slug = ctx.params!.track as string;
  return { props: { slug } }
}) satisfies GetServerSideProps<{ slug: string}>

export default function Error({slug}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const location = slug;
  const words = (
    <span className="text-3xl text-center absolute top-16 left-8 -rotate-12">    
      <i>{location}</i>? <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; never heard of &apos;em
    </span>
  );
  return(
    <div className="min-h-dvh flex flex-col justify-evenly w-full">
      <Talk words={words}/>
    </div>
  );
}
