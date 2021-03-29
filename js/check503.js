const theEntireHTML = document.documentElement.innerHTML;

if (theEntireHTML.includes('503 Service Temporarily Unavailable')) {
  const banner = document.createElement('div');
  banner.style.position = 'fixed'; banner.style.bottom = '0px'; banner.style.zIndex = 2147483646;
  banner.style.width = '100%'; banner.style.padding = '6px'; banner.style.textAlign = 'center';
  banner.style.background = '#a0d5ea';
  banner.style.fontFamily = 'Verdana'; banner.style.fontSize = '13px';
  banner.style.boxShadow = '0px -2px 20px rgba(0,0,0,0.3)';
  banner.innerHTML = `
    <div style="margin: 0.3em 0;">
    Error 503 detected. Automatically refreshing...
    </div>`;
  document.body.append(banner);
  window.location.reload();
}
