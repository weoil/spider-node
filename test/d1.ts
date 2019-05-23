import Spider from '../src/spider';
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
const spider = new Spider({
  rules: [
    {
      test: /movie\.douban\.com\/j\/search_subjects\?.*/,
      config: {
        cacheTime: 0,
        include: false,
        http: {
          encoding: 'utf-8'
        }
      },
      parse(url, data: i_search_subjects, $, config,spider) {
        console.log(spider)
        if (data) {
          data.subjects.forEach(subject => {
            console.log(subject.title, subject.cover, subject);
          });
        }
      }
    }
  ]
});

spider.test(
  'https://movie.douban.com/j/search_subjects?type=movie&tag=%E7%83%AD%E9%97%A8&sort=recommend&page_limit=20&page_start=40'
);
