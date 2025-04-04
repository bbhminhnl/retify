import ActionConnect from "./products/components/ActionConnect";
// import CallWebhook from "./components/CallWebhook";
import ImageToJsonExtractor from "./components/ImageToJsonExtractor";
import ImageUploader from "./components/ImageUploader";
import MenuProcessor from "./components/MenuProcessor";
import MenuScanner from "./components/MenuScanner";
import Product from "./products/Products";
import VisionUploader from "./components/VisionUploader";

export default function Home() {
  return (
    <div className="flex flex-col gap-y-4 flex-grow min-h-screen">
      {/* <MenuScanner /> */}

      <ImageUploader />

      {/* Cắm component vào */}
      {/* <div className="overflow-hidden overflow-y-auto flex-grow">
        <Product />
      </div> */}
    </div>
  );
}
