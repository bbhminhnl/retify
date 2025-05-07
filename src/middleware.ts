import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
/** Tajo middle ware */
export default createMiddleware(routing);
/**
 * Tạo matcher cho middleware
 */
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
