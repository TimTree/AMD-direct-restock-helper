console.log(`AMD DIRECT RESTOCK HELPER v${chrome.runtime.getManifest().version}`);

const defaultOptions = {
  productToCheck: '6700xt',
  minDelay: 3000,
  soundAlerts: true,
  usePayPal: true,
  autoPromotional: true,
};

const productNames = {
  '6700xt': 'RX 6700 XT',
  6800: 'RX 6800',
  '6800xt': 'RX 6800 XT',
  '6900xt': 'RX 6900 XT',
  '5600x': 'Ryzen 5600x',
  '5800x': 'Ryzen 5800x',
  '5900x': 'Ryzen 5900x',
  '5950x': 'Ryzen 5950x',
  '3900x': 'Ryzen 3900x',
  '3950x': 'Ryzen 3950x',
};

const productIDs = {
  '6700xt': 5496921400,
  6800: 5458373400,
  '6800xt': 5458372800,
  '6900xt': 5458372200,
  '5600x': 5450881700,
  '5800x': 5450881600,
  '5900x': 5450881500,
  '5950x': 5450881400,
  '3900x': 5335621300,
  '3950x': 5358857400,
};

let counter = 0;
let requestTimeout;
let isFetching = false;
let pauseQueue = false;
let IPBanFlag = false;

async function fetchAsync(productArg) {
  const formData = new FormData();
  formData.append('js', 'true');
  formData.append('_drupal_ajax', '1');
  formData.append('ajax_page_state[theme]', 'amd');
  formData.append('ajax_page_state[theme_token]', '');
  formData.append('ajax_page_state[libraries]', 'amd/amd-scripts,amd/global-styling,amd_core/forms,amd_shop_product/direct-buy,amd_shop_product/direct-buy-analytics,amd_shop_product/direct-buy.pdp,amd_shop_product/direct-buy.url-manager,amd_shop_product/set-cart-token,amd_shop_product/shopping-cart-actions,chosen/drupal.chosen,chosen_lib/chosen.css,core/html5shiv,system/base');
  const response = await fetch(`https://www.amd.com/en/direct-buy/add-to-cart/${productIDs[productArg]}?_wrapper_format=drupal_ajax`, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: formData,
  });
  if (response.ok) {
    if (response.url === 'https://www.amd.com/en/maintenance') {
      return 'maintenance';
    }
    const data = await response.json();
    return data;
  }
  return response.status;
}

function addToCartAndCheckout(payload) {
  const temp = document.createElement('div');
  temp.innerHTML = payload;
  const htmlObject = temp.getElementsByClassName('cart-button')[1].getElementsByTagName('a')[0].getAttribute('href');
  window.open(`https://www.amd.com${htmlObject}`, '_blank');
}

function initiateCartCheck() {
  chrome.storage.local.get(defaultOptions, (result) => {
    chrome.runtime.sendMessage({ command: 'clearAMDCookies' }, () => {
      sequentialCartCheck(result.productToCheck);
      document.getElementById('currentCheckInfo').innerHTML = `Checking for <strong>${productNames[result.productToCheck]}</strong>`;
    });
  });
}

function changeProductToCheck() {
  const productToCheck = document.getElementById('AMDProductSelection').value;
  chrome.storage.local.set({
    productToCheck,
  }, () => {
  });
}

function changeMinDelay() {
  const minDelay = document.getElementById('minDelay').value;
  chrome.storage.local.set({
    minDelay,
  }, () => {
  });
}

function changeSoundAlerts() {
  const soundAlerts = document.getElementById('soundAlerts').checked;
  chrome.storage.local.set({
    soundAlerts,
  }, () => {
  });
}

function changeUsePayPal() {
  const usePayPal = document.getElementById('usePayPal').checked;
  chrome.storage.local.set({
    usePayPal,
  }, () => {
  });
}

function changeAutoPromotional() {
  const autoPromotional = document.getElementById('autoPromotional').checked;
  chrome.storage.local.set({
    autoPromotional,
  }, () => {
  });
}

function restoreOptions() {
  chrome.storage.local.get(defaultOptions, (items) => {
    document.getElementById('AMDProductSelection').value = items.productToCheck;
    document.getElementById('minDelay').value = items.minDelay;
    document.getElementById('soundAlerts').checked = items.soundAlerts;
    document.getElementById('usePayPal').checked = items.usePayPal;
    document.getElementById('autoPromotional').checked = items.autoPromotional;
  });
}

function showStatusPane() {
  document.getElementById('startDiv').style.display = 'none';
  document.getElementById('statusPane').style.display = 'flex';
  initiateCartCheck();
}

