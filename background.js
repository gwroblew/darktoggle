let popupCount = 0;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'requestPopupCount') {
    sendResponse({ popupCount: popupCount });
    return true;
  }
});

chrome.runtime.onConnect.addListener(port => {
  if (port.name === "popup") {
    popupCount++;

    port.onDisconnect.addListener(() => {
      popupCount--;
    });
  }
});

chrome.commands.onCommand.addListener(function (command) {
  if (command === 'toggle-dark-mode') {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        if (!url || url.includes("chrome:") || url.includes("about:")) {
          return;
        }
        toggleDarkMode(tabs[0].id);
      });
    } catch (e) { }
  }
  if (command === 'toggle-grayscale') {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        if (!url || url.includes("chrome:") || url.includes("about:")) {
          return;
        }
        toggleGrayscale(tabs[0].id);
      });
    } catch (e) { }
  }
});

function toggleDarkMode(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: toggleDarkModeContent
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Scripting executeScript error:', chrome.runtime.lastError.message);
    }
  });
}

function toggleDarkModeContent() {
  chrome.storage.local.get({ settings: {}, defaults: {} }, function (data) {
    const url = new URL(window.location).hostname;
    const defaults = data.defaults || { grayscale: false, darkmode: false }
    const siteSettings = data.settings[url] || { delay: '0.5', grayscale: defaults.grayscale, darkmode: defaults.darkmode, forcedmode: false, skipiframes: false, brightness: '1.0', contrast: '0.8' };
    const isDark = siteSettings.darkmode;

    try {
      chrome.runtime.sendMessage({ action: 'requestPopupCount' }, response => {
        if (response.popupCount > 0) {
          chrome.runtime.sendMessage({ message: 'darkModeChanged', value: !isDark });
        }
      });
    } catch (e) { }

    chrome.storage.local.set(
      {
        settings: {
          ...data.settings,
          [url]: {
            delay: siteSettings.delay,
            grayscale: siteSettings.grayscale,
            darkmode: !isDark,
            forcedmode: siteSettings.forcedmode,
            skipiframes: siteSettings.skipiframes,
            brightness: siteSettings.brightness,
            contrast: siteSettings.contrast
          }
        }
      });

    const dark = !isDark;
    const grayscale = siteSettings.grayscale;
    const forcedmode = siteSettings.forcedmode;
    const skipiframes = siteSettings.skipiframes;
    const brightness = siteSettings.brightness || '1.0';
    const contrast = siteSettings.contrast || '0.8';
    const bcCSS = ` brightness(${brightness}) contrast(${contrast})`;
    if (dark) {
      document.body.classList.add('dark');
      if (forcedmode) {
        document.body.parentElement.style = (grayscale ? 'filter: grayscale(1) invert(1)' : 'filter: invert(1) hue-rotate(180deg)') + bcCSS;
        document.querySelectorAll('*').forEach(element => {
          const backgroundColor = window.getComputedStyle(element).backgroundColor;
          if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
            element.style.backgroundColor = '#f0f0f0';
            element.style.color = '#181818';
          }
        });
      } else {
        document.body.parentElement.style = (grayscale ? 'filter: grayscale(1) invert(1)' : 'filter: invert(1) hue-rotate(180deg)') + bcCSS;
      }
      document.querySelectorAll('img').forEach(img => img.style.filter = 'invert(1) hue-rotate(180deg)' + bcCSS);
      document.querySelectorAll('video').forEach(vid => vid.style.filter = 'invert(1) hue-rotate(180deg)' + bcCSS);
      if (!skipiframes) {
        document.querySelectorAll('iframe').forEach(vid => vid.style.filter = 'invert(1) hue-rotate(180deg)' + bcCSS);
      }
    } else {
      document.body.classList.remove('dark');
      document.body.parentElement.style = '';
      document.querySelectorAll('img').forEach(img => img.style.filter = '');
      document.querySelectorAll('video').forEach(vid => vid.style.filter = '');
      if (!skipiframes) {
        document.querySelectorAll('iframe').forEach(vid => vid.style.filter = '');
      }
    }
  });
}

function toggleGrayscale(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: toggleGrayscaleContent
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Scripting executeScript error:', chrome.runtime.lastError.message);
    }
  });
}

function toggleGrayscaleContent() {
  chrome.storage.local.get({ settings: {}, defaults: {} }, function (data) {
    const url = new URL(window.location).hostname;
    const defaults = data.defaults || { grayscale: false, darkmode: false }
    const siteSettings = data.settings[url] || { delay: '0.5', grayscale: defaults.grayscale, darkmode: defaults.darkmode, forcedmode: false, skipiframes: false, brightness: '1.0', contrast: '0.8' };
    const isDark = siteSettings.darkmode;

    try {
      chrome.runtime.sendMessage({ action: 'requestPopupCount' }, response => {
        if (response.popupCount > 0) {
          chrome.runtime.sendMessage({ message: 'grayscaleChanged', value: !siteSettings.grayscale });
        }
      });
    } catch (e) { }

    chrome.storage.local.set(
      {
        settings: {
          ...data.settings,
          [url]: {
            delay: siteSettings.delay,
            grayscale: !siteSettings.grayscale,
            darkmode: isDark,
            forcedmode: siteSettings.forcedmode,
            skipiframes: siteSettings.skipiframes,
            brightness: siteSettings.brightness,
            contrast: siteSettings.contrast
          }
        }
      });

    const dark = isDark;
    const grayscale = !siteSettings.grayscale;
    const forcedmode = siteSettings.forcedmode;
    const skipiframes = siteSettings.skipiframes;
    const brightness = siteSettings.brightness || '1.0';
    const contrast = siteSettings.contrast || '0.8';
    const bcCSS = ` brightness(${brightness}) contrast(${contrast})`;
    if (dark) {
      document.body.classList.add('dark');
      if (forcedmode) {
        document.body.parentElement.style = (grayscale ? 'filter: grayscale(1) invert(1)' : 'filter: invert(1) hue-rotate(180deg)') + bcCSS;
        document.querySelectorAll('*').forEach(element => {
          const backgroundColor = window.getComputedStyle(element).backgroundColor;
          if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
            element.style.backgroundColor = '#f0f0f0';
            element.style.color = '#181818';
          }
        });
      } else {
        document.body.parentElement.style = (grayscale ? 'filter: grayscale(1) invert(1)' : 'filter: invert(1) hue-rotate(180deg)') + bcCSS;
      }
      document.querySelectorAll('img').forEach(img => img.style.filter = 'invert(1) hue-rotate(180deg)' + bcCSS);
      document.querySelectorAll('video').forEach(vid => vid.style.filter = 'invert(1) hue-rotate(180deg)' + bcCSS);
      if (!skipiframes) {
        document.querySelectorAll('iframe').forEach(vid => vid.style.filter = 'invert(1) hue-rotate(180deg)' + bcCSS);
      }
    } else {
      document.body.classList.remove('dark');
      document.body.parentElement.style = '';
      document.querySelectorAll('img').forEach(img => img.style.filter = '');
      document.querySelectorAll('video').forEach(vid => vid.style.filter = '');
      if (!skipiframes) {
        document.querySelectorAll('iframe').forEach(vid => vid.style.filter = '');
      }
    }
  });
}
