(() => {
  try {
    if (!Number.isNaN(Number(window.location.pathname.split('/')[3]))) {
      document.querySelector('#product-details-info > div.container > div > div.product-page-description.col-flex-lg-5.col-flex-sm-12 > button').click();
    }
    return 0;
  } catch {
    return 0;
  }
})();