function pauseOrResume() {
  if (document.getElementById('pauseButton').innerHTML === 'Pause') {
    if (isFetching) {
      document.getElementById('pauseButton').disabled = true;
      pauseQueue = true;
    } else {
      clearTimeout(requestTimeout);
      document.getElementById('currentCheckInfo').innerHTML = 'Paused';
      document.getElementById('pauseButton').innerHTML = 'Resume';
    }
  } else {
    document.getElementById('pauseButton').innerHTML = 'Pause';
    initiateCartCheck();
  }
}

function sequentialCartCheck(productArg2) {
  chrome.storage.local.get(defaultOptions, (result) => {
    isFetching = true;
    const time1 = performance.now();
    fetchAsync(productArg2)
      .then((data) => {
        isFetching = false;
        const time2 = performance.now();
        let delayDeduction;
        if (time2 - time1 < result.minDelay) {
          delayDeduction = time2 - time1;
        } else {
          delayDeduction = result.minDelay;
        }
        counter += 1;
        document.getElementById('countInfo').innerHTML = counter;
        try {
          if (data === 403) {
            console.log(`${productNames[productArg2]} (${counter}) [Temp IP ban - 403 (Consider pausing/increasing min delay)]`);
            document.getElementById('responseInfo').innerHTML = '<span style=\'color:#de0000;\'>[Temp IP ban - 403 (Consider pausing/increasing min delay)]</span>';
            if (!IPBanFlag) {
              if (result.soundAlerts) {
                chrome.runtime.sendMessage({ command: 'playIPBanSound' }, () => {});
              }
              chrome.runtime.sendMessage({
                command: 'notification',
                options: {
                  title: 'Temporarily IP banned from AMD.com', message: 'Consider pausing the script for a few minutes and increasing the min delay between requests.', iconUrl: '../img/icon128.png', type: 'basic',
                },
              }, () => {});
              IPBanFlag = true;
            }
          } else {
            if (IPBanFlag) { IPBanFlag = false; }
            if (data >= 500 && data <= 599) {
              console.log(`${productNames[productArg2]} (${counter}) [Server error - ${data}]`);
              document.getElementById('responseInfo').innerHTML = `[Server error - ${data}]`;
            } else if (data >= 400 && data <= 499) {
              console.log(`${productNames[productArg2]} (${counter}) [Client error - ${data}]`);
              document.getElementById('responseInfo').innerHTML = `[Client error - ${data}]`;
            } else if (data === 'maintenance') {
              console.log(`${productNames[productArg2]} (${counter}) [Listing in maintenance]`);
              document.getElementById('responseInfo').innerHTML = '[Listing in maintenance]';
            } else if (data.some((item) => item.text === 'Product added to cart.')) { // In stock
              if (result.soundAlerts) {
                chrome.runtime.sendMessage({ command: 'playInStockSound' }, () => {});
              }
              addToCartAndCheckout(data[6].data);
              chrome.runtime.sendMessage({
                command: 'notification',
                options: {
                  title: `${productNames[productArg2]} IN STOCK`, message: 'GO, GO, GO!!!', iconUrl: '../img/icon128.png', type: 'basic',
                },
              }, () => {});
              console.log(`${productNames[productArg2]} (${counter}) [In stock ${new Date(Date.now()).toString()}]`);
              document.getElementById('responseInfo').innerHTML = `[In stock ${new Date(Date.now()).toString()}]`;
              document.getElementById('pauseDiv').style.display = 'none';
              return;
            } else {
              console.log(`${productNames[productArg2]} (${counter}) [Not in stock]`);
              document.getElementById('responseInfo').innerHTML = '[Not in stock]';
            }
          }
        } catch (e) {
          console.log(`${productNames[productArg2]} (${counter}) [Unhandled parsing error - ${e}]`);
          document.getElementById('responseInfo').innerHTML = `[Unhandled parsing error - ${e}]`;
        } finally {
          if (document.getElementById('pauseDiv').style.display !== 'none') {
            if (pauseQueue) {
              pauseQueue = false;
              pauseOrResume();
              document.getElementById('pauseButton').disabled = false;
            } else {
              requestTimeout = setTimeout(() => { initiateCartCheck(); },
                result.minDelay - delayDeduction);
            }
          }
        }
      }).catch((reason) => {
        isFetching = false;
        const time2 = performance.now();
        let delayDeduction;
        if (time2 - time1 < result.minDelay) {
          delayDeduction = time2 - time1;
        } else {
          delayDeduction = result.minDelay;
        }
        console.log(`Connection error: ${reason.message}`);
        if (reason.message === 'Failed to fetch') {
          document.getElementById('countInfo').innerHTML = counter;
          document.getElementById('responseInfo').innerHTML = '<span style=\'color:#de0000;\'>[No Internet connection]</span>';
        } else {
          document.getElementById('countInfo').innerHTML = counter;
          document.getElementById('responseInfo').innerHTML = `[Unhandled connection error - ${reason.message}]`;
        }
        if (pauseQueue) {
          document.getElementById('pauseButton').disabled = false;
          pauseQueue = false;
          pauseOrResume();
        } else {
          requestTimeout = setTimeout(() => { initiateCartCheck(); },
            result.minDelay - delayDeduction);
        }
      });
  });
}

