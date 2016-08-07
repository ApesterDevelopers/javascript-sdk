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
