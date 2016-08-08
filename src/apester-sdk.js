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
