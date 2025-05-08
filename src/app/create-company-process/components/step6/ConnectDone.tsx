import Firework from "@/assets/images/Firework.png";
import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";
const ConnectDone = () => {
  /** Đa ngôn ngữ */
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center gap-3 py-24">
      <h2>{t("awesome")}</h2>
      <Image src={Firework} alt={"QR"} width={200} height={200} />
      <h4 className="text-sm font-normal px-8 text-center">
        {t("setup_complete")}
      </h4>
      <div className="p-8 w-full">
        <button
          onClick={() => {}}
          className="py-3 px-6 w-full text-white rounded-full gap-1 text-sm font-semibold bg-blue-700 cursor-pointer hover:bg-blue-500"
        >
          {t("go_live")}
        </button>
      </div>
    </div>
  );
};

export default ConnectDone;
