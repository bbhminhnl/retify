import { copyToClipboard } from "@/utils";
import { useEffect } from "react";

function ChatEmbedCode({
  on_copy,
  setOnCopy,
  page_id,
}: {
  /**
   * trạng thái copy
   */
  on_copy: boolean;
  /**
   * Hàm set trạng thái copy
   * @param on_copy
   * @returns
   */
  setOnCopy: (on_copy: boolean) => void;
  /**
   * page_id
   */
  page_id?: string;
}) {
  /**
   * Hàm copy code snippet
   */
  useEffect(() => {
    if (on_copy) {
      /**
       * Sao chép code snippet
       */
      copyToClipboard(CODE_SNIPPET);
      /** Update trạng thái */
      setOnCopy(false);
    }
  }, [on_copy]);

  /** Code snippet to display */
  const CODE_SNIPPET = `<script src="https://sdk.retify.ai/dist/sdk.min.js"></script> <script
id="" data-nscript="afterInteractive">
Retify.init({ page_id: ${page_id} }); 
</script>`;

  return (
    <div className="flex text-left gap-y-2.5 w-full h-fit">
      <pre className="bg-slate-200 p-3 rounded">
        <code className="text-[10px] text-left h-fit tracking-tighter">
          {CODE_SNIPPET}
        </code>
      </pre>
    </div>
  );
}

export default ChatEmbedCode;
