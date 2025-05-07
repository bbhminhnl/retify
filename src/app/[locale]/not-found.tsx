import { useTranslations } from "next-intl";

export default function NotFound() {
  /** Hàm dịch */
  const t = useTranslations();

  return (
    <div>
      <h1>404 - {t("notFound")}</h1>
    </div>
  );
}
