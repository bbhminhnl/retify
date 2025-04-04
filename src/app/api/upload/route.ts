import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: Request) {
  /**
   * Lấy dữ liệu từ formData
   */
  const FORM_DATA = await req.formData();
  /**
   * Lấy file từ formData
   */
  const FILE = FORM_DATA.get("file") as File;
  /**
   * Kiểm tra xem file có tồn tại không
   */
  if (!FILE)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  /**
   * Nếu có File thì tiến hành upload
   */
  try {
    /**
     * Upload file lên Cloudinary
     */
    const URL = await uploadImage(FILE);
    /**
     * Trả về URL
     */
    return NextResponse.json({ url: URL });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
