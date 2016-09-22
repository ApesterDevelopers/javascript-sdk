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
                iframe.style.display = 'block';
                iframe.style.setProperty('margin', '0 auto', 'important');

                if (document.body.clientWidth < 600) {
                    iframe.height = 400;
                }
                return iframe;
            },
            /**
             * @desc
             * init base styling on a single ".ape-interaction" div
             */
            setElementStyle: function (node, height, width, margin) {
                node.style.width = '100%';
                node.style.maxWidth = width + "px";
                node.style.margin = margin + ' auto';
                node.style.display = 'block';
                node.style.position = 'relative';
                node.style.minHeight = height + "px";
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
                img.style['margin-top'] = '-50px';
                img.style['margin-left'] = '-50px';
                img.style.setProperty('background', 'transparent', 'important');

                parent.appendChild(img);

                return parent;
            },

            /**
             * Determines interaction height based on type of interaction (countdown/video) or if it got updated
             * @returns {*}
             */
            setHeight: function (interaction) {
                var _isContestPoll = !!interaction.data.preResult; // Check whether the interaction is countdown
                var _isVideo = !!interaction.data.videoId; // Check whether the interaction is video

                function _updatedVersion() {
                    //determines whether the interaction got updated or not
                    if (interaction.data.updatedVersion) {
                        return interaction.data.updatedVersion >= 7
                    }
                }

                if ((interaction.data.size || {}).height > 0) {
                    if (_isContestPoll || _isVideo || _updatedVersion()) {
                        // if the interaction is either countdown,video or updated to version 7, just return the height
                        return ((interaction.data.size || {}).height || 338);
                    } else {
                        return (interaction.data.size || {}).height - 40
                    }
                } else {
                    return 338;
                }
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