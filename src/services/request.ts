import { get } from 'lodash'
/**  Khai báo interface*/
interface IParams {
  /** đường dẫn của api */
  uri: string
  /** phương thức call api */
  method: string
  /** nội dung body */
  body?: any
  /** nội dung headers */
  headers?: any
}
/** Call api với
 * @param endpoint endpoint của api
 * @param method phương thức call api
 * @param body nội dung body
 * @param headers nội dung headers
 */
export async function request({ uri, method, body, headers }: IParams) {
  try {
    /**
     * Call api với method và body
     */
    const RESPONSE = await fetch(uri, {
      method,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })
    /**
     * Nếu status code khác 200 thì throw lỗi
     */
    const DATA = await RESPONSE.json()

    /** Check error thì throw data Nếu có mean*/
    if (DATA?.code !== 200 && DATA?.mean) throw DATA.mean
    /** data trả về lỗi thì throw data Nếu có message */
    if (DATA?.code !== 200 && DATA?.message) throw DATA.message
    /**
     * Trả về data
     */
    return DATA
  } catch (e) {
    console.log(e, 'eeee')
    throw (
      get(e, 'response.data.context_error.message') ||
      get(e, 'response.data.message') ||
      get(e, 'response.data') ||
      get(e, 'message') ||
      e
    )
  }
}
