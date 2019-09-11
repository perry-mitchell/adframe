export function attachOnLoadListener(frame, comms, callback, verifyLoad = false) {
    let hasFiredOnload = false,
        hasCalledCallback = false,
        hasSentVerificationRequest = false,
        hasVerified = false;
    if (verifyLoad) {
        const removeListener = comms.onMessage(msg => {
            if (msg.type === "verify") {
                hasVerified = true;
                check();
                removeListener();
            }
        });
    }
    const check = () => {
        if (verifyLoad) {
            if (hasVerified) {
                setTimeout(callback, 0);
            } else if (!hasSentVerificationRequest) {
                hasSentVerificationRequest = true;
                comms.sendMessage({ type: "request-verification" });
            }
        } else if (!hasCalledCallback) {
            hasCalledCallback = true;
            setTimeout(callback, 0);
        }
    };
    // Modern browsers:
    frame.onload = function() {
        hasFiredOnload = true;
        check();
    };
    // Older browsers, like Internet Explorer:
    frame.onreadystatechange = function() {
        if (this.readyState === "complete" || this.readyState === "interactive") {
            hasFiredOnload = true;
            check();
        }
    };
}
