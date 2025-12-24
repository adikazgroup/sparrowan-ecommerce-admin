import Link from "next/link";
import Image from "next/image";

const DataNotFound = () => {
  return (
    <div className="flex-col h-[calc(100vh-10rem)] center">
      <Image
        src="/img/core/data-not-found.svg"
        alt="404"
        width={500}
        height={500}
      />
      <h1 className="mb-4 text-muted">No data found!</h1>
      <Link href={"/"} className="px-20" variant="default">
        Go Back
      </Link>
    </div>
  );
};

export default DataNotFound;
