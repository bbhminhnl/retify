import Clover from "@/assets/icons/clover.svg";
import ConnectChannel from "../step2/ConnectChannel";
import Download from "./Download";
import Facebook from "@/assets/icons/facebook.svg";
import Instagram from "@/assets/icons/instagram.svg";
import QR from "@/assets/icons/QR.svg";
import React from "react";
import Shopify from "@/assets/icons/shopify.svg";
import Tiktok from "@/assets/icons/tiktok.svg";
import Website from "@/assets/icons/website.svg";
import Whatsapp from "@/assets/icons/whatsapp.svg";
import { toast } from "react-toastify";

/**
 * Dư liệu POS
 */
const POS_OPTION = [
  {
    value: "Facebook",
    label: "Facebook",
    Icon: Facebook,
  },
  {
    value: "Instagram",
    label: "Instagram",
    Icon: Instagram,
  },
  {
    value: "Tiktok",
    label: "Tiktok",
    Icon: Tiktok,
  },
  {
    value: "Whatsapp",
    label: "Whatsapp",
    Icon: Whatsapp,
  },
  {
    value: "Website",
    label: "Website",
    Icon: Website,
  },
  {
    value: "QR",
    label: "QR",
    Icon: QR,
  },
];
const LaunchAI = () => {
  return (
    <div>
      <div className="flex flex-col gap-3">
        {
          /** Render list option */
          POS_OPTION.map((option, index) => (
            <div key={index}>
              {option.value !== "QR" && (
                <ConnectChannel
                  key={index}
                  name={option.value}
                  Icon={option.Icon}
                  onConnect={() => {
                    toast.warn("Tính năng này đang phát triển");
                  }}
                />
              )}
              {option.value === "QR" && (
                <Download
                  name="QR"
                  Icon={option.Icon}
                  onConnect={() => {
                    toast.warn("Tính năng này đang phát triển");
                  }}
                />
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default LaunchAI;
