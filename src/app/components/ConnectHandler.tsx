"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useEffect } from "react";

export default function ConnectHandler({
  onComplete,
}: {
  onComplete?: (e?: string | undefined) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");

    if (accessToken) {
      // Xử lý token
      localStorage.setItem("accessToken", accessToken);

      // Xóa param từ URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("access_token");
      router.replace(`?${newParams.toString()}`, { scroll: false });

      // Gọi callback khi hoàn thành
      onComplete?.(accessToken);
    }
  }, [searchParams, router, onComplete]);

  return null; // Component này không render UI
}
