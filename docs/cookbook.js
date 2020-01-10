var callback = function(){
  if (window.location.hash === '#edit') {
    window.document.body.innerHTML = `
      <tangy-form-editor>
        <template>
          ${window.document.body.innerHTML}
        </template>
      </tangy-form-editor
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
