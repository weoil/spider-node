import Spider, { createLogger } from "../src";
import { $get } from "../src/utils";
import Rules from "./modules/movie";
const logger = createLogger("douban");
type i_search_subjects = {
  subjects: [
    {
      title: string;
      cover: string;
      id: string;
      rate: string;
      is_new: boolean;
      playable: boolean;
      url: string;
    }
  ];
};

interface IPeople {
  name: string;
  uid: string;
}
interface IPlayDate {
  date: string;
  region: string;
}
interface IComment {
  date: Date;
  votes: number;
  rating: number;
  user: string;
  short: string;
}
interface IRatingWeight {
  rating: string;
  per: string;
}
const spider = new Spider({
  name: "douban",
  log: false,
  http: {
    encoding: "utf-8"
  },
  rules: [
    {
      test: /movie\.douban\.com\/j\/search_subjects\?.*/,
      config: {
        cacheTime: 0,
        include: false,
        http: {
          encoding: "utf-8"
        }
      },
      parse(url, data: i_search_subjects, $, config, spider) {
        // console.log(spider);
        if (data) {
          data.subjects.forEach((subject) => {
            logger.info(subject.title, subject);
            // console.log(subject.title, subject.cover, subject);
          });
        }
      }
    },
    {
      test: /movie\.douban\.com\/subject\/\d+/,
      config: {
        http: {
          encoding: "utf-8"
        },
        cacheTime: 18000
      },
      parse(url, data, $) {
        if (!$) {
          return;
        }
        const id = $get(url.match(/(\d+)/), "1", "");
        let poster: string[] = [];
        let title: string = "";
        let engTitle: string = "";
        let baseTitle = "";
        let alias: string[] = [];
        const directors: IPeople[] = []; // 导演
        const screenwriters: IPeople[] = []; // 编剧
        const performers: IPeople[] = [];
        const playdates: IPlayDate[] = [];
        let type = "other";
        const genres: string[] = [];
        let languages: string[] = [];
        let website = "";
        let runtime = "";
        let rating = "-";
        let ratingPeople = 0;
        let ratingWeight: IRatingWeight[] = [];
        let intro = "";
        let seasons: number[] = [];
        let episodes = 0;
        let currentSeason = 0;
        let duration = "";
        let regions = "";
        const comments: IComment[] = [];
        try {
          // 封面
          poster.push($("#mainpic > a.nbgnbg > img").attr("src"));
          poster.push($("a.bn-sharing").attr("data-pic"));
          // 标题
          title = $("title")
            .text()
            .replace("(豆瓣)", "")
            .trim();
          engTitle = $('#content h1>span[property="v:itemreviewed"]')
            .text()
            .replace(title, "")
            .trim();
          const spiltTitle = title.split(" ");
          if (spiltTitle.length) {
            baseTitle = spiltTitle[0];
          }
          // 评分
          rating = $(
            "#interest_sectl > div:nth-child(1) > div.rating_self.clearfix > strong"
          ).text();
          // 评分人数
          ratingPeople = Number(
            $(
              "#interest_sectl > div:nth-child(1) > div.rating_self.clearfix > div > div.rating_sum > a > span"
            ).text()
          );
          // 评分占比
          $("#interest_sectl > div:nth-child(1) > div.ratings-on-weight")
            .find(".item")
            .each((_, item) => {
              const $item = $(item);
              const rate = $item
                .find("span.starstop")
                .text()
                .replace(/ /g, "")
                .replace(/\n/g, "");
              const per = $item.find("span.rating_per").text();
              ratingWeight.push({
                per,
                rating: rate
              });
            });

          // 简介
          intro = $("#link-report > span")
            .text()
            .trim()
            .replace(/[ |　]/g, "")
            .replace(/\n\n/g, "\n");

          // info
          const info = $("#info");
          // 又名
          const hasAlias = info.find('span.pl:contains("又名")').length > 0;
          if (hasAlias) {
            const aliasStr = $get(info.text().match(/又名:(.*)/), "1", "");
            alias = aliasStr.split("/").map((a: string) => a.trim());
          }
          // 季数
          info.find("#season option").each((_, opt) => {
            const $opt = $(opt);
            const season = Number($opt.text());
            seasons.push(season);
            if ($opt.attr("selected")) {
              currentSeason = season;
            }
          });
          // 集数
          const episodesStr = $get(info.text().match(/集数:(.*)/), "1", "");
          episodes = Number(episodesStr.trim());
          // 单集时长
          const durationStr = $get(info.text().match(/单集片长:(.*)/), "1", "");
          duration = durationStr.trim();
          // 制作国家
          const regionsStr = $get(
            info.text().match(/制片国家\/地区:(.*)/),
            "1",
            ""
          );
          regions = regionsStr.trim();
          // 时长
          runtime = info.find("span[property='v:runtime']").text();
          // 语言
          if (info.find('span.pl:contains("语言")').length > 0) {
            const languageStr = $get(info.text().match(/语言:(.*)/), "1", "");
            languages = languageStr.split("/").map((a: string) => a.trim());
          }
          // 导演
          info
            .find('span.pl:contains("编剧")')
            .next(".attrs")
            .find("a")
            .each((i, aEl) => {
              const $aEl = $(aEl);
              const name = $aEl.text();
              const uid = $get($aEl.attr("href").match(/(\d+)/), "1", "");
              directors.push({
                uid,
                name
              });
            });
          // 编剧
          info
            .find('span.pl:contains("编剧")')
            .next(".attrs")
            .find("a")
            .each((i, aEl) => {
              const $aEl = $(aEl);
              const name = $aEl.text();
              const uid = $get($aEl.attr("href").match(/(\d+)/), "1", "");
              screenwriters.push({
                uid,
                name
              });
            });
          // 主演
          info
            .find('span.pl:contains("主演")')
            .next(".attrs")
            .find("span > a")
            .each((_, el) => {
              const $aEl = $(el);
              const name = $aEl.text();
              const uid = $get($aEl.attr("href").match(/(\d+)/), "1", "");
              performers.push({
                uid,
                name
              });
            });

          // 类型
          info
            .find('span.pl:contains("类型")')
            .nextAll("span[property='v:genre']")
            .each((_, el) => {
              const $aEl = $(el);
              const name = $aEl.text();
              genres.push(name);
            });
          // 官方网站
          website = info
            .find('span.pl:contains("官方网站")')
            .next('a[rel="nofollow"]')
            .text();
          // 主类型
          let isMovie = $("a.bn-sharing[data-type='电影']").length > 0;
          let isSeries = $("a.bn-sharing[data-type='电视剧']").length > 0;
          let isAnime =
            $("a[href='/tag/动画'], a[href='/tag/动漫']").length > 0;
          let isDocument =
            $('span[property="v:genre"]:contains("纪录片")').length > 0;
          if (isMovie) {
            type = "movie";
          } else if (isSeries) {
            type = "series";
          } else if (isAnime) {
            type = "anime";
          } else if (isDocument) {
            type = "document";
          }
          // 上映日期
          info.find('span[property="v:initialReleaseDate"]').each((_, el) => {
            const dateStr = $(el).text();
            const rg = dateStr.match(/(\d+-\d+-\d+)\((.*)\)/);
            const date = $get(rg, "1", dateStr);
            const region = $get(rg, "2", "");
            playdates.push({
              date,
              region
            });
          });
          // 短评
          $("#hot-comments>.comment-item").each((_, commentBlock) => {
            const $c = $(commentBlock);
            const user = $c.find("div > h3 > span.comment-info > a").text();
            const ratingStr = $c
              .find("div > h3 > span.comment-info > span.allstar50.rating")
              .attr("title");
            let r: number = 0;
            switch (ratingStr) {
              case "力荐":
                r = 5;
                break;
              case "推荐":
                r = 4;
                break;
              case "还行":
                r = 3;
                break;
              case "较差":
                r = 2;
                break;
              case "很差":
                r = 1;
            }
            let short = $c.find("div > p > span.short").text();
            let votes = Number(
              $c.find("div > h3 > span.comment-vote > span").text()
            );
            let date = new Date(
              $c
                .find("div > h3 > span.comment-info > span.comment-time")
                .attr("title")
            );
            comments.push({
              user,
              short,
              votes,
              date,
              rating: r
            });
          });
        } catch (err) {
          console.log(err);
        }
        // imdb
        let imdb = $("a[href^='http://www.imdb.com/title/tt']").attr("href");

        const douban = {
          id,
          title,
          engTitle,
          baseTitle,
          imdb,
          alias,
          seasons,
          currentSeason,
          duration,
          episodes,
          regions,
          directors,
          screenwriters,
          performers,
          playdates,
          type,
          genres,
          languages,
          website,
          runtime,
          rating,
          ratingPeople,
          ratingWeight,
          intro,
          comments
        };
        console.log(douban);
        const searchText = title.replace(/ /g, "");
        spider.push(
          `https://www.piaohua.com/plus/search.php?kwtype=0&keyword=${encodeURIComponent(
            searchText
          )}`,
          {
            meta: {
              id
            }
          }
        );
        spider.push(
          `http://www.msj1.com/?s=${encodeURIComponent(searchText)}`,
          {
            meta: {
              id
            }
          }
        );
        spider.push("https://www.inapian.com/index.php?s=vod-search", {
          method: "POST",
          formData: {
            wd: title,
            submit: "搜索"
          },
          meta: { id: 1 }
        });
      }
    },
    ...Rules
  ]
});

// spider.test(
//   "https://movie.douban.com/j/search_subjects?type=movie&tag=%E7%83%AD%E9%97%A8&sort=recommend&page_limit=20&page_start=40"
// );
spider.test(
  `https://movie.douban.com/subject/27019982/?tag=%E7%83%AD%E9%97%A8&from=gaia_video`
);
// spider.test(`https://www.inapian.com/v/35037.html`, { meta: { id: 1 } });
// spider.test(`https://www.inapian.com/index.php?s=vod-search`, {
//   method: "POST",
//   formData: {
//     wd: "少年派",
//     submit: "搜索"
//   },
//   meta: { id: 1 }
// });
// spider.test(`http://www.msj1.com/archives/7353.html`, {
//   meta: {
//     id: 10
//   }
// });
// spider.test(`https://www.piaohua.com/html/kehuan/2014/0605/28555.html`, {
//   meta: {
//     id: 10
//   }
// });
// spider.test(
//   `https://www.piaohua.com/plus/search.php?kwtype=0&keyword=${encodeURIComponent('我唾弃你的坟墓')}`,
//   {
//     meta: {
//       id:1
//     }
//   }
// );
// https://movie.douban.com/subject/30135113
