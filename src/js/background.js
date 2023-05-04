(async () => {
  const src = chrome.extension.getURL('src/js/popup.js');
  const contentScript = await import(src);
  contentScript.main();
})();
