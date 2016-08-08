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
