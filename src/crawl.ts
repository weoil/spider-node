import { Spider as NSpider } from "../types/spider";
import Spider from "./spider";
export class Crawl {
  public static create(config: NSpider.Config): Spider {
    const s = new Spider(config);
    return s;
  }
}
export default Crawl;
