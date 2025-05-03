/** Kiểu dữ liệu */
interface AddProductModalProps {
  /** Trạng thái open */
  open: boolean;
  /** Hàm đóng */
  onClose: () => void;
  /** Hàm submit */
  onSubmit: () => void;
}

export default function DeleteProduct({
  open,
  onClose,
  onSubmit,
}: AddProductModalProps) {
  /**
   * Trạng thái open
   */
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-center">Xoá sản phẩm</h2>
        <h4 className="text-base font-medium">
          Xác nhận xoá sản phẩm, Hành động này không thể hoàn tác
        </h4>
        <div className="flex justify-center space-x-2 pt-2 text-sm">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
          >
            Huỷ
          </button>
          <button
            onClick={() => {
              onSubmit();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
