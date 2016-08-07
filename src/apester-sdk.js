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
