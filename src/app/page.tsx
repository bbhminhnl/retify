import ActionConnect from "./products/components/ActionConnect";
import Product from "./products/Products";

export default function Home() {
  return (
    <div className="flex flex-col gap-y-4 flex-grow min-h-screen">
      <div className="overflow-hidden overflow-y-auto flex-grow">
        <Product />
      </div>
      <div className="sticky bottom-0 w-full bg-white shadow-md">
        <ActionConnect />
      </div>
    </div>
  );
}
