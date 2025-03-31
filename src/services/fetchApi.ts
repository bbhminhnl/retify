/** Fetch api
 * @param url
 * @param method
 * @param body
 * @param headers
 * @returns Data
 */
export const fetchApi = async (
  url: string,
  method = "POST",
  body: {},
  headers: {}
) => {
  /**
   * fetch data
   */
  const RES = await fetch(url, {
    method: method,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  /** Trả về data json */
  return RES.json();
};
