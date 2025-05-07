import Firework from "@/assets/images/Firework.png";
import Image from "next/image";
import React from "react";
const ConnectDone = () => {
  return (
    <div className="flex flex-col items-center gap-3 py-24">
      <h2>Awesome!</h2>
      <Image src={Firework} alt={"QR"} width={200} height={200} />
      <h4 className="text-sm font-normal px-8 text-center">
        Setup is complete – let’s get your store up and running with Retify.AI!
      </h4>
      <div className="p-8 w-full">
        <button
          onClick={() => {}}
          className="py-3 px-6 w-full text-white rounded-full gap-1 text-sm font-semibold bg-blue-700 cursor-pointer hover:bg-blue-500"
        >
          Go Live
        </button>
      </div>
    </div>
  );
};

export default ConnectDone;
