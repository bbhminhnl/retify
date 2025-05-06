"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useState } from "react";

import FacebookLoginButton from "../FacebookLoginButton";
import Highlight from "@tiptap/extension-highlight";
import Loading from "../loading/Loading";
import { MOCK_DATA } from "@/utils/data";
import { Markdown } from "tiptap-markdown";
import MenuBar from "./MenuBar";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";

/**
 * type sản phẩm
 */
type Product = {
  /** ID */
  id: number;
  /** Tên sản phẩm */
  name: string;
  /** Giá sản phẩm */
  price: number;
  /** Hình ảnh sản phẩm */
  product_image: string;
  /** Loại sản phẩm */
  type: string;
  /** Giá sản phẩm */
  cost: number;
};

const Tiptap = ({
  handleFinishEditor,
}: {
  /**
   *  Hàm xuất lý khi hoàn thành bài viet
   * @param status "success" | "fail"
   * @returns
   */
  handleFinishEditor: (status: string) => void;
}) => {
  /** Router */
  const ROUTER = useRouter();
  /** Markdown*/
  const [markdown, setMarkdown] = useState("");
  /** Nội dung markdown */
  const [internal_markdown, setInternalMarkdown] = useState("");
  /** Danh sách sản phẩm */
  const [products, setProducts] = useState<Product[]>([]);
  /** Shop info */
  const [shop_info, setShopInfo] = useState<string>("");
  /** Hiển thị kết nối */
  const [show_connect, setShowConnect] = useState(false);
  /** Access token */
  const [access_token, setAccessToken] = useState("");
  /** Loading */
  const [loading, setLoading] = useState(false);

  /** Debounce hàm save để tránh gọi API quá nhiều lần
   *
   */
  const debouncedSave = useCallback(
    debounce(async (content: string) => {
      await fetch("/api/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
    }, 1000),
    []
  );

  /** Khởi tạo editor */
  const editor = useEditor({
    extensions: [
      /** Extension node, markdown có sẵn */
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: "list-disc pl-4" } },
        orderedList: { HTMLAttributes: { class: "list-decimal pl-4" } },
      }),
      /** Custom text Align */
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      /** Custom highlight */
      Highlight.configure({
        HTMLAttributes: { class: "my-custom-class" },
      }),
      /** Custom markdown */
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: "-",
        linkify: false,
        breaks: false,
      }),
    ],
    content: internal_markdown,
    editorProps: {
      attributes: {
        class:
          "overflow-hidden overflow-y-auto px-3 py-2 prose prose-sm m-0 focus:outline-none bg-slate-50 text-left",
      },
    },
    /** Hàm update */
    onUpdate({ editor }) {
      /** Giá trị markdown */
      const MD = editor.storage.markdown.getMarkdown();
      /** Lưu vào state */
      setInternalMarkdown(MD);
      /** Lưu markdown vào state */
      setMarkdown(MD);
      /** Lưu markdown vào server */
      debouncedSave(MD);
    },
  });

  /** Gọi API lấy dữ liệu ban đầu */
  useEffect(() => {
    const fetchData = async () => {
      try {
        /** Gọi API lấy dữ liệu sản phẩm và shop info */
        const [productRes, shopRes] = await Promise.all([
          fetch(`/api/products`, {
            headers: { "Cache-Control": "no-store" },
          }),
          fetch(`/api/shop-info`, {
            headers: { "Cache-Control": "no-store" },
          }),
        ]);

        /** Parse Sản phẩm */
        const PRODUCT_DATA = await productRes.json();
        /** Parse thông tin shop */
        const SHOP_DATA = await shopRes.json();

        /** Lưu lại data Product */
        setProducts(PRODUCT_DATA || []);
        /** Lưu lại thông tin shop */
        setShopInfo(SHOP_DATA?.shop_information || "");
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      }
    };

    fetchData();
  }, []);

  /** Xử lý khi có dữ liệu sản phẩm hoặc shop info thay đổi */
  useEffect(() => {
    /** Nếu có dữ liệu sản phẩm hoặc thông tin shop thì tạo nội dung markdown */
    if (products.length > 0 || shop_info) {
      /**Xử lý dữ liệu */
      processDocument(products, shop_info);
    }
  }, [products, shop_info]);

  /** Xử lý đồng bộ dữ liệu từ ngoài vào editor */
  useEffect(() => {
    if (editor && markdown) {
      /** Lưu giá trị Markdown hiện tại */
      const CURRENT_MARKDOWN = editor.storage.markdown.getMarkdown();
      /** Nếu editor đã được khởi tạo và markdown khác với giá trị hiện tại trong editor */
      if (CURRENT_MARKDOWN !== markdown) {
        /** Lưu trạng thái selection hiện tại */
        const SELECTION = editor.state.selection;
        /** Lưu trạng thái focus của editor */
        const IS_FOCUSED = editor.isFocused;

        /** Cập nhật nội dung */
        editor.commands.setContent(markdown);

        /** Khôi phục selection nếu editor đang focus */
        if (IS_FOCUSED) {
          /** Lưu giá trị content Size */
          const DOC_SIZE = editor.state.doc.content.size;
          /** Nếu editor đang focus thì khôi phục selection */
          editor.commands.setTextSelection({
            from: Math.min(SELECTION.from, DOC_SIZE),
            to: Math.min(SELECTION.to, DOC_SIZE),
          });
        }
      }
    }
  }, [editor, markdown]);

  /** Hàm xử lý tạo nội dung markdown từ dữ liệu
   * @param item Danh sách sản phẩm
   * @param shop Thông tin cửa hàng
   */
  const processDocument = (item: Product[], shop: string) => {
    /** Thông tin cửa hàng */
    const SHOP_INFO_BLOCK = shop ? `## 🏪 Thông tin cửa hàng\n${shop}` : "";
    /** THông tin Sản phẩm */
    const PRODUCT_BLOCK =
      item.length > 0
        ? `${item
            .map(
              (product) =>
                `- **${product.name}**: ${product.price.toLocaleString(
                  "vi-VN"
                )} đ`
            )
            .join("\n")}`
        : "";
    /** Lấy dữ liệu từ Mock data */
    const EXISTING_DATA = typeof MOCK_DATA === "string" ? MOCK_DATA : "";
    /** Cập nhật Thông tin sản phẩm và Thông tin Shop */
    const UPDATED_DATA = [EXISTING_DATA, PRODUCT_BLOCK, SHOP_INFO_BLOCK]
      .filter(Boolean)
      .join("\n\n");

    /** Cập nhật cả markdown và internal_markdown */
    setMarkdown(UPDATED_DATA);
    /** Cập nhật nội dung editor */
    setInternalMarkdown(UPDATED_DATA);
  };

  /** Hàm xử lý khi nhấn nút lưu */
  const handleSave = async () => {
    /** Nếu editor đã được khởi tạo */
    if (editor) {
      const MD = editor.storage.markdown.getMarkdown();
      console.log(MD, "MDDDD");
      if (!MD) {
        alert("Vui lòng nhập nội dung trước khi lưu");
        setShowConnect(false);
        return;
      }

      setLoading(true);
      await fetch("/api/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(MD),
      });
      setTimeout(() => {
        // setShowConnect(true);
        handleFinishEditor("editor_success");
        setLoading(false);
      }, 1000);
    }
  };

  /** Xử lý message từ Facebook
   * @param event SSO
   */
  function getFacebookToken(event: MessageEvent) {
    if (
      !event ||
      !event.data ||
      typeof event.data !== "object" ||
      event.data.from !== "FACEBOOK_IFRAME" ||
      event.data.event !== "LOGIN"
    ) {
      return;
    }
    /** RESPONSE từ facebook */
    const FACEBOOK_RESPONSE = event.data.data;
    /** Nếu có access token thì lưu vào state */
    if (FACEBOOK_RESPONSE?.authResponse?.accessToken) {
      /** Lưu vào state */
      setAccessToken(FACEBOOK_RESPONSE.authResponse.accessToken);
    }
  }
  /** Lầy token facebook */
  useEffect(() => {
    window.addEventListener("message", getFacebookToken);
    return () => {
      window.removeEventListener("message", getFacebookToken);
    };
  }, []);

  useEffect(() => {
    /** Nếu có access token thì điều hướng đến trang kết nối */
    if (access_token) {
      handleAddProductAndNavigate(access_token);
    }
  }, [access_token]);

  const handleAddProductAndNavigate = async (access_token: string) => {
    ROUTER.push("/connect?access_token=" + access_token);
  };

  return (
    <div className="flex flex-col flex-grow min-h-0 h-full w-full overflow-hidden">
      <div className="py-2 w-full ">
        <div className="flex gap-x-2 w-full justify-between items-center">
          <MenuBar editor={editor} />
          <button
            onClick={handleSave}
            className="h-10 px-4 flex-shrink-0 bg-blue-500 text-white rounded-md flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-600"
          >
            <span className="text-sm font-semibold">Lưu</span>
            {loading && <Loading color_white />}
          </button>
        </div>

        <EditorContent
          editor={editor}
          className="h-80 overflow-y-auto border border-black rounded-md bg-slate-50"
        />
      </div>
      <div className="hidden md:flex flex-col flex-grow min-h-0 bg-gray-100 overflow-hidden rounded-lg overflow-y-auto p-4 text-left">
        <h2 className="font-bold">Tài liệu hiển thị:</h2>
        <pre className="text-sm whitespace-pre-wrap">{markdown}</pre>
      </div>
      {/* {show_connect && (
        <div className="flex items-center justify-center h-12 w-full sticky bottom-0">
          <div className="h-10 w-80">
            <iframe
              loading="lazy"
              className="relative z-[2] w-full h-full"
              src='https://botbanhang.vn/cross-login-facebook?app_id=1282108599314861&amp;option={"return_scopes":true,"auth_type":"rerequest","enable_profile_selector":true,"scope":"public_profile,pages_show_list,pages_read_engagement,pages_messaging,email,pages_read_user_content,instagram_manage_comments,instagram_manage_insights,business_management,ads_management,read_insights,pages_manage_metadata,pages_manage_ads,pages_manage_posts,pages_manage_engagement,page_events"}&amp;text=Tiếp tục với Facebook&amp;btn_style=display%3Aflex%3Bjustify-content%3Acenter%3Bwidth%3A100%25%3Bheight%3A100%25%3Balign-items%3Acenter%3Bgap%3A0.5rem%3Bbackground-color%3A%23f1f5f9%3Bborder-radius%3A0.375rem%3Bcolor%3A%230f172a%3Bfont-size%3A16px%3Bfont-weight%3A500%3Bborder-color%3A%23e2e8f0%3Bborder-width%3A1px'
              frameBorder="none"
            ></iframe>
          </div>
        </div>
      )} */}
      {/* <div className="p-4">
        <FacebookLoginButton />
      </div> */}
    </div>
  );
};

export default Tiptap;
