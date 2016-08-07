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