import somethingWrongImg from "@/public/img/elements/somethingWrong.png";
import Image from "next/image";
import Link from "next/link";

const ErrorState = ({ url = "/" }) => {
  return (
    <div className="w-full py-6 flex flex-col items-center justify-center space-y-4 text-center  rounded-md">
      <Image
        src={somethingWrongImg}
        alt="somethingWrongImg"
        className="size-[30rem]"
      />

      <div className="space-y-2 mb-10">
        <h3 className="text-5xl font-semibold">We are sorry!</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Something went wrong on the server
        </p>
      </div>

      <Link
        href={url || "/"}
        className=" bg-darkMain border-darkMain hover:bg-[#0054d2] px-16 py-2.5 text-sm  rounded"
      >
        Go Back
      </Link>
    </div>
  );
};

export { ErrorState };
