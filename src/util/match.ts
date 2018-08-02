export function testExist(reg: RegExp | Array<RegExp>, str: string) {
  let regs = Array.isArray(reg) ? reg : [reg]
  for (let r of regs) {
    if (r.test(str)) {
      return true
    }
  }
  return false
}
