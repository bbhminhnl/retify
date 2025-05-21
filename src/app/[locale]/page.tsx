import HomeLayout from "../home/Home";
import { useTranslations } from "next-intl";

export default function Home() {
  /** Lấy hàm dịch */
  const t = useTranslations();

  return (
    <div className="w-screen h-screen">
      <HomeLayout />
    </div>
  );
}
