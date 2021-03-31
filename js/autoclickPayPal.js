(() => {
  chrome.storage.local.get({
    usePayPal: true,
  }, (items) => {
    if (items.usePayPal) {
      if (document.referrer.includes('https://js.digitalriver.com/')) {
        setTimeout(() => {
          document.querySelector('#paypal-animation-content > div.paypal-button-container.paypal-button-layout-horizontal.paypal-button-shape-pill.paypal-button-branding-branded.paypal-button-number-single.paypal-button-env-production.paypal-should-focus > div > div').click();
        }, 180);
      }
    }
  });
})();
