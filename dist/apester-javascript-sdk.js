try {
(function(){
 'use strict'
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
         * @param {boolean} random
         * @returns {string}
         */
        function composeInteractionSrc(id, random) {
            if (random) {
                return config.randomBaseUrl + '/interaction/random/v2/' + id;
            }
            return config.playerBaseUrl + '/interaction/' + id;
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

        return {

            /**
             * Calls given callback when DOM is ready
             * @param {function} callback
             */
            onDocumentReady: function (callback) {
                if (document.readyState === 'complete') {
                    // Register event to document on-load
                    return callback();
                }

                document.addEventListener('DOMContentLoaded', callback, false);
                window.addEventListener('load', callback, false);
            },
            /**
             * Builds interaction iframe element.
             * @param {string} id
             * @param {boolean} random
             * @returns {document.Element}
             */
            buildInteractionIframe: function (id, random) {

                // TODO: maybe test length == 24?
                //TODO: when we have get random path we should make this work only with id parameter.
                var iframe = document.createElement('iframe');

                iframe.src = composeInteractionSrc(id, random);
                iframe.class = 'qmerce-interaction';
                iframe.setAttribute('data-interaction-id', id);
                iframe.setAttribute('from-sdk', '');

                // iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');

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
            buildGif: function (id, GIF_URL) {
                var parent = document.createElement('div');
                var img = document.createElement('img');

                parent.id = 'ape_wrapper_' + id;
                parent.style.height = '100%';
                parent.style.width = '100%';
                parent.style.position = 'absolute';
                parent.style.backgroundColor = 'white';

                img.className = 'ape_img_' + id;
                img.src = GIF_URL;
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
            isMobileDevice: isMobileDevice(),

            /**
             * Check if element is inside view port.
             * @param el
             * @returns {boolean}
             */
            isElementInViewport: function (el) {
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
            },

            /**
             * Visability change handler.
             * @param el
             * @param callback
             * @returns {Function}
             */
            onVisibilityChange: function (el, callback) {
                return function () {
                    var visible = this.isElementInViewport(el);
                    if (visible) {
                        if (typeof callback == 'function' && visible) {
                            callback(el);
                        }
                    }
                }.bind(this);
            }

        };
    }

    return {

        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: function () {

            if (!instance) {
                instance = init();
            }

            return instance;
        }
    };
})();
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
/**
 * Scraper module is designed to collect page data in order to supply
 * relevant content suggestions.
 * @constructor
 */
var ApesterScraper = (function () {

    // private fields
    var data = {};
    var interactions = [];
    var isPrivate = false;
    var apesterEmbeddedPresent = false;
    var apesterSDKPresent = false;

    // private functions
    function isPublic() {
        var publicFlag = true;
        // if (location.hostname.search(/^(preview|stage|integration|private)/) > -1) {
        //     publicFlag = false;
        // }
        // if (this.isPrivate) {
        //     publicFlag = false;
        // }
        //
        // if (window.isPrivate) {
        //     publicFlag = false
        // }
        return publicFlag
    }

    function setPrivate(flag) {
        isPrivate = flag;
    }

    function collectPageData() {

        //NOTE: LINKS > METAS > BROWSER
        var metas = document.getElementsByTagName('meta');
        for (var i = 0; i < metas.length; i++) {
            extractMetaTagAttributes(metas[i]);
        }

        // NOTE links overwrite meta!
        var links = document.getElementsByTagName('link');
        for (var i = 0; i < links.length; i++) {
            extractLinkTagAttributes(links[i]);
        }

        // Title
        /*if (typeof data["title"] === 'undefined') {
         var title = document.title;
         data["title"] = document.title;
         }*/
        if (document.title && typeof document.title !== 'undefined') {
            data["title"] = document.title;
        }

        // URL
        if (typeof data["url"] === 'undefined') {
            var url = document.location.href
            data["url"] = url;
        }

        // Language fallback
        if (typeof data["locale"] === 'undefined') {
            var lang = document.documentElement.lang;
            data["locale"] = lang;
        }
    }

    function pushOrInit(field, value) {
        if (!data[field]) {
            data[field] = []
        }
        data[field].push(value);
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

    // public
    return {

        // members
        apesterEmbeddedPresent: findEmbedded(),
        apesterSDKPresent: findSDK(),

        // functions
        collect: function () {
            if (isPublic()) {
                collectPageData();
            }
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
            if(!hasClass(parent, 'ape-interaction')) {
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
                //"slides": slides || [],
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
})();
/**
 * Apester embed component configuration.
 * Set as a singleton for general use.
 * @type {{getInstance}}
 */
var ApesterConfig = (function () {

    var instance;

    function init() {

        /**
         * Builds flicker image
         * @param image
         * @returns {*}
         */
        function buildFlickerUrl(photo, size, format) {
            var size = 'b',
                format = 'jpg';

            var flickrUrl = 'farm{farm-id}.staticflickr.com%2f{server-id}%2f{id}_{secret}_{size}.{format}'
                .replace('{farm-id}', photo.farm)
                .replace('{server-id}', photo.server)
                .replace('{id}', photo.id)
                .replace('{secret}', photo.secret)
                .replace('{size}', size)
                .replace('{format}', format);

            return "//images.apester.com/ext_ssl/" + flickrUrl;
        }

        /**
         * Builds Youtube video image.
         * @param videoId
         * @returns {string}
         */
        function buildYoutubeUrl(videoId) {
            return "//img.youtube.com/vi/" + videoId + "/hqdefault.jpg"
        }


        return {
            GIF_URL: 'https://images.apester.com/images%2Floader.gif',
            playerBaseUrl: window.location.protocol + '//renderer.qmerce.com',
            randomBaseUrl: window.location.protocol + '//random.qmerce.com',
            displayBaseUrl: window.location.protocol + '//display.apester.com',
            cdn_url: "//images.apester.com/",
            eventCollectorUrl: window.location.protocol + '//events.apester.com/event',

            /**
             * Return Youtube video image.
             * @param videoId
             * @returns {string}
             */
            youtube_video_thumb: function (videoId) {
                buildYoutubeUrl(videoId);
            },
            /**
             * Returns flicker image
             * @param image
             * @returns {*}
             */
            flickr_thumb: function (image) {
                return buildFlickerUrl(image);
            },
            events: ["DOMContentLoaded", "load", "scroll", "resize"]
        };
    }

    return {

        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: function () {

            if (!instance) {
                instance = init();
            }

            return instance;
        }
    };
})();

var ApesterSDK = (function () {
    var scraper = ApesterScraper;
    var interactionElements = [];
    var config = ApesterConfig.getInstance();
    var interactions = [];
    var pageData = {};
    var isSent = false;
    var isRendered = false;

    Function.prototype.ApesterBind = (function () {
        if (!Function.prototype.bind) {
            return function (oThis) {
                if (typeof this !== 'function') {
                    // closest thing possible to the ECMAScript 5
                    // internal IsCallable function
                    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    fNOP = function () {
                    },
                    fBound = function () {
                        return fToBind.apply(this instanceof fNOP
                                ? this
                                : oThis,
                            aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                if (this.prototype) {
                    // Function.prototype doesn't have a prototype property
                    fNOP.prototype = this.prototype;
                }
                fBound.prototype = new fNOP();

                return fBound;
            };
        } else {
            return Function.prototype.bind;
        }
    })();

    // only run once
    if (!scraper.apesterSDKPresent) {
        onDocumentReady(render);
    } else {

        // bye bye :)
        console.error("ApesterSDK already loaded, make sure to include it only once!");
    }

    function render() {

        interactionElements = scraper.findInteractionTags();
        // Sometimes, we call render function twice as we register few DOM ready events.
        if (!isRendered) {
            isRendered = true;

            // Display
            //TODO: build a strategy/template-method here
            for (var i = 0; i < interactionElements.length; i++) {
                var interaction = new ApesterInteraction(interactionElements[i]);
                interactions.push(interaction);
                interaction.display();
            }

            // scrape, adapt and send!
            scrapeData();
            adaptData();
            sendData();
        }
    }

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

    function scrapeData() {
        pageData = scraper.collect();
    }

    function sendData() {
        if (interactions.length > 0) {

            // yay units!  Add event to trigger iframe resize
            window.addEventListener('message', messagesHandler);
        } else {

            // nay units! just send page data
            // NOTE: Only if we don't have other embedded scripts ...
            if (!scraper.apesterEmbeddedPresent) {
                sendDataToCollector();
            } else {
                console.log('ApesterSDK sleeps, ApesterEmbedded is here!');
            }
        }
    }

    function sendDataToCollector() {
        try {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function (state) {
                if (xmlHttp.response && xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                    isSent = true;
                    console.log(xmlHttp.response);
                }
            };

            if (pageData && !isSent) {
                xmlHttp.open("POST", config.eventCollectorUrl, true); // true for asynchronous
                xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xmlHttp.send(JSON.stringify(pageData));
                console.log("SDK DATA PAYLOAD", pageData);
            }
        } catch (e) {
            console.error('Send data to ' + config.eventCollectorUrl + ' failed: ', e);
        }
    }

    function findInteractionContainerByID(id) {
        var interactions = interactionElements;
        for (var i = 0; i < interactions.length; i = i + 1) {
            var currentInteraction = interactions[i];
            if (currentInteraction.id === id) {
                return interactions.splice(i, 1)[0];
            }
        }


        for (var i = 0; i < interactions.length; i = i + 1) {
            var currentInteraction = interactions[i];
            if (currentInteraction.dataset.random) {
                return interactions.splice(i, 1)[0];
            }
        }

    }


    function messagesHandler(event) {
        if (event.origin.search("qmerce|apester|localhost") > -1) {
            if (event.data.interaction) {
                var interaction = event.data.interaction;
                var interactionDimensions = {};

                interactionDimensions.interactionId = interaction.interactionId;
                interactionDimensions.width = (interaction.data.size || {}).width || 600;
                interactionDimensions.height = (interaction.data.size || {}).height > 0 ? (interaction.data.size || {}).height - 40 : 338;

                // contest poll is created with the correct height on the editor side so
                // we don't need to subtract 40px
                if (interaction.layout.directive === 'contest-poll') {
                    interactionDimensions.height += 40;
                }

                var interactionTag = findInteractionContainerByID(event.data.interaction.interactionId);
                if (interactionTag) {
                    adjustIframeSize(interactionDimensions, interactionTag);
                    addInteractionData(interaction);
                    cleanData(pageData);
                    sendDataToCollector();
                    sendMessageToInteractionIFrame(interactionTag);
                }
            }

            if (event.data.timeout) {
                var interactionId = event.data.interactionId;
                var interactionTag = findInteractionContainerByID(interactionId);
                if (interactionTag) {

                    var interactionDimensions = {};
                    interactionDimensions.interactionId = interactionId;
                    interactionDimensions.width = 0;
                    interactionDimensions.height = 0;
                    adjustIframeSize(interactionDimensions, interactionTag);
                    hideInteraction(interactionTag);

                }
            }
        }
    }

    //TODO: remove this ASAP. provide a fallback option for non-loading interactions.
    function hideInteraction(elm) {
        setTimeout(function () {
            elm.style.display = "none";
        }, 3100);
    }

    function cleanData(obj) {
        for (var key in obj) {
            if (obj[key] === null || typeof obj[key] === 'undefined' || obj[key].length == 0) {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                cleanData(obj[key]);
            }
        }
    }

    function addInteractionData(interaction) {
        var interactionData = scraper.collectInteractionData(interaction);
        var data = pageData;

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
    }

    /**
     * Resizing of Iframe according to interaction's requirements.
     * @param recivedDimension {Object}
     * @param interaction {HTMLElement}
     * @returns {
     */
    function adjustIframeSize(recivedDimension, interaction) {
        try {
            var iframe = interaction.getElementsByTagName('iframe')[0];
            var id = interaction.id || interaction.dataset.random;

            // Change DOM id identifier to match actual interaction id
            if (interaction.dataset.random) {
                iframe.dataset.interactionId = recivedDimension.interactionId;
            }

            resizeLoader(id, recivedDimension.height, interaction);
            fadeLoaderOut(id, interaction);
            iframe.height = recivedDimension.height;

        } catch (e) {
            console.error('onIframeMessage error: ', e);
            return;
        }
    }


    function extractImage(interaction) {
        var image_url;
        //Legacy??
        if (interaction.data) {
            //Newest model??
            if (interaction.data.resultsSlides) {
                interaction.image = interaction.data.resultsSlides.length > 0 ? interaction.data.resultsSlides[0].image : interaction.data.backgroundImage
            }
        }
        //Newer model??
        if (interaction.image) {

            // collage support. pass full collage object
            if (interaction.image.hasOwnProperty('background')) {
                image_url = JSON.stringify(interaction.image);
            }
            // old image model
            else {
                if (interaction.image.type === "flickr") {
                    image_url = config.flickr_thumb(interaction.image)
                } else {
                    image_url = config.cdn_url + interaction.image.path.replace(/\//g, "%2f");
                }
            }
        } else if (interaction.layout.name.indexOf("video") > -1) {
            image_url = config.video_thumb(interaction.data.videoId);
        }
        return image_url;
    }

    function extractImageFilter(interaction) {
        var imageFilter;

        if (interaction.image && interaction.image.filter) {
            imageFilter = interaction.image.filter;
        }
        return imageFilter;
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
         * Message router which handles events from the current interaction
         * @param event
         */
        messagesHandler: messagesHandler
    }
})();

})(); 
}
 catch(e) {  var xmlHttp = new XMLHttpRequest();xmlHttp.open("POST", "https://events.apester.com/event", true);xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");xmlHttp.send(JSON.stringify({event: "apester-sdk-crashed",properties: {destinationUri: document.location.href},metadata: {userAgent: navigator.userAgent}}));console.error("ApesterSDK had critical error, please contact us with the following error message: ", e)}