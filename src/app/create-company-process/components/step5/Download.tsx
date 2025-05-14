import Image from "next/image";
import QR from "@/assets/images/QR.png";
import React from "react";
import Shopify from "@/assets/icons/shopify.svg";
import { useTranslations } from "next-intl";
/**
 * Kiểu dữ liệu download
 */
interface Props {
  /** Tên */
  name?: string;
  /** Hàm xuất dữ liệu */
  onConnect?: () => void;
  /** Icon */
  Icon?: React.ElementType;
  /** src */
  src?: string;
}
const Download = ({ name, onConnect, Icon, src }: Props) => {
  /** Đa ngôn ngữ */
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center justify-between p-3 gap-2.5 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          <div>
            <Image
              src={Icon || Shopify}
              alt={name || "Shopify"}
              width={32}
              height={32}
            />
          </div>
          <span className="text-sm font-semibold">QR - Code</span>
        </div>
        <div
          onClick={() => onConnect && onConnect()}
          className="py-2 px-10 text-white rounded-md gap-1 text-sm font-semibold bg-blue-700 cursor-pointer hover:bg-blue-500"
        >
          {t("download")}
        </div>
      </div>
      <div>
        <Image src={src || QR} alt={name || "QR"} width={200} height={200} />
      </div>
    </div>
  );
};

export default Download;
