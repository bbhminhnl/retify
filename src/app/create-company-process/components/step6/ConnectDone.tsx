import Firework from "@/assets/images/Firework.png";
import Image from "next/image";
import { useTranslations } from "next-intl";
const ConnectDone = ({
  page_id,
  org_id,
}: {
  page_id: string;
  org_id: string;
}) => {
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
          onClick={() => {
            window.ReactNativeWebView?.postMessage(
              JSON.stringify({
                type: "page.home",
                message: {
                  final: true,
                  page_id: page_id,
                  org_id: org_id,
                },
              })
            );
          }}
          className="py-3 px-6 w-full text-white rounded-full gap-1 text-sm font-semibold bg-blue-700 cursor-pointer hover:bg-blue-500"
        >
          {t("go_live")}
        </button>
      </div>
    </div>
  );
};

export default ConnectDone;
