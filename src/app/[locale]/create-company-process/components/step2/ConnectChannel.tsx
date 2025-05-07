import Image from "next/image";
import Loading from "@/components/loading/Loading";
import React from "react";
import Shopify from "@/assets/icons/shopify.svg";

/**
 * Kiểu dữ liệu connect channel
 */
interface Props {
  /** Tên  */
  name?: string;
  /** Hàm connect */
  onConnect?: () => void;
  /** Icon */
  Icon?: React.ElementType;
  /**
   * loading
   */
  loading?: boolean;
  /** Selected */
  selected?: boolean;
}
const ConnectChannel = ({
  name,
  onConnect,
  Icon,
  loading,
  selected,
}: Props) => {
  return (
    <div className="flex items-center justify-between p-3 gap-x-2.5 rounded-lg border border-slate-200">
      <div className="flex items-center gap-2.5">
        <div>
          <Image
            src={Icon || Shopify}
            alt={name || "Shopify"}
            width={32}
            height={32}
          />
        </div>
        <span className="text-sm font-semibold">{name || "Shopify"}</span>
      </div>
      <div
        onClick={() => onConnect && onConnect()}
        className="flex gap-x-2 py-2 px-10 border border-blue-700 rounded-md gap-1 text-sm font-semibold text-blue-700 bg-blue-100 cursor-pointer hover:bg-blue-200"
      >
        Connect
        {selected && loading && (
          <div className="">
            <Loading size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectChannel;
