let Axios = require("axios")
let iconvLite = require("iconv-lite")
async function get(url) {
  return await Axios({
    url: url,
    proxy: {
      host: "127.0.0.1",
      port: 1080
    },
    method: "post",
    responseType: "arraybuffer"
  })
}
async function test() {
  let res = await get("http://t66y.com")
  let r = iconvLite.decode(res.data, "gb2312")
  console.log(res, r)
}
test()
