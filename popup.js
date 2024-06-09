let port = chrome.runtime.connect({ name: "popup" });

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        if (!url || url.includes("chrome:") || url.includes("about:")) {
            document.getElementById('sections').innerHTML = '';
            return;
        }

        document.getElementById('delay-select').addEventListener('change', saveSettings);
        document.getElementById('brightness-select').addEventListener('change', saveSettings);
        document.getElementById('contrast-select').addEventListener('change', saveSettings);

        document.getElementById('darkmode-checkbox').addEventListener('change', saveSettings);
        document.getElementById('grayscale-checkbox').addEventListener('change', saveSettings);
        document.getElementById('forcedmode-checkbox').addEventListener('change', saveSettings);
        document.getElementById('skipiframes-checkbox').addEventListener('change', saveSettings);
        document.getElementById('default-darkmode-checkbox').addEventListener('change', saveDefaults);
        document.getElementById('default-grayscale-checkbox').addEventListener('change', saveDefaults);

        loadSettings();

        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.message === 'darkModeChanged') {
                updateDarkModeStatus(request.value);
            }
            if (request.message === 'grayscaleChanged') {
                updateGrayscaleStatus(request.value);
            }
        });
    });
});

function saveSettings() {
    const delay = document.getElementById('delay-select').value;
    const brightness = document.getElementById('brightness-select').value;
    const contrast = document.getElementById('contrast-select').value;
    const darkmode = document.getElementById('darkmode-checkbox').checked;
    const grayscale = document.getElementById('grayscale-checkbox').checked;
    const forcedmode = document.getElementById('forcedmode-checkbox').checked;
    const skipiframes = document.getElementById('skipiframes-checkbox').checked;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = new URL(tabs[0].url).hostname;
        chrome.storage.local.get({ settings: {} }, function (data) {
            const updatedSettings = {
                ...data.settings,
                [url]: { delay, grayscale, darkmode, forcedmode, skipiframes, brightness, contrast }
            };
            chrome.storage.local.set({ settings: updatedSettings }, function () {
                //alert('Settings saved for ' + url);
            });

            updateDarkModeStatus(darkmode);
            updateGrayscaleStatus(grayscale);

            chrome.tabs.sendMessage(tabs[0].id, {
                action: "updateDarkmode",
                darkmode: darkmode,
                grayscale: grayscale,
                forcedmode: forcedmode,
                skipiframes: skipiframes,
                brightness: brightness,
                contrast: contrast
            });
        });
    });
}

function saveDefaults() {
    const darkmode = document.getElementById('default-darkmode-checkbox').checked;
    const grayscale = document.getElementById('default-grayscale-checkbox').checked;

    chrome.storage.local.set({ defaults: { darkmode, grayscale } }, function () {
        //alert('Settings saved for ' + url);
    });
}

function loadSettings() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = new URL(tabs[0].url).hostname;
        chrome.storage.local.get({ settings: {}, defaults: {} }, function (data) {
            const defaults = data.defaults || { grayscale: false, darkmode: false }
            const settings = data.settings[url] || { delay: '0.5', grayscale: defaults.grayscale, darkmode: defaults.darkmode, forcedmode: false, skipiframes: false, brightness: '1.0', contrast: '0.8' };
            document.getElementById('delay-select').value = settings.delay;
            document.getElementById('brightness-select').value = settings.brightness || '1.0';
            document.getElementById('contrast-select').value = settings.contrast || '0.8';
            document.getElementById('darkmode-checkbox').checked = settings.darkmode;
            document.getElementById('grayscale-checkbox').checked = settings.grayscale;
            document.getElementById('forcedmode-checkbox').checked = settings.forcedmode;
            document.getElementById('skipiframes-checkbox').checked = settings.skipiframes;
            document.getElementById('default-darkmode-checkbox').checked = defaults.darkmode;
            document.getElementById('default-grayscale-checkbox').checked = defaults.grayscale;
            updateDarkModeStatus(!!settings.darkmode);
        });
    });
}

function updateDarkModeStatus(mode) {
    document.getElementById('darkmode-checkbox').checked = !!mode;
    const statusIndicator = document.getElementById('status-indicator');
    if (mode) {
        statusIndicator.textContent = 'ON';
        statusIndicator.style = 'color: green';
    } else {
        statusIndicator.textContent = 'OFF';
        statusIndicator.style = 'color: red';
    }
}

function updateGrayscaleStatus(mode) {
    document.getElementById('grayscale-checkbox').checked = !!mode;
}
