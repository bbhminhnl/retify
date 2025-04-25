"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useState } from "react";

import Highlight from "@tiptap/extension-highlight";
import { MOCK_DATA } from "@/utils/data";
import { Markdown } from "tiptap-markdown";
import MenuBar from "./MenuBar";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { useRouter } from "next/navigation";

/** Interface Product */
type Product = {
  /** ID sản phẩm */
  id: number;
  /** Tên sản phẩm */
  name: string;
  /** Giá sản phẩm */
  price: number;
  /** Hình ảnh sản phẩm */
  product_image: string;
  /** Loại sản phẩm */
  type: string;
  /** Đơn vị sản phẩm */
  cost: number;
};

const Tiptap = () => {
  /**
   * ROuter
   */
  const ROUTER = useRouter();
  /** State markdown */
  const [markdown, setMarkdown] = useState("");
  /** List sản phẩm */
  const [products, setProducts] = useState<Product[]>([]);
  /** State shop_info */
  const [shop_info, setShopInfo] = useState<string>("");

  /** Show connect to FB */
  const [show_connect, setShowConnect] = useState(false);

  /** Gọi API lấy sản phẩm và thông tin cửa hàng */
  useEffect(() => {
    const fetchData = async () => {
      try {
        /** Gọi API lấy sản phẩm và thông tin cửa hàng */
        const [productRes, shopRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/shop-info"),
        ]);
        /** Parse dũe liệu json */
        const PRODUCT_DATA = await productRes.json();
        const SHOP_DATA = await shopRes.json();
        /** Lưu dữ liệu state */
        setProducts(PRODUCT_DATA || []);
        setShopInfo(SHOP_DATA?.shop_information || "");
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    /** Nếu có sản phẩm hoặc thông tin cửa hàng thì gọi hàm processDocument */
    if (products.length > 0 || shop_info) {
      processDocument(products, shop_info);
    }
  }, [products, shop_info]);

  const processDocument = (item: Product[], shop: string) => {
    /** THông tin cửa hàng */
    const SHOP_INFO_BLOCK = shop ? `## 🏪 Thông tin cửa hàng\n${shop}` : "";
    console.log(shop, "shop");
    /** Danh sách sản phẩm */
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
    /** Thông tin base tài liệu */
    const EXISTING_DATA = typeof MOCK_DATA === "string" ? MOCK_DATA : "";
    /** Tổng hợp dữ liệu  */
    const UPDATED_DATA = [EXISTING_DATA, PRODUCT_BLOCK, SHOP_INFO_BLOCK]
      .filter(Boolean)
      .join("\n\n");
    /** Cập nhật dữ liệu */
    setMarkdown(UPDATED_DATA);
  };

  /** Khởi tạo editor */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: "list-disc pl-4" } },
        orderedList: { HTMLAttributes: { class: "list-decimal pl-4" } },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        HTMLAttributes: { class: "my-custom-class" },
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: "-",
        linkify: false,
        breaks: false,
      }),
    ],
    content: markdown,
    editorProps: {
      attributes: {
        class:
          "overflow-hidden overflow-y-auto px-3 py-2 prose prose-sm m-0 focus:outline-none bg-slate-50",
      },
    },
    onUpdate({ editor }) {
      const md = editor.storage.markdown.getMarkdown();
      setMarkdown(md);
    },
  });
  /** Khi editor khởi tạo xong thì cập nhật nội dung */
  useEffect(() => {
    if (editor && markdown) {
      editor.commands.setContent(markdown); // ✅ cập nhật content sau
    }
  }, [editor, markdown]);
  /** Hàm xử lý sự kiện khi nhấn nút lưu */
  const handleSave = () => {
    setShowConnect(true);
  };

  /** State accessToken*/
  const [access_token, setAccessToken] = useState("");
  /** Lấy Facebook Token */
  function getFacebookToken(event: MessageEvent) {
    /** Kiểm tra event có hợp lệ không */
    if (
      !event ||
      !event.data ||
      typeof event.data !== "object" ||
      event.data.from !== "FACEBOOK_IFRAME" ||
      event.data.event !== "LOGIN"
    ) {
      return;
    }
    /**
     * Lay response tu facebook
     */
    const FACEBOOK_RESPONSE = event.data.data;
    /** Kiểm tra token */
    if (FACEBOOK_RESPONSE?.authResponse?.accessToken) {
      /** Set token */
      setAccessToken(FACEBOOK_RESPONSE.authResponse.accessToken);
    }
  }
  useEffect(() => {
    /**
     * Add event listener
     */
    window.addEventListener("message", getFacebookToken);

    return () => {
      window.removeEventListener("message", getFacebookToken);
    };
    /** Chỉ chạy một lần khi component mount */
  }, []);
  useEffect(() => {
    if (access_token) {
      handleAddProductAndNavigate(access_token);
    }
  }, [access_token]);
  /**
   *  Hàm xử lý sự kiện khi nhấn nút thêm sản phẩm
   * @param e
   */
  const handleAddProductAndNavigate = async (access_token: string) => {
    /**
     * Thêm loading
     */

    /** Chuyển trang sau khi thành công */
    ROUTER.push("/connect?access_token=" + access_token);
    /** Sản phẩm mới */
    // const NEW_PRODUCT = products.map((product: any) => ({
    //   id: product.id,
    //   name: product.name,
    //   price: Number(product.price),
    //   product_image: `${product.image_url}`,
    //   type: "product",
    //   unit: product.unit,
    // }));

    // try {
    //   /**
    //    * Thêm sản phẩm mới vào danh sách sản phẩm
    //    */
    //   const RES = await fetch("/api/products", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     /** Gửi danh sách sản phẩm */
    //     body: JSON.stringify(NEW_PRODUCT),
    //   });
    //   /**
    //    * Kiểm tra xem có lỗi không
    //    */
    //   if (RES.ok) {
    //     console.log("Sản phẩm đã được thêm");
    //     /** Chuyển trang sau khi thành công */
    //     ROUTER.push("/connect?access_token=" + access_token);
    //   } else {
    //     console.error("Lỗi khi thêm sản phẩm");
    //   }
    // } catch (error) {
    //   console.error("Lỗi mạng hoặc server:", error);
    // } finally {
    //   // setLoading(false);
    // }
  };

  return (
    <div className="flex flex-col flex-grow min-h-0 h-full w-full overflow-hidden">
      {/* Editor cố định phía trên */}
      <div className=" py-2 bg-white">
        <div className="flex gap-x-2 w-full justify-between items-center">
          <MenuBar editor={editor} />
          {/* Nút lưu */}

          <button
            onClick={handleSave}
            className="h-10 px-4 flex-shrink-0 bg-blue-500 text-white rounded-md flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-600 "
          >
            <span className="text-sm font-semibold">Lưu</span>
          </button>
        </div>
        <EditorContent
          editor={editor}
          className="h-80 overflow-y-auto border border-black rounded-md bg-slate-50"
        />
      </div>
      {/* Markdown Preview scrollable */}
      <div className="flex-grow min-h-0 bg-gray-100 overflow-hidden rounded-lg overflow-y-auto p-4">
        <h2 className="font-bold">Markdown output:</h2>
        <pre className="text-sm whitespace-pre-wrap">{markdown}</pre>
      </div>
      {show_connect && (
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
      )}
    </div>
  );
};

export default Tiptap;
