/**
 * Apester interaction Object, responsible for instantiating of interaction.
 * @param containerElement - the container element
 * @constructor
 */

var ApesterInteraction = function (containerElement) {
    this.containerElement = containerElement;
    this.config = ApesterConfig.getInstance();
    this.utils = ApesterDOM.getInstance();
    this.isRandom = this.containerElement.dataset.random ? true : false;
    this.interactionIDOrToken = this.isRandom ? this.containerElement.dataset.random : this.containerElement.id;
    this.interaction = {};
};

ApesterInteraction.prototype = {

    /**
     * The flow is like so:
     * Check what to display -> create loader -> create Iframe.
     * Listeneres for resizing are set by embed object.
     */
    setChainOfResponsibility: function () {
        this.createLoader().createIframe().setListeners();
    },

    //TODO: trigger 'message' event to notify listener to NOT listen to events if the interaction has expired.
    /**
     * Test if the interaction has expired, if it does we do not take any space on the DOM.
     * @returns {ApesterInteraction}
     */
    display: function () {

        /**
         * If it's a random interaction we ask for the interaction to display.
         */
        if (this.isRandom) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function(state) {
               if (xmlHttp.response && xmlHttp.readyState === 4 && JSON.parse(xmlHttp.response).payload && xmlHttp.status === 200) {
                   this.interaction = JSON.parse(xmlHttp.response).payload;
                   this.setChainOfResponsibility();
               }
            }.ApesterBind(this);
            if (this.interactionIDOrToken) {
               xmlHttp.open("GET", this.config.displayBaseUrl +'/tokens/' + this.interactionIDOrToken + '/interactions/random', true); // true for asynchronous
               xmlHttp.send(null);
            }


        } else {
            /**
             * We test if the interaction may be displayed.
             */
            var xmlHttp = new XMLHttpRequest();

            // We bind the callback function in order to have the "This" object set to the embed object scope.
            xmlHttp.onreadystatechange = function (state) {
                if (xmlHttp.response && xmlHttp.readyState === 4 && JSON.parse(xmlHttp.response).payload && xmlHttp.status === 200) {
                    this.interaction = JSON.parse(xmlHttp.response).payload;
                    this.setChainOfResponsibility();
                }
            }.ApesterBind(this);
            if (this.interactionIDOrToken) {
                xmlHttp.open("GET", this.config.displayBaseUrl + '/interactions/' + this.interactionIDOrToken + '/display', true); // true for asynchronous
                xmlHttp.send(null);
            }
        }

        return this;
    },

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
            containerElement.appendChild(this.utils.buildGif(this.interactionIDOrToken, this.config.GIF_URL));
        }

        return this;
    }
    ,

    /**
     * Create Iframe with the required source
     * @returns {ApesterInteraction}
     */
    createIframe: function () {
        this.containerElement.appendChild(this.utils.buildInteractionIframe(this.interactionIDOrToken, this.isRandom));
        return this;
    }
    ,

    /**
     * Set listeners for change viewport of the interaction and resize event for interaction who finished rendering.
     * @returns {ApesterInteraction}
     */
    setListeners: function () {

        // Check if interaction visible ON THE SCREEN, if it does post Interaction seen event.
        var interactionSeenHandler = this.utils.onVisibilityChange(this.containerElement, function (evtElement) {
            var eventInteractionOrChannelId = evtElement.id || evtElement.dataset.random;

            // We check that the event we recived was triggered by our interaction.
            if (eventInteractionOrChannelId === this.interaction.interactionId) {
                evtElement.querySelector('iframe').contentWindow.postMessage('interaction seen', "*");

                // The event should fire only once, so we remove the listener.
                this.removeEventListenersFromViewport(interactionSeenHandler);
            }
        }.ApesterBind(this));

        // Add multiple events to know when container element is in viewport (interaction seen)
        this.addEventListenersToViewport(interactionSeenHandler);

        // Add timeout for loading
        // TODO: how much time?
        setTimeout(function () {
            postMessage({timeout: true, interactionId: this.interactionIDOrToken}, location.origin);
        }.ApesterBind(this), 5000);
        return this;
    },

    //TODO should be private.
    addEventListenersToViewport: function (callback) {

        // DOMContentLoaded added for IE9+ compatibility
        var events = this.config.events,
            i;

        if (window.addEventListener) {
            for (i = 0; i < events.length; i++) {
                addEventListener(events[i], callback, false);
            }
        } else if (window.attachEvent) {
            for (i = 0; i < events.length; i++) {
                attachEvent(events[i], callback);
            }
        }
    },

    //TODO should be private.
    removeEventListenersFromViewport: function (callback) {

        // DOMContentLoaded added for IE9+ compatibility
        var events = this.config.events,
            i;

        if (window.addEventListener) {
            for (i = 0; i < events.length; i++) {
                removeEventListener(events[i], callback, false);
            }
        } else if (window.attachEvent) {
            for (i = 0; i < events.length; i++) {
                detachEvent(events[i], callback);
            }
        }
    }
};