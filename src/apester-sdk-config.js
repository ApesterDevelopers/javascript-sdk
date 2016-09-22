/**
 * Apester embed component configuration.
 * Set as a singleton for general use.
 * @type {{getInstance}}
 */
var ApesterConfig = (function () {

    var instance;

    function init() {
        return {
            GIF_URL: 'https://images.apester.com/images%2Floader.gif',
            playerBaseUrl: window.location.protocol + '//renderer.qmerce.com',
            displayBaseUrl: window.location.protocol + '//display.apester.com',
            cdn_url: "//images.apester.com/",
            eventCollectorUrl: window.location.protocol + '//events.apester.com/event',
            TIMEOUT_DURATION: 30000,
            VERSION: '2.1.3',
            TYPE: '',
            events: ["DOMContentLoaded", "load", "scroll", "resize"],
            autoPlacementMapUrl: window.location.protocol + '//os.apester.com/prod_mapping.json',
            supportedTags: ["apester-media","interaction"],
            supportedClasses: ["ape-interaction","apester-media"]
        };
    }

    return {
        getInstance: function () {

            if (!instance) {
                instance = init();
            }

            return instance;
        }
    };
})();