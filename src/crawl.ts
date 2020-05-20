import Spider from './spider';
import { ISpider } from '../types';
export class Crawl {
  public static create(config: ISpider.Config): Spider {
    const s = new Spider(config);
    return s;
  }
}
export default Crawl;
