import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/** Tajo middle ware */
export default createMiddleware(routing);
/**
 * Tạo matcher cho middleware
 */
// export const config = {
//   matcher: [
//     "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|gif|svg|ico)).*)",
//   ],
// };
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|c/.*|.*\\.(?:png|jpg|jpeg|gif|svg|ico)).*)",
  ],
};
