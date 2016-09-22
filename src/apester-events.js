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
        return JSON.parse(response);
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

    function fetch(url, success, failed) {
        function onready() {
            var response = this;
            if (assertSuccess(response, failed)) {
                var parsed = parseResponse(response.responseText);

                // run callback after parsing
                success(parsed);
            }
        }

        var xhr = createXhrRequest('GET', url, onready);
        xhr.send(null);
    }

    return {
        send: send,
        sendJSON: sendJSON,
        fetch: fetch
    }
})();