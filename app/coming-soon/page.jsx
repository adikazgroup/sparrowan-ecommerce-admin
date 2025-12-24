import Image from "next/image";
import { Button } from "@/components/ui/button/Button";
import comingImg from "@/public/img/elements/comingSoon.png";

const ComingSoon = () => {
  return (
    <div className="minBody Body ">
      <div className="flex-col h-full  center dark:bg-[#010611] bg-white rounded-lg">
        <h3 className="text-xl mb-2">Coming Soon...</h3>
        <Image
          src={comingImg}
          alt="404"
          width={500}
          height={500}
          className="mb-10"
        />
        <Button className="px-20" variant="default">
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default ComingSoon;
