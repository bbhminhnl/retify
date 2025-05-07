import MainLayout from "../create-company-process/MainLayout";
import { useTranslations } from "next-intl";

export default function Home() {
  /** Lấy hàm dịch */
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-y-4 flex-grow min-h-0 h-screen md:p-4 bg-red-50 overflow-hidden overflow-y-auto">
      <MainLayout />
    </div>
  );
}
