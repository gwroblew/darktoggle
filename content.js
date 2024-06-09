chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "updateDarkmode") {
    makeDark(request.darkmode, request.grayscale, request.forcedmode, request.skipiframes, request.brightness, request.contrast);
  }
});

window.onload = function () {
  chrome.storage.local.get({ settings: {}, defaults: {} }, function (data) {
    const url = new URL(window.location).hostname;
    const defaults = data.defaults || { grayscale: false, darkmode: false }
    const siteSettings = data.settings[url] || { delay: '0.5', grayscale: defaults.grayscale, darkmode: defaults.darkmode, forcedmode: false, skipiframes: false, brightness: '1.0', contrast: '0.8' };
    const isDark = siteSettings.darkmode;
    setTimeout(function () {
      if (isDark) {
        makeDark(isDark, siteSettings.grayscale, siteSettings.forcedmode, siteSettings.skipiframes, siteSettings.brightness, siteSettings.contrast);
      }
    }, parseFloat(siteSettings.delay) * 1000);
  });
};

function makeDark(dark, grayscale, forcedmode, skipiframes, brightness, contrast) {
  brightness = brightness || '1.0';
  contrast = contrast || '0.8';
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
}
