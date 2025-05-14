function ChatEmbedCode() {
  let PAGE_ID: "";
  /** Code snippet to display */
  const CODE_SNIPPET = `
<script src="https://sdk.retify.ai/dist/sdk.min.js"></script> <script
id="" data-nscript="afterInteractive">
Retify.init({ page_id: '4aa9fb0c619f42bc94240a4d441ba654', }); 
</script>
  `;

  return (
    <div className="flex text-left gap-y-2.5 w-full h-fit">
      <pre className="bg-slate-200 px-3 rounded">
        <code className="text-[10px] text-left h-fit">{CODE_SNIPPET}</code>
      </pre>
    </div>
  );
}

export default ChatEmbedCode;
