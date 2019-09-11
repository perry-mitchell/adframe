/**
 * @typedef {Object} Comms
 */

/**
 * Establish a communication channel with the remote iframe
 * (Waits for a ping from the iframe FIRST before 2-way comms can be
 * configured)
 * @param {String} frameID The unique AdFrame ID
 * @param {Window=} win Optional window reference to place the listener
 * @return {Comms} Comms instance
 */
export function establishComms(frameID, win = window) {
    const messageListeners = [];
    const queuedSends = [];
    const messagePrefix = "AdFrame|" + encodeURIComponent(frameID) + "|";
    let targetWindow = null;
    /**
     * Listen for messages
     * @param {Function} cb Callback method to attach as a listener. Is called with message
     *  objects.
     * @example
     *      onMessage(msg => {
     *          if (msg.type === "something") {
     *              sendMessage({ type: "response" });
     *          }
     *      });
     * @memberof Comms
     */
    const onMessage = cb => {
        messageListeners.push(cb);
        return () => {
            const idx = messageListeners.indexOf(cb);
            if (idx >= 0) {
                messageListeners.splice(idx, 1);
            }
        };
    };
    /**
     * Send a message to the remote window
     * @param {Object} msg The message to send
     * @example
     *      sendMessage({ type: "information", value: 123, another: true });
     * @memberof Comms
     */
    const sendMessage = msg => {
        if (!targetWindow) {
            queuedSends.push(msg);
            return;
        }
        targetWindow.postMessage(messagePrefix + JSON.stringify(msg));
    };
    win.addEventListener("message", event => {
        if (
            event.data &&
            typeof event.data === "string" &&
            event.data.indexOf(messagePrefix) === 0
        ) {
            targetWindow = targetWindow || event.source;
            if (queuedSends.length > 0) {
                queuedSends.forEach(msg => sendMessage(msg));
                queuedSends.splice(0, Infinity);
            }
            var msg = JSON.parse(event.data.replace(messagePrefix, ""));
            messageListeners.forEach(function(cb) {
                try {
                    cb(msg);
                } catch (err) {}
            });
        }
    });
    return {
        onMessage,
        sendMessage
    };
}
