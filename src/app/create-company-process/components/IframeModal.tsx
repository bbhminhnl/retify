import React from "react";
const IframeModal = ({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-[90vw] h-[90vh] relative">
        <iframe
          src={url}
          className="w-full h-full rounded-xl"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 px-4 py-2 bg-red-600 text-white rounded"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
export default IframeModal;
