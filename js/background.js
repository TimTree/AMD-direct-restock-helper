const inStockAudio = new Audio('sound/pristine-609.mp3');
const IPBanAudio = new Audio('sound/moonless-591.mp3');

function clearAMDCookies(callback) {
  chrome.cookies.getAll({ url: 'https://www.amd.com' }, (cookies) => {
    let cookiesProcessed = 0;
    if (cookies.length === 0) { callback(); } else {
      cookies.forEach((item, index, array) => {
        chrome.cookies.remove({
          url: 'https://www.amd.com',
          name: item.name,
        }, () => {
          cookiesProcessed += 1;
          if (cookiesProcessed === array.length) {
            callback();
          }
        });
      });
    }
  });
}

function repeatTabCheck(callback) {
  chrome.tabs.query({ url: 'https://www.amd.com/en/direct-buy/*' }, (tabs) => {
    if (tabs.length > 1) {
      callback({ response: 'repeat' });
    } else {
      callback({ response: 'norepeat' });
    }
  });
}

async function checkForUpdate() {
  const response = await fetch('https:/api.github.com/repos/TimTree/AMD-direct-restock-helper/releases/latest', {
  });
  if (response.ok) {
    const data = await response.json();
    return data.tag_name;
  }
  return response.status;
}

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.command === 'clearAMDCookies') {
      clearAMDCookies(sendResponse);
    } else if (request.command === 'playInStockSound') {
      inStockAudio.play();
    } else if (request.command === 'playIPBanSound') {
      IPBanAudio.play();
    } else if (request.command === 'notifyInStock') {
      IPBanAudio.play();
    } else if (request.command === 'repeatTabCheck') {
      repeatTabCheck(sendResponse);
    } else if (request.type === 'notification') { chrome.notifications.create('', request.options); } else if (request.command === 'checkForUpdate') {
      checkForUpdate()
      .then((data) => {
        if (isNaN(data) && `v${chrome.runtime.getManifest().version}` !== data) {
          sendResponse({ response: true });
        } else {
          sendResponse({ response: false });
        }
      }).catch((reason) => {
        sendResponse({ response: 'error' + reason.message });
      });
    }
    return true;
  },
);
