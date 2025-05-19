var callback = async function(){
  if (window.location.hash === '#edit') {
    const doc = await(await fetch('index.html')).text()
    const formMarkup = doc.slice(doc.indexOf('<body>')+6, doc.lastIndexOf('</body>'))
    window.document.body.innerHTML = `
      <tangy-form-editor>
        <template>
          ${formMarkup}
        </template>
      </tangy-form-editor>
    `
  }
};

if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  callback();
} else {
  document.addEventListener("DOMContentLoaded", callback);
}
