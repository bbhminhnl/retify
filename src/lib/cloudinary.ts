import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export async function uploadImage(file: File) {
  /**
   * Chuyển đổi file sang ArrayBuffer
   */
  const ARRAY_BUFFER = await file.arrayBuffer();

  /**
   * Chuyển đổi ArrayBuffer sang Buffer
   */
  const BUFFER = Buffer.from(ARRAY_BUFFER);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "food-menu" }, (error, result) => {
        if (error) reject(error);
        resolve(result?.secure_url);
      })
      .end(BUFFER);
  });
}
