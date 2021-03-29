if (document.referrer.includes('https://www.amd.com/')) {
  const clickCheck = setInterval(() => {
    if (document.querySelectorAll('.recaptcha-checkbox-checkmark').length > 0) {
      clearInterval(clickCheck);
      document.querySelector('.recaptcha-checkbox-checkmark').click();
    }
  }, 50);
}
