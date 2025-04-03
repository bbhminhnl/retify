import ActionConnect from "./products/components/ActionConnect";
import ImageToJsonExtractor from "./components/ImageToJsonExtractor";
import MenuScanner from "./components/MenuScanner";
import Product from "./products/Products";
import VisionUploader from "./components/VisionUploader";

export default function Home() {
  return (
    <div className="flex flex-col gap-y-4 flex-grow min-h-screen">
      <ImageToJsonExtractor />
      {/* <VisionUploader /> */}
      <MenuScanner />

      <div className="overflow-hidden overflow-y-auto flex-grow">
        <Product />
      </div>
      <div className="sticky bottom-0 w-full bg-white shadow-md">
        <ActionConnect />
      </div>
    </div>
  );
}
