import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export default function LightButton({content, link}: {content: string, link: string}) {

  return (
    <Link href={link}>
      <span className="rainbow-hover text-md bright-text">{content}<FiChevronRight className="inline"/></span>
    </Link>
  );  
}