(async function main() {
  const banner = document.createElement('div');
  banner.style.position = 'fixed'; banner.style.bottom = '0px'; banner.style.zIndex = 2147483646;
  banner.style.width = '100%'; banner.style.padding = '6px'; banner.style.textAlign = 'center';
  banner.style.background = '#a0d5ea';
  banner.style.fontFamily = 'Verdana'; banner.style.fontSize = '13px';
  banner.style.boxShadow = '0px -2px 12px rgba(0,0,0,0.3)';

  document.addEventListener('DOMContentLoaded', async () => {
    chrome.runtime.sendMessage({ command: 'repeatTabCheck' }, (response) => {
      if (response.response === 'norepeat') {
        banner.innerHTML = `
            <div id="updateNotifier" style="margin: 0.3em 0;"></div>
            <div style="margin: 0.3em 0;">
            <strong>AMD Direct Restock Helper v${chrome.runtime.getManifest().version}</strong> by <a href='https://github.com/TimTree/AMD-direct-restock-helper' target='_blank' rel='noopener'>TimTree</a>
             - <a href='https://github.com/TimTree/AMD-direct-restock-helper#usage' target='_blank' rel='noopener'>How to use</a>
            </div>
            <div id="startDiv" style="margin: 0.3em 0;">
                <button id="startButton">Start</button>
            </div>
            <div id="statusPane" style="display:none;justify-content:center;flex-wrap:wrap;gap:12px;margin: 0.3em 0;">
                <div id="currentCheckInfo">Initializing...</div>
                <div id="countInfo"></div>
                <div id="responseInfo"></div>
                <div id="pauseDiv"><button id="pauseButton">Pause</button></div>
            </div>
            <div>
            <div style="margin: 0.3em 0;display:flex;justify-content:center;flex-wrap:wrap;gap:12px;">
            <div>
                Check for:
                <select id="AMDProductSelection">
                    <option value="6700xt">RX 6700 XT</option>
                    <option value="6800">RX 6800</option>
                    <option value="6800xt">RX 6800 XT</option>
                    <option value="6900xt">RX 6900 XT</option>
                    <option value="5600x">Ryzen 5600x</option>
                    <option value="5800x">Ryzen 5800x</option>
                    <option value="5900x">Ryzen 5900x</option>
                    <option value="5950x">Ryzen 5950x</option>
                    <option value="3900x">Ryzen 3900x</option>
                    <option value="3950x">Ryzen 3950x</option>
                </select>
            </div>
            <div>
            Min delay between requests:
            <input style="width:70px;" id="minDelay" type="number" /> ms
            </div>
            </div>
            <div style="margin: 0.3em 0;display:flex;justify-content:center;flex-wrap:wrap;gap:12px;">
            <div>
                Sound alerts:
                <input type="checkbox" id="soundAlerts">
            </div>
            <div>
              Use PayPal:
              <input type="checkbox" id="usePayPal">
            </div>
            <div>
            Consent to promotional AMD emails:
            <input type="checkbox" id="autoPromotional">
          </div>
            </div>
            </div>`;

        document.body.append(banner);
        restoreOptions();

        document.getElementById('AMDProductSelection').addEventListener('change',
          changeProductToCheck);
        document.getElementById('minDelay').addEventListener('change',
          changeMinDelay);
        document.getElementById('soundAlerts').addEventListener('change',
          changeSoundAlerts);
        document.getElementById('usePayPal').addEventListener('change',
          changeUsePayPal);
        document.getElementById('autoPromotional').addEventListener('change',
          changeAutoPromotional);
        document.getElementById('startButton').addEventListener('click',
          showStatusPane);
        document.getElementById('pauseButton').addEventListener('click',
          pauseOrResume);

        chrome.runtime.sendMessage({ command: 'checkForUpdate' }, (response) => {
          if (response.response) {
            document.getElementById('updateNotifier').innerHTML = 'New update available. <a href=\'https://github.com/TimTree/AMD-direct-restock-helper/releases/latest\' target=\'_blank\' rel=\'noopener\'>Download now.</a>';
          }
        });
      } else {
        banner.innerHTML = `
            <div style="margin: 0.3em 0;">
                AMD Direct Restock Helper can only run on one tab to prevent unexpectedly adding multiple items to cart.
            </div>
            <div style="margin: 0.3em 0;">
                If you have multiple AMD.com tabs open, close all of them except this tab and refresh.
            </div>
            <div style="margin: 0.3em 0;">
                To check for multiple products, use separate Chrome profiles, <a href='https://github.com/TimTree/AMD-direct-restock-helper#checking-for-multiple-products' target='_blank' rel='noopener'>explained in the README</a>.
            </div>`;
        document.body.append(banner);
      }
    });
  });
}());
