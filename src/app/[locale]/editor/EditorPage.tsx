import Tiptap from "@/components/Rich-Text-Editor/Tiptap";

const EditorPage = ({
  handleFinishEditor,
  step,
}: {
  handleFinishEditor: (status: string) => void;
  step: number;
}) => {
  return (
    <div className="md:container md:mx-auto flex flex-col gap-y-4 flex-grow min-h-0 h-full justify-center items-center w-full">
      {/* <h1 className="text-2xl font-bold">Chỉnh sửa thông tin tài liệu</h1> */}
      {/* <MarkdownEditor /> */}
      <div className="overflow-hidden overflow-y-auto flex-grow min-h-0 w-full">
        <Tiptap handleFinishEditor={handleFinishEditor} step={step} />
      </div>
    </div>
  );
};
export default EditorPage;
