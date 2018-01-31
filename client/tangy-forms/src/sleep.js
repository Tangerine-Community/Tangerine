window.sleep = (ms) => new Promise((res, rej) => { 
  setTimeout(res, ms)
})