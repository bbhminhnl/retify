import { useEffect, useRef, useState } from "react";

import { IProductItem } from "@/types";
import InputField from "./InputField";
import { X } from "lucide-react";
import { simpleUUID } from "@/utils";

interface AddProductModalProps {
  /**
   * Open modal
   */
  open: boolean;
  /** Hàm đóng modal */
  onClose: () => void;
  /** Hàm confirm */
  onSubmit: (product: {
    /** ID sản phẩm */
    id: string;
    /** Tên sản phẩm */
    name: string;
    /** Giá sản phẩm */
    price: number;
    /** Đơn vị tiền tệ */
    unit: string;
    /** Hình anh */
    image_url?: string | File | null;
  }) => void;
  /** Sản phẩm edit */
  product: IProductItem;
  /** Type */
  type: string;
}

export default function AddProductModal({
  open,
  onClose,
  onSubmit,
  product,
  type = "add",
}: AddProductModalProps) {
  /** Tên sản phẩm */
  const [name, setName] = useState("");
  /** Giá sản phẩm */
  const [price, setPrice] = useState<number | string>(0);
  /** Đơn vị tiền tệ */
  const [unit, setUnit] = useState("VND");
  /** File upload */
  const [image_file, setImageFile] = useState<File | null>(null);
  /** Hình anh preview */
  const [image_preview, setImagePreview] = useState<string | null>(null);
  /** Lỗi */
  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    unit?: string;
  }>({});

  const FILE_INPUT_REF = useRef<HTMLInputElement>(null);

  const handleChooseImage = () => {
    FILE_INPUT_REF.current?.click();
  };
  /** Cập nhật giá trị */
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setPrice(product.price || 0);
      setUnit(product.unit || "VND");
      setImagePreview(product.product_image || null);
    }
  }, [product]);

  /** Hàm thay đổi hình ảnh
   * @param e Sự kiện thay đổi input
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  /**
   * Hàm validate
   * @returns
   */
  const validate = () => {
    /** Lỗi */
    const NEW_ERRORS: typeof errors = {};
    /** Kiểm tra tên sản phẩm */
    if (!name.trim()) {
      NEW_ERRORS.name = "Tên sản phẩm không được để trống.";
    }
    /** Kiểm tra giá */
    if (isNaN(Number(price)) || Number(price) <= 0) {
      NEW_ERRORS.price = "Giá phải là số lớn hơn 0.";
    }
    /** Kiểm tra đơn vị */
    if (!unit.trim() || !/^[a-zA-Z0-9]+$/.test(unit)) {
      NEW_ERRORS.unit = "Đơn vị chỉ được chứa chữ và số, không khoảng trắng.";
    }
    /** Set lỗi */
    setErrors(NEW_ERRORS);
    /** Nếu khöng có lỗi thì trả về true */
    return Object.keys(NEW_ERRORS).length === 0;
  };
  /** Kiểm tra open */
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Thêm sản phẩm</h2>
          <div
            onClick={onClose}
            color="#000"
            className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
          >
            <X className="size-5" />
          </div>
        </div>

        <InputField
          label="Tên sản phẩm"
          value={name}
          onChange={setName}
          placeholder="Nhập tên sản phẩm"
          error={errors.name}
        />

        <InputField
          label="Giá"
          value={price}
          onChange={(val) => setPrice(val)}
          type="number"
          placeholder="Nhập giá"
          error={errors.price}
        />

        <InputField
          label="Đơn vị"
          value={unit}
          onChange={setUnit}
          placeholder="Nhập đơn vị"
          error={errors.unit}
        />

        {/* <div>
          <label className="block mb-1 font-medium">Ảnh sản phẩm</label>
          <button
            type="button"
            onClick={handleChooseImage}
            className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 cursor-pointer"
          >
            Chọn ảnh
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-2 max-h-40 rounded object-contain border"
            />
          )}
        </div> */}

        <div className="flex justify-end space-x-2 pt-2 text-sm">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
          >
            Huỷ
          </button>
          <button
            onClick={() => {
              if (validate()) {
                onSubmit({
                  id: product.id || simpleUUID(),
                  name,
                  price: Number(price),
                  unit,
                  //   image_url: imagePreview || imageFile,
                });
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
