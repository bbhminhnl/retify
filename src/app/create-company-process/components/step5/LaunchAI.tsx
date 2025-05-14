import ConnectChannel from "../step2/ConnectChannel";
import Download from "./Download";
import Facebook from "@/assets/icons/facebook.svg";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import IFacebook from "@/assets/icons/IFacebook.svg";
import IInstagram from "@/assets/icons/IInstagram.svg";
import ITiktok from "@/assets/icons/ITiktok.svg";
import IWhatsapp from "@/assets/icons/IWhatsapp.svg";
import Instagram from "@/assets/icons/icons8-instagram-logo.svg";
import QR from "@/assets/icons/QR.svg";
import Tiktok from "@/assets/icons/tiktok.svg";
// import Website from "@/assets/icons/website.svg";
import Website from "@/assets/images/Website.png";
import Whatsapp from "@/assets/icons/whatsapp.svg";
import { set } from "lodash";
import { toast } from "react-toastify";
import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Dư liệu POS
 */
const POS_OPTION = [
  // {
  //   value: "Facebook",
  //   label: "Facebook",
  //   Icon: IFacebook,
  // },
  // {
  //   value: "Instagram",
  //   label: "Instagram",
  //   Icon: Instagram,
  // },
  // {
  //   value: "Tiktok",
  //   label: "Tiktok",
  //   Icon: ITiktok,
  // },
  // {
  //   value: "Whatsapp",
  //   label: "Whatsapp",
  //   Icon: IWhatsapp,
  // },
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
  /** qr code */
  qr_code?: string;
  /** page_id */
  page_id?: string;
}

const LaunchAI = ({
  onConnect,
  loading,
  qr_code,
  page_id,
}: ConnectChannelProps) => {
  /** Đa ngôn ngữ */
  const t = useTranslations();
  /** select channel */
  const [selected_channel, setSelectedChannel] = useState<string>("");

  return (
    <div>
      <div className="flex flex-col gap-3">
        {/* <div className=" items-center justify-center h-12 w-full sticky bottom-0 hidden md:flex">
          <div className="h-10 w-80">
            <iframe
              loading="lazy"
              className="relative z-[2] w-full h-full"
              src='https://botbanhang.vn/cross-login-facebook?app_id=1282108599314861&amp;option={"return_scopes":true,"auth_type":"rerequest","enable_profile_selector":true,"scope":"public_profile,pages_show_list,pages_read_engagement,pages_messaging,email,pages_read_user_content,instagram_manage_comments,instagram_manage_insights,business_management,ads_management,read_insights,pages_manage_metadata,pages_manage_ads,pages_manage_posts,pages_manage_engagement,page_events"}&amp;text=Tiếp tục với Facebook&amp;btn_style=display%3Aflex%3Bjustify-content%3Acenter%3Bwidth%3A100%25%3Bheight%3A100%25%3Balign-items%3Acenter%3Bgap%3A0.5rem%3Bbackground-color%3A%23f1f5f9%3Bborder-radius%3A0.375rem%3Bcolor%3A%230f172a%3Bfont-size%3A16px%3Bfont-weight%3A500%3Bborder-color%3A%23e2e8f0%3Bborder-width%3A1px'
              frameBorder="none"
            ></iframe>
          </div>
        </div> */}
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
                      toast.warn(t("feature_not_available"));
                    }
                  }}
                  loading={loading}
                  selected={selected_channel === option.value}
                  btn_text={t("copy")}
                  page_id={page_id}
                />
              )}
              {option.value === "QR" && (
                <Download
                  name="QR"
                  Icon={option.Icon}
                  onConnect={() => {
                    toast.warn(t("feature_not_available"));
                  }}
                  src={qr_code}
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
