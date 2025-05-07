"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useEffect } from "react";

export default function ConnectHandler({
  onComplete,
}: {
  onComplete?: (e?: string | undefined) => void;
}) {
  /** Router */
  const ROUTER = useRouter();
  /** SearchParams */
  const SEARCH_PARAMS = useSearchParams();

  useEffect(() => {
    /** Lấy Access Token từ URL */
    const ACCESS_TOKEN = SEARCH_PARAMS.get("access_token");

    /** Nếu có URL thì lưu vào Local Storage */
    if (ACCESS_TOKEN) {
      /** Xử lý token */
      localStorage.setItem("access_token", ACCESS_TOKEN);
      /** Xóa param từ URL */
      const NEW_PARAMS = new URLSearchParams(SEARCH_PARAMS.toString());
      /** Xoá params trong token */
      NEW_PARAMS.delete("access_token");
      /** Xoá params trong URL */
      ROUTER.replace(`?${NEW_PARAMS.toString()}`, { scroll: false });
      /**  Gọi callback khi hoàn thành*/
      onComplete?.(ACCESS_TOKEN);
    }
  }, [SEARCH_PARAMS, ROUTER, onComplete]);

  /** Component này không render UI */
  return null;
}
