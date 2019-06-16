import { Config } from '../types/spider'
import Spider from './spider'
export class Crawl {
  public static create(config: Config): Spider {
    const s = new Spider(config)
    return s
  }
}
export default Crawl
