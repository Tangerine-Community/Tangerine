export function tNumber(fragment) {
  return document.documentElement.lang.toLowerCase() === 'ben' || document.documentElement.lang.toLowerCase() === 'bn'
      ? toBengaliNum(fragment)
      : fragment
}

function toBengaliNum (t) {
  const arabicToBengaliMap = {
    0:"০",
    1:"১",
    2:"২",
    3:"৩",
    4:"৪",
    5:"৫",
    6:"৬",
    7:"৭",
    8:"৮",
    9:"৯"
  }
  return Object.keys(arabicToBengaliMap)
    .reduce((translation, key) => {
      const re = new RegExp(key, 'g');
      return translation.replace(re, arabicToBengaliMap[key])
    }, `${t}`)
}

