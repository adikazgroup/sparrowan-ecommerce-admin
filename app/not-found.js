import Link from "next/link";
import Image from "next/image";

const NotFound = () => {
  return (
    <div className="flex-col h-[calc(100vh-10rem)] center">
      <Image src="/img/core/not-found.svg" alt="404" width={500} height={500} />
      <Link href={"/"} className="px-20 py-2 bg-darkMain rounded-md">
        Go Back
      </Link>
    </div>
  );
};

export default NotFound;
