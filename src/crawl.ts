import Spider from './spider';
export class Crawl {
  public static create(config: Spider.Config): Spider {
    const s = new Spider(config);
    return s;
  }
}
export default Crawl;
