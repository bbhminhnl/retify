import ConnectChannel from "../step2/ConnectChannel";
import Download from "./Download";
import Facebook from "@/assets/icons/facebook.svg";
import IFacebook from "@/assets/icons/IFacebook.svg";
import IInstagram from "@/assets/icons/IInstagram.svg";
import ITiktok from "@/assets/icons/ITiktok.svg";
import IWhatsapp from "@/assets/icons/IWhatsapp.svg";
import Instagram from "@/assets/icons/instagram.svg";
import QR from "@/assets/icons/QR.svg";
import Tiktok from "@/assets/icons/tiktok.svg";
import Website from "@/assets/icons/website.svg";
import Whatsapp from "@/assets/icons/whatsapp.svg";
import { set } from "lodash";
import { toast } from "react-toastify";
import { useState } from "react";

/**
 * Dư liệu POS
 */
const POS_OPTION = [
  {
    value: "Facebook",
    label: "Facebook",
    Icon: IFacebook,
  },
  {
    value: "Instagram",
    label: "Instagram",
    Icon: IInstagram,
  },
  {
    value: "Tiktok",
    label: "Tiktok",
    Icon: ITiktok,
  },
  {
    value: "Whatsapp",
    label: "Whatsapp",
    Icon: IWhatsapp,
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

/**
 * Kiểu dữ liệu connect channel
 */
interface ConnectChannelProps {
  /** Hàm két nối với channel */
  onConnect?: () => void;
  /** Loading */
  loading?: boolean;
}

const LaunchAI = ({ onConnect, loading }: ConnectChannelProps) => {
  /** select channel */
  const [selected_channel, setSelectedChannel] = useState<string>("");

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
                    if (option.value === "Facebook") {
                      onConnect?.();
                      setSelectedChannel(option.value);
                    } else {
                      toast.warn("Tính năng này đang phát triển");
                    }
                  }}
                  loading={loading}
                  selected={selected_channel === option.value}
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
