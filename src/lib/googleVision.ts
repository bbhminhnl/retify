import { ImageAnnotatorClient } from "@google-cloud/vision";

let visionClient: ImageAnnotatorClient;

export function getVisionClient() {
  if (!visionClient) {
    visionClient = new ImageAnnotatorClient({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS || "{}"),
    });
  }
  return visionClient;
}
