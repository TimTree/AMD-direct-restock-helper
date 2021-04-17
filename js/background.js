const inStockAudio = new Audio('sound/pristine-609.mp3');
const IPBanAudio = new Audio('sound/moonless-591.mp3');

function clearAMDCookies(callback) {
  chrome.cookies.getAll({ url: 'https://www.amd.com' }, (cookies) => {
    let cookiesProcessed = 0;
    if (cookies.length === 0) { callback(); } else {
      cookies.filter((cookieName) => !['OptanonConsent', 'pmuser_country', '_ga'].includes(cookieName.name)).forEach((item, index, array) => {
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

function addGACookie(callback) {
  chrome.cookies.get({
    url: 'https://www.amd.com',
    name: '_ga',
  }, (cookie) => {
    if (cookie === null) {
      const GARandom1 = Math.floor((Math.random() * 9999999999) + 1000000000);
      const GARandom2 = Math.floor((Math.random() * 9999999999) + 1000000000);
      chrome.cookies.set({
        url: 'https://www.amd.com',
        domain: '.amd.com',
        name: '_ga',
        value: `GA1.2.${GARandom1}.${GARandom2}`,
        expirationDate: new Date().getTime() + 63115200,
      }, () => {
        callback();
      });
    } else {
      callback();
    }
  });
}

function tabDetection(sender, callback) {
  const isIncognito = !!(sender.tab.incognito);
  chrome.tabs.query({ url: 'https://www.amd.com/en/direct-buy/*' }, (tabs) => {
    if (tabs.map((x) => x.incognito).filter((x) => x === isIncognito).length > 1) {
      callback({ isIncognito, isRepeat: true });
    } else {
      callback({ isIncognito, isRepeat: false });
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
    switch (request.command) {
      case 'addGACookie':
        addGACookie(sendResponse);
        break;
      case 'clearAMDCookies':
        clearAMDCookies(sendResponse);
        break;
      case 'playInStockSound':
        inStockAudio.play();
        break;
      case 'playIPBanSound':
        IPBanAudio.play();
        break;
      case 'tabDetection':
        tabDetection(sender, sendResponse);
        break;
      case 'notification':
        chrome.notifications.create('', request.options);
        break;
      case 'checkForUpdate':
        checkForUpdate()
          .then((data) => {
            if (Number.isNaN(Number(data)) && `v${chrome.runtime.getManifest().version}` !== data) {
              sendResponse({ response: true });
            } else {
              sendResponse({ response: false });
            }
          }).catch((reason) => {
            sendResponse({ response: `error${reason.message}` });
          });
        break;
      default:
    }
    return true;
  },
);
