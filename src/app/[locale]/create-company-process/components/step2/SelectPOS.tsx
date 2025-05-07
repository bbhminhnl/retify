import React, { useState } from "react";

import Clover from "@/assets/images/Clover.png";
import ConnectChannel from "./ConnectChannel";
import Shopify from "@/assets/icons/icons8-shopify.svg";
import { toast } from "react-toastify";

const SelectPOS: React.FC = () => {
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
      <h2 className="text-sm text-left font-normal">
        Option 3: Connect your POS
      </h2>
      <div className="flex flex-col gap-2">
        {
          /** Render list option */
          POS_OPTION.map((option, index) => (
            <ConnectChannel
              key={index}
              name={option.value}
              Icon={option.Icon}
              onConnect={() => {
                toast.warn("Tính năng này đang phát triển");
              }}
            />
          ))
        }
      </div>
    </div>
  );
};

export default SelectPOS;
