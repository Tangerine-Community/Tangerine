export const t = (fragment) => {
  if (!window.translation) return fragment
  if (window.translation[fragment]) {
    return window.translation[fragment]
  } else {
    return fragment
  }
}

