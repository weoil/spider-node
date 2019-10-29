import spider from '../src';

const s = new spider({
  name: 'test',
  keep: true,
  rules: [
    {
      test: /https:\/\/fac\.newbanker\.cn\/gene\/api\/v1\/mini\/article\/.*\/cache/,
      async parse(url, data, $, config, spider) {},
      error(url, error) {},
    },
  ],
});

s.start([
  `https://fac.newbanker.cn/gene/api/v1/mini/article/2c9380836db00695016dc5f110e11c9b/cache`,
  `https://fac.newbanker.cn/gene/api/v1/mini/article/2c9380836db00695016dc5f110e11c9b/cache`,
]);
