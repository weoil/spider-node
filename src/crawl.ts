import { ISpider } from '../types/spider'
import Spider from './spider'
class Crawl {
  public static create(config: ISpider.Config): Spider {
    const s = new Spider(config)
    return s
  }
}
export default Crawl
