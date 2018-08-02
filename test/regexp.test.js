let t1 = setTimeout(() => {}, 1000)
let t3 = setTimeout(() => {}, 4000)
let t2 = setTimeout(() => {
  console.log("t1", t1)
  console.log("t2", t2)
  console.log("t3", t3)
}, 2000)
