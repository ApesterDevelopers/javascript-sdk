try {
(function(){
 'use strict'
 /**
 * Scraper module is designed to collect page data in order to supply
 * relevant content suggestions.
 * @constructor
 */
var ApesterData = function () {

    var data = {};
    var interactions = [];

    function collectPageData() {

        //NOTE: LINKS > METAS > BROWSER
        var metas = document.getElementsByTagName('meta');
        for (var i = 0; i < metas.length; i++) {
            extractMetaTagAttributes(metas[i]);
        }

        //NOTE: links overwrite meta!
        var links = document.getElementsByTagName('link');
        for (var i = 0; i < links.length; i++) {
            extractLinkTagAttributes(links[i]);
        }

        //NOTE: Highest priority
        if (document.title && typeof document.title !== 'undefined') {
            data["title"] = document.title;
        }

        // URL
        if (typeof data["url"] === 'undefined') {
            var url = document.location.href;
            data["url"] = url;
        }

        // Language fallback
        if (typeof data["locale"] === 'undefined') {
            var lang = document.documentElement.lang;
            data["locale"] = lang;
        }
    }

    function extractMetaTagAttributes(i_Tag) {
        var prop = i_Tag.getAttribute('property');
        var content = i_Tag.getAttribute('content');
        var name = i_Tag.getAttribute('name');
        if (content && typeof content !== 'undefined') {
            switch (prop) {
                case 'twitter:url':
                case 'twitter:title':
                case 'twitter:image':
                    var propSplit = prop.split(':');
                    //pushOrInit(propSplit[1], content);     /// change from push or init to prioritizing facebook og to twitter !
                    if (typeof data[propSplit[1]] === 'undefined')
                        data[propSplit[1]] = content;
                    break;
                case 'og:locale':
                case 'og:description':
                case 'article:tag':
                case 'article:published_time':
                case 'article:modified_time':
                case 'article:expiration_time':
                case 'article:author':
                case "article:section":

                // higher  priority then twitter tags
                case 'og:title':
                case 'og:image':
                case 'og:url':
                    data[prop.split(':')[1]] = content;
                    break;
            }

            switch (name) {
                case 'viewport':
                    //TODO: verify
                    break;
                case 'keywords':
                    data['tag'] = data['tag'] + ' ' + content;
                    break;
                default:
                    data[name] = content;
            }
        }
        return data;
    }

    function extractLinkTagAttributes(i_Tag) {
        var rel = i_Tag.getAttribute('rel');
        var content = i_Tag.getAttribute('content'); // don't overwrite with empty values
        if (content && typeof content !== 'undefined') {
            switch (i_Tag) {
                case 'image_src':
                    data['image'] = i_Tag.getAttribute('content');
                    break;
                case 'canonical':
                    data['url'] = i_Tag.getAttribute('content');
            }
            return data;
        }
    }

    function findSDK() {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length - 1; i++) {
            if (/apester-sdk/.test(scripts[i].src)) {
                return true;
            }
            if (/qmerce-sdk/.test(scripts[i].src)) {
                return true;
            }
        }
        return false;
    }

    function findEmbedded() {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length - 1; i++) {
            if (/apester-embedded/.test(scripts[i].src)) {
                return true;
            }
            if (/http:\/\/stage3-embed\.apester\.com/.test(scripts[i].src)) {
                return true;
            }
        }

        return false;
    }

    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    return {

        apesterEmbeddedPresent: findEmbedded(),
        apesterSDKPresent: findSDK(),

        // functions
        collect: function () {
            collectPageData();
            return data;
        },
        findInteractionTags: function () {
            interactions = Array.prototype.slice.call(document.getElementsByTagName('interaction'), 0);
            return interactions;
        },

        /**
         * @desc
         * Returns the element containing the current script's <script> tag
         * @returns {*[]}
         */
        getScriptParent: function () {
            var scriptTag = document.getElementsByTagName('script');
            scriptTag = scriptTag[scriptTag.length - 1]
            //  var scriptArr = ;
            var parent = scriptTag.parentNode;
            var parentArr = [parent];
            if (!hasClass(parent, 'ape-interaction')) {
                parentArr = [];
                console.error('ApesterEmbedded parent element must have \'ape-interaction\' class.');
            }

            return parentArr;
        },

        collectInteractionData: function (interaction) {
            var slides = [];

            for (var i = 0; i < interaction.data.slides.length; i = i + 1) {
                slides.push(extractSlide(interaction.data.slides[i]));
            }
            var expires = "";
            if (interaction.publishingOptions && interaction.publishingOptions.endDate) {
                expires = interaction.publishingOptions.endDate;
            }
            return {
                "created": interaction.created,
                "interactionId": interaction.interactionId,
                "language": interaction.language,
                "layout": interaction.layout.name,
                "publisherId": interaction.publisherId,
                "title": interaction.title,
                "updated": interaction.updated,
                "tags": interaction.tags || [],
                "expires": expires,
                "sessionId": interaction.sessionId
            };
            function extractSlide(slide) {
                return {
                    answer: slide.answer,
                    id: slide.id,
                    options: slide.options,
                    title: slide.title
                };
            }
        }
    }
}
/**
 * DOM utils class is responsible for DOM actions,
 * creating of loader, removing of loader and etc.
 * @type {{getInstance}}
 */
var ApesterDOM = (function () {

    var instance;

    function init() {

        var config = ApesterConfig.getInstance();

        /**
         * Composes interaction iframe URL.
         * @param {string} id
         * @returns {string}
         */
        function composeInteractionSrc(id) {
            return config.playerBaseUrl + '/interaction/' + id + '?sdk=' + config.VERSION + config.TYPE;
        }

        /**
         * @desc
         * regex for detecting mobile devices
         * @returns {boolean}
         */
        function isMobileDevice() {
            var check = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))check = true
            })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        }

        /**
         * @desc
         * Check if element is inside view port.
         * @param el
         * @returns {boolean}
         */
        function isElementInViewport(el) {

            //special bonus for those using jQuery
            if (typeof jQuery === "function" && el instanceof jQuery) {
                el = el[0];
            }

            var rect = el.getBoundingClientRect();
            var elemVisableTop = window.innerHeight - rect.top;
            var thirtyPixelsVisable = rect.top >= 0 ? elemVisableTop >= 30 : rect.bottom >= 30;

            return (rect.bottom >= 0 && rect.right >= 0
                && rect.top <= (window.innerHeight || document.documentElement.clientHeight)
                && rect.left <= (window.innerWidth || document.documentElement.clientWidth)) && thirtyPixelsVisable;
        }

        /**
         * @desc
         * call the callback only if the visibility has changed .
         * @param el
         * @param callback
         * @returns {Function}
         */
        function onVisibilityChange(el, callback) {
            return function () {
                var visible = isElementInViewport(el);
                if (visible) {
                    if (typeof callback == 'function' && visible) {
                        callback(el);
                    }
                }
            };
        }

        /**
         * @desc
         * Add event listeners to window
         * @param callback
         * @returns {void}
         */
        function addEventListenersToViewport(callback) {

            // DOMContentLoaded added for IE9+ compatibility
            var events = config.events,
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
        }

        /**
         * @desc
         * Remove event listeners from window
         * @param callback
         * @returns {void}
         */
        function removeEventListenersFromViewport(callback) {

            // DOMContentLoaded added for IE9+ compatibility
            var events = config.events,
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

        return {

            /**
             * Builds interaction iframe element.
             * @param {string} id
             * @returns {document.Element}
             */
            buildInteractionIframe: function (id) {
                var iframe = document.createElement('iframe');

                iframe.src = composeInteractionSrc(id);
                iframe.class = 'qmerce-interaction';
                iframe.setAttribute('data-interaction-id', id);
                // iframe.setAttribute('from-sdk', '');
                iframe.scrolling = 'no';
                iframe.frameBorder = 0;
                iframe.width = '100%';
                iframe.height = 0;
                iframe.style.maxWidth = '600px';
                iframe.style.margin = '0 auto';

                if (document.body.clientWidth < 600) {
                    iframe.height = 400;
                }
                return iframe;
            },
            /**
             * @desc
             * init base styling on a single ".ape-interaction" div
             */
            setElementStyle: function (node) {
                node.style.width = '100%';
                node.style.maxWidth = '600px';
                node.style.margin = '0 auto';
                node.style.display = 'block';
                node.style.position = 'relative';
                node.style.minHeight = '350px';
            },

            /**
             * @desc
             * append loading gif until we actually embed the interaction on the page
             * @param id {String} id of the interaction
             * @returns {Element}
             */
            buildGif: function (id) {
                var parent = document.createElement('div');
                var img = document.createElement('img');

                parent.id = 'ape_wrapper_' + id;
                parent.style.height = '100%';
                parent.style.width = '100%';
                parent.style.position = 'absolute';
                parent.style.backgroundColor = 'white';

                img.className = 'ape_img_' + id;
                img.src = config.GIF_URL;
                img.style.height = '100px';
                img.style.width = '100px';
                img.style.display = 'block';
                img.style.top = '50%';
                img.style.left = '50%';
                img.style.position = 'absolute';
                img.style.transform = 'translate(-50%,-50%)';
                img.style['margin-top'] = '-22px';

                parent.appendChild(img);

                return parent;
            },

            /**
             * @desc
             * Set onVisibilityChange and viewport events listeners, callback will be called only once.
             * @param el
             * @param callback
             * @returns {void}
             */
            setViewportListeners: function (el, callback) {
                var handler = onVisibilityChange(el, function (event) {
                    callback(event);

                    // listen only once
                    removeEventListenersFromViewport(handler);
                });

                // Add multiple events to know when container element is in viewport (interaction seen)
                addEventListenersToViewport(handler);

                // trigger on set
                handler();
            },

            cleanData: function (obj) {
                for (var key in obj) {
                    if (obj[key] === null || typeof obj[key] === 'undefined' || obj[key].length == 0) {
                        delete obj[key];
                    } else if (typeof obj[key] === 'object') {
                        this.cleanData(obj[key]);
                    }

                }
            },

            isMobileDevice: isMobileDevice()
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
var ApesterEvents = (function () {

    /**
     * @param {string} method
     * @param {string} url
     * @return {!XMLHttpRequest|!XDomainRequest}
     * @private
     */
    function createXhrRequest(method, url, readyChange) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = readyChange;
        if ('withCredentials' in xhr) {
            xhr.open(method, url, true);
        } else if (typeof XDomainRequest != 'undefined') {
            // IE-specific object.
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            throw new Error('CORS is not supported');
        }
        return xhr;
    }

    function assertSuccess(response, failedCallback) {
        if (response.readyState === 4) {
            if (response.status === 200) {
                return true;
            } else {
                failedCallback();
                return false;
            }
        } else {
            return false;
        }
    }

    function parseResponse(response) {
        return JSON.parse(response).payload;
    }

    function send(method, url, str) {
        var xhr = createXhrRequest(method, url, null);
        xhr.send(str);
        return xhr;
    }

    function sendJSON(url, json) {
        var xhr = createXhrRequest("POST", url, null);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(json));
    }

    function fetch(method, url, callback, failed) {
        function onready() {
            var response = this;
            if (assertSuccess(response, failed)) {
                var parsed = parseResponse(response.response);

                // run callback after parsing
                callback(parsed);
            }
        }

        var xhr = createXhrRequest(method, url, onready);
        xhr.send(null);
    }

    return {
        send: send,
        sendJSON: sendJSON,
        fetch: fetch
    }
})();
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
            VERSION: '2.0',
            TYPE: '',
            events: ["DOMContentLoaded", "load", "scroll", "resize"]
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
var ApesterSDK = (function () {
    var dataProvider = new ApesterData();
    var interactionElements = [];
    var utils = ApesterDOM.getInstance();
    var config = ApesterConfig.getInstance();
    var interactions = [];
    var pageData = {};
    var isRendered = false;

    // only run once
    if (!dataProvider.apesterSDKPresent) {
        onDocumentReady(render);

        sendLoadedData();
    } else {

        // bye bye :)
        console.error("ApesterSDK already loaded, make sure to include it only once!");
    }

    /**
     * Send 'apester-sdk-loaded' event
     */
    function sendLoadedData() {
        var data = {
            event: 'apester-sdk-loaded',
            properties: {
                'sdkVersion': config.VERSION,
                'sdkType': config.TYPE
            },
            metadata: {
                'language': window.navigator.userLanguage || window.navigator.language,
                'referrer': document.location.href,
                'screenHeight': screen.height + "",
                'screenWidth': screen.width + ""
            }
        };
        utils.cleanData(data);
        ApesterEvents.sendJSON(config.eventCollectorUrl, data);

    }


    /**
     * @desc
     * Find interaction tags in the DOM and create ApesterInteraction object and timer couple
     * gather, adapt and send data
     */
    function render() {
        interactionElements = dataProvider.findInteractionTags();
        if (!isRendered) {
            isRendered = true;

            // Display
            //TODO: build a strategy/template-method here
            for (var i = 0; i < interactionElements.length; i++) {
                var timer = new ApesterTimer();
                var interaction = new ApesterInteraction(interactionElements[i], timer);
                interactions.push({interaction: interactionElements[i], timer: timer});
                interaction.display();
            }

            // parse, adapt and send!
            parseData();
            adaptData();
            sendData();
        }
    }

    /**
     * @desc
     * Collect data
     */
    function parseData() {
        pageData = dataProvider.collect();
    }

    /**
     * @desc
     * Adapt data collected to match eventCollector scheme
     */
    function adaptData() {
        var data = pageData;
        var metaData = {
            destinationLanguage: data.locale,
            destinationTitle: data.title,
            destinationDescription: data.description,
            destinationContext: data.tag,
            destinationPreview: data.image,
            destinationPublishDate: data.published_time,
            destinationUpdateDate: data.modified_time,
            destinationExpirationDate: data.expiration_time,
            destinationAuthor: data.author,
            destinationSection: data.section
        };

        var properties = {
            destinationUri: data.url
        };
        pageData = {
            event: "recommendation_collected",
            properties: properties,
            metadata: metaData
        };
    }


    /**
     * @desc
     * When there are no units, we send only page data,
     * otherwise we subscribe messagesRouter to listen to post messages.
     */
    function sendData() {
        if (interactions.length > 0) {

            // yay units!  Add event to trigger iframe resize
            window.addEventListener('message', messagesRouter);
        } else {

            // nay units! just send page data
            // NOTE: Only if we don't have other embedded scripts ...
            if (!dataProvider.apesterEmbeddedPresent) {
                sendDataToCollector(pageData);
            } else {
                console.log('ApesterSDK sleeps, ApesterEmbedded is here!');
            }
        }
    }

    /**
     * @desc
     * Add interaction and add it to pageData
     * @param interaction
     */
    function addInteractionData(interaction) {
        var interactionData = dataProvider.collectInteractionData(interaction);
        var data = JSON.parse(JSON.stringify(pageData)); // clone pageData

        // metadata
        data.metadata.mediaChannelId = interactionData.publisherId;
        data.metadata.mediaUserId = interactionData.userId;
        data.metadata.mediaTitle = interactionData.title;
        data.metadata.mediaTags = interactionData.tag;
        data.metadata.mediaCreationDate = interactionData.created;
        data.metadata.mediaContext = interactionData.slides;
        data.metadata.mediaUpdateDate = interactionData.updated;
        data.metadata.mediaExpirationDate = interactionData.expires;
        data.metadata.mediaLanguage = interactionData.language;

        // properties
        data.properties.interactionId = interactionData.interactionId;

        // sessionId
        data.sessionId = interactionData.sessionId;

        return data;
    }

    /**
     * @desc
     * Send adapted data with the interaction data added to eventCollector
     * @param data {Object}
     */
    function sendDataToCollector(data) {
        ApesterEvents.sendJSON(config.eventCollectorUrl, data);
    }


    //TODO: Optimize for better lookup/**/
    function findInteractionContainerByID(id) {
        for (var i = 0; i < interactions.length; i = i + 1) {
            var currentInteraction = interactions[i].interaction;
            if (currentInteraction.id === id) {
                return interactions.splice(i, 1)[0];
            }
        }
    }

    function interactionLoadedHandler(interaction) {
        var interactionDimensions = {};
        interactionDimensions.interactionId = interaction.interactionId;
        interactionDimensions.width = (interaction.data.size || {}).width || 600;
        interactionDimensions.height = (interaction.data.size || {}).height > 0 ? (interaction.data.size || {}).height - 40 : 338;

        // contest poll is created with the correct height on the editor side so
        // we don't need to subtract 40px
        if (interaction.layout.directive === 'contest-poll') {
            interactionDimensions.height += 40;
        }

        var interactionCouple = findInteractionContainerByID(interaction.interactionId);
        if (interactionCouple) {

            // clear timeout timer.
            var loadedIn = interactionCouple.timer.clear();

            // process data collection
            var interactionTag = interactionCouple.interaction;
            adjustIframeSize(interactionDimensions, interactionTag);
            setListeners(interactionTag);
            var data = addInteractionData(interaction);
            utils.cleanData(data);

            // if(loadedIn) {
            //     data.properties.loadTime = loadedIn;
            // }
            sendDataToCollector(data);
            sendMessageToInteractionIFrame(interactionTag);
        }
    }

    function interactionTimeoutHandler(interactionId) {
        var interactionCouple = findInteractionContainerByID(interactionId);
        if (interactionCouple) {
            var interactionTag = interactionCouple.interaction;
            var interactionDimensions = {};
            interactionDimensions.interactionId = interactionId;
            interactionDimensions.width = 0;
            interactionDimensions.height = 0;
            adjustIframeSize(interactionDimensions, interactionTag);
            hideInteraction(interactionTag);

            // dispatch timeout event.
            var data = {
                event: "apester-sdk-timeout",
                properties: {
                    'sdkVersion': config.VERSION,
                    'sdkType': config.TYPE,
                    'interactionId': interactionId
                },
                metadata: {
                    'language': window.navigator.userLanguage || window.navigator.language,
                    'referrer': document.location.href,
                    'screenHeight': screen.height + "",
                    'screenWidth': screen.width + "",
                    'currentUrl': interactionTag.src
                }
            };
            utils.cleanData(data);
            ApesterEvents.sendJSON(config.eventCollectorUrl, data);
        }
    }

    function messagesRouter(event) {
        if (event.origin.search("qmerce|apester|localhost") > -1) {
            if (event.data.interaction) {
                interactionLoadedHandler(event.data.interaction);
            }

            if (event.data.timeout) {
                interactionTimeoutHandler(event.data.interactionId)
            }
        }
    }

    function setListeners(interactionTag) {

        // sending 'interaction seen' message back to iframe
        function reportSeen(evtElement) {
            var eventInteractionOrChannelId = evtElement.id;

            // We check that the event we recived was triggered by our interaction.
            if (eventInteractionOrChannelId === interactionTag.id) {
                evtElement.querySelector('iframe').contentWindow.postMessage('interaction seen', "*");
            }
        }

        utils.setViewportListeners(interactionTag, reportSeen);
    }

    //TODO: remove this ASAP. provide a fallback option for non-loading interactions.
    function hideInteraction(elm) {
        setTimeout(function () {
            elm.style.display = 'none';
        }, 3100);
    }

    /**
     * Resizing of Iframe according to interaction's requirements.
     * @param recivedDimension {Object}
     * @param interaction {HTMLElement}
     * @returns {
     */
    function adjustIframeSize(recivedDimension, interaction) {
        var iframe = interaction.getElementsByTagName('iframe')[0];
        if (iframe) {
            var id = interaction.id || interaction.dataset.random;

            // Change DOM id identifier to match actual interaction id
            if (interaction.dataset.random) {
                iframe.dataset.interactionId = recivedDimension.interactionId;
            }

            resizeLoader(id, recivedDimension.height, interaction);
            fadeLoaderOut(id, interaction);
            iframe.height = recivedDimension.height;
        }
    }

    /**
     * Calls given callback when DOM is ready
     * @param {function} callback
     */
    function onDocumentReady(callback) {
        if (document.readyState === 'complete') {
            // Register event to document on-load
            return callback();
        }

        document.addEventListener('DOMContentLoaded', callback, false);
        window.addEventListener('load', callback, false);
    }

    /**
     * Resize loader wrapper to fit interaction dimensions
     * @param id
     * @param height
     * @param height
     */
    function resizeLoader(id, height, interaction) {
        var loader = interaction.querySelector('.ape_wrapper_' + id);
        if (loader) {
            loader.style.height = height + 'px';
        }
    }

    /**
     * Find the loader and apply fadeout transition
     * @param id
     * @param interaction
     */
    function fadeLoaderOut(id, interaction) {
        var FADE_SEC = 3;
        var img = interaction.querySelector('.ape_img_' + id);

        if (img) {
            setTimeout(function () {
                img.parentNode.style['transition'] = 'opacity ' + FADE_SEC + 's ease-in-out';
                img.parentNode.style['-webkit-transition'] = 'opacity ' + FADE_SEC + 's ease-in-out';
                img.parentNode.style['-moz-transition'] = 'opacity ' + FADE_SEC + 's ease-in-out';
                img.parentNode.style.opacity = 0;

                setTimeout(function () {
                    img.parentNode.parentNode.removeChild(img.parentNode);
                }, FADE_SEC * 1000);
            }, 100);
        }
    }

    /**
     *  Send post message to iframe to notify renderer we are using EMBEDDED script.
     **/
    function sendMessageToInteractionIFrame(interactionTag) {
        var iframe = interactionTag.getElementsByTagName('iframe')[0];
        iframe.contentWindow.postMessage("apester-sdk", "*");
    }

    return {
        render: render,

        /**
         * Message router which handles events from interactions
         * @param event
         */
        messagesRouter: messagesRouter
    }
})();

/**
 * Created by oriavraham on 04/08/2016.
 */

var ApesterTimer = function () {

    var timer;
    var TIME_DURATION  =  ApesterConfig.getInstance().TIMEOUT_DURATION;
    var startTime;
    var endTime;
    return {

        start: function (callback) {
            timer = setTimeout(function () {
                startTime = new Date().getTime()
                callback();
            }, TIME_DURATION)
        },

        clear: function () {
            endTime =  new Date().getTime();
            clearTimeout(timer);
            return endTime - startTime;
        }

    }

}

})(); 
}
 catch(e) {  var xmlHttp = new XMLHttpRequest();xmlHttp.open("POST", "https://events.apester.com/event", true);xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");xmlHttp.send(JSON.stringify({event: "apester-sdk-crashed",properties: {destinationUri: document.location.href},metadata: {}}));console.error("ApesterSDK had critical error, please contact us with the following error message: ", e)}