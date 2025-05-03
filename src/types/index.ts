/** Thông tin Ảnh */
type PictureData = {
  /** Chiều cao */
  height: number;
  /** Dạng Ảnh */
  is_silhouette: boolean;
  /**
   * Link
   */
  url: string;
  /** Độ rông */
  width: number;
};

/** Kiểu dữ liệu ảnh */
type Picture = {
  data: PictureData;
};
/** THông tin page */
export type UserProfile = {
  /**
   * Id
   */
  id: string;
  /** Tên page */
  name: string;
  /** ảnh */
  picture: Picture;
};
/** Interface Product */
export type IProductItem = {
  /** ID sản phẩm */
  id?: string;
  /** Tên sản phẩm */
  name?: string;
  /** Giá sản phẩm */
  price?: number | string | undefined;
  /** Hình anh sản phẩm */
  product_image?: string;
  /** Loại sản phẩm */
  type?: string;
  /** Đơn vi tìm giá */
  unit?: string;
};
