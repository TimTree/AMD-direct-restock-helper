chrome.storage.local.get({
  autoPromotional: true,
}, (items) => {
  document.querySelector('#terms-and-conditions-check').checked = true;
  if (items.autoPromotional) {
    document.querySelector('#newsletter-signup').checked = true;
  }
});
