/**
 * Apester interaction Object, responsible for instantiating of interaction.
 * @param containerElement - the container element
 * @constructor
 */
var ApesterInteraction = function (containerElement, timer) {
    this.timer = timer;
    this.containerElement = containerElement;
    this.config = ApesterConfig.getInstance();
    this.utils = ApesterDOM.getInstance();
    this.isRandom = this.containerElement.dataset.random ? true : false;
    this.id = this.isRandom ? this.containerElement.dataset.random : this.containerElement.id;
};

ApesterInteraction.prototype = {

    /**
     * The flow is like so:
     * Check what to display -> create loader -> create Iframe -> set loading timeout.
     * Listeneres for resizing are set by embed object.
     */
    setChainOfResponsibility: function () {
        this.sendDisplayedEvent().createLoader().createIframe().setTimeout();
    },

    /**
     * Test if the interaction has expired, if it does we do not take any space on the DOM.
     * @returns {ApesterInteraction}
     */
    display: function () {

        //If it's a random interaction we ask for the interaction to display.
        if (this.isRandom) {
            var path = this.config.displayBaseUrl + '/tokens/' + this.id + '/interactions/random';
            ApesterEvents.fetch("GET", path, function (data) {
                this.interaction = data;
                //this.token = this.id;
                this.id = data.interactionId;
                this.containerElement.id = this.id;
                this.setChainOfResponsibility();
            }.bind(this), this.displayFailedCallback.bind(this));
        } else {

            //We test if the interaction may be displayed.
            var path = this.config.displayBaseUrl + '/interactions/' + this.id + '/display';
            ApesterEvents.fetch("GET", path, function (data) {
                this.interaction = data;
                this.setChainOfResponsibility();
            }.bind(this), this.displayFailedCallback.bind(this));

            return this;
        }
    },

    /**
     *
     */
    displayFailedCallback: function () {
        var data = {
            event: 'apester-sdk-display-failed',
            properties: {},
            metadata: {
                'language': window.navigator.userLanguage || window.navigator.language,
                'referrer': document.location.href,
                'screenHeight': screen.height + "",
                'screenWidth': screen.width + ""
            }
        };
        if (this.isRandom) {
            data.properties.channelToken = this.id;
        } else {
            data.properties.interactionId = this.id;
        }

        this.utils.cleanData(data);
        ApesterEvents.sendJSON(this.config.eventCollectorUrl, data);
    },

    /**
     *
     */
    sendDisplayedEvent: function () {
        var data = {
            event: 'apester-sdk-display-ready',
            properties: {
                'sdkVersion': this.config.VERSION,
                'sdkType': this.config.TYPE,
                'interactionId': this.interaction.interactionId,
                'publisherId': this.interaction.publisherId,
                'creatorId': this.interaction.userId,
                'engine': this.interaction.layout.directive
            },
            metadata: {
                'language': window.navigator.userLanguage || window.navigator.language,
                'referrer': document.location.href,
                'screenHeight': screen.height + "",
                'screenWidth': screen.width + ""
            }
        };

        this.utils.cleanData(data);
        ApesterEvents.sendJSON(this.config.eventCollectorUrl, data);
        return this;
    }
    ,

    /**
     * Creating a loader GIF, only for none mobile devices.
     * @returns {ApesterInteraction}
     */
    createLoader: function () {
        var containerElement = this.containerElement;

        // Set the size of the container containerElement
        this.utils.setElementStyle(containerElement);

        // NOTE: We create a GIF loader only for none mobile devices.
        if (!this.utils.isMobileDevice) {
            var gif = this.utils.buildGif(this.id);
            containerElement.appendChild(gif);
        }

        return this;
    }
    ,

    /**
     * Create Iframe with the required source
     * @returns {ApesterInteraction}
     */
    createIframe: function () {
        var iframe = this.utils.buildInteractionIframe(this.id);
        this.containerElement.appendChild(iframe);
        return this;
    }
    ,

    setTimeout: function () {
        function timeoutCallback(id) {
            var msg = {
                timeout: true,
                interactionId: id
            };
            window.postMessage(msg, location.origin);
        }

        this.timer.start(timeoutCallback.bind(null, this.id));
        return this;
    }
}
;