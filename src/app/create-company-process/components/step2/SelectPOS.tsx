import React, { useState } from "react";

import Clover from "@/assets/images/Clover.png";
import ConnectChannel from "./ConnectChannel";
import Shopify from "@/assets/icons/icons8-shopify.svg";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

/** Kiểu dữ liệu POS */
type IPOS = {
  onConnect: (value: string) => void;
  loading?: boolean;
  connected?: boolean;
};
const SelectPOS = ({ onConnect, loading, connected }: IPOS) => {
  /** Đa ngôn ngữ */
  const t = useTranslations();
  /** State lưu giá trị nhập */
  const [value, setValue] = useState<string>("");

  /**
   * Dư liệu POS
   */
  const POS_OPTION = [
    {
      value: "Shopify",
      label: "Shopify",
      Icon: Shopify,
    },
    {
      value: "Clover",
      label: "Clover",
      Icon: Clover,
    },
  ];

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-sm text-left font-normal">{t("Option2")}</h2>
      <div className="flex flex-col gap-2">
        {
          /** Render list option */
          POS_OPTION.map((option, index) => (
            <ConnectChannel
              key={index}
              name={option.value}
              Icon={option.Icon}
              onConnect={() => {
                onConnect(option.value);
              }}
              loading={loading}
              connected={connected}
            />
          ))
        }
      </div>
    </div>
  );
};

export default SelectPOS;
