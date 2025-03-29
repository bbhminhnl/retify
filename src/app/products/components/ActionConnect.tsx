import Link from "next/link";
import React from "react";

const ActionConnect = () => {
  return (
    <div className="flex items-center justify-center h-12">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <Link href="/connect" className="text-white">
          Kết nối và cài đặt
        </Link>
      </button>
    </div>
  );
};

export default ActionConnect;
