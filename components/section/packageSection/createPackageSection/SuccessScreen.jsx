import Image from "next/image";
import likeImg1 from "@/public/img/elements/like1.png";
import likeImg2 from "@/public/img/elements/like2.png";
import { useRouter } from "next/navigation";

export default function SuccessScreen() {
  const router = useRouter();
  return (
    <>
      <div
        onClick={() => router.push("/package/manage-package")}
        className="fixed top-0 left-0  w-screen h-screen bg-gray-600 dark:bg-black opacity-70 z-[1000] "
      ></div>
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#161F2D] rounded-lg shadow-sm p-8 py-20 text-center !z-[100000] relative mt-28 ">
        <Image src={likeImg1} alt="likeImg" className="absolute top-10" />
        <Image
          src={likeImg2}
          alt="likeImg"
          className="absolute bottom-10 right-0"
        />

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-4xl font-bold text-primary mb-2">
          Congratulations
        </h2>
        <p className="text-gray-400 mb-6 text-lg">
          You have successfully created the package
        </p>

        <button
          onClick={() => router.push("/package/manage-package")}
          className="bg-primary hover:bg-blue-900 text-white py-3 px-6 rounded-md transition-colors text-sm"
        >
          Go to Show All Packages
        </button>
      </div>
    </>
  );
}
