/* eslint-disable */
(function initAEMGenAI() {
    let isAEMGenAIVariationsAppLoaded = false;

    function loadAEMGenAIVariationsApp() {
        const script = document.createElement('script');
        script.src = 'https://experience.adobe.com/solutions/aem-sites-genai-aem-genai-variations-mfe/static-assets/resources/sidekick/client.js?source=plugin';
        script.onload = function onLoad() {
            isAEMGenAIVariationsAppLoaded = true;
        };
        script.onerror = function onError() {
            // eslint-disable-next-line no-console
            console.error('Error loading AEMGenAIVariationsApp.');
        };
        document.head.appendChild(script);
    }

    function handlePluginButtonClick() {
        if (!isAEMGenAIVariationsAppLoaded) {
            loadAEMGenAIVariationsApp();
        }
    }

    // The code snippet for the Sidekick V1 extension
    const sidekick = document.querySelector('helix-sidekick');
    if (sidekick) {
        // sidekick already loaded
        sidekick.addEventListener('custom:aem-genai-variations-sidekick', handlePluginButtonClick);
    } else {
        // wait for sidekick to be loaded
        document.addEventListener('sidekick-ready', () => {
            document.querySelector('helix-sidekick')
                .addEventListener('custom:aem-genai-variations-sidekick', handlePluginButtonClick);
        }, { once: true });
    }

    // The code snippet for the Sidekick V2 extension
    const sidekickV2 = document.querySelector('aem-sidekick');
    if (sidekickV2) {
        // sidekick already loaded
        sidekickV2.addEventListener('custom:aem-genai-variations-sidekick', handlePluginButtonClick);
    } else {
        // wait for sidekick to be loaded
        document.addEventListener('sidekick-ready', () => {
            document.querySelector('aem-sidekick')
                .addEventListener('custom:aem-genai-variations-sidekick', handlePluginButtonClick);
        }, { once: true });
    }
}());
