export function get(path: string, obj: any): any {
  const paths = path.split('.')
  let val = obj
  for (let i of paths) {
    let tmp = val[i]
    if (tmp) {
      val = tmp
    } else {
      return null
    }
  }
  return val
}

export function handlerJSONP(data: any) {
  data
    .replace(/\\"/g, '"')
    .replace(/"\{/g, '{')
    .replace(/\}"/g, '}')
    .replace(/"\[/g, '[')
    .replace(/\]"/g, ']')
  // console.log(data)
  const rdata = JSON.parse(data)
  return rdata
}