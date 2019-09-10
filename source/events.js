export function attachOnLoadListener(frame, callback, verifyLoad = false) {
    let hasFiredOnload = false,
        hasCalledCallback = false,
        hasSentVerificationRequest = false,
        hasVerified = false;
    const handleWindowMessage = event => {
        if (event.data && event.data === "AdFrame|verify") {
            hasVerified = true;
            frame.contentWindow.removeEventListener("message", handleWindowMessage, false);
            check();
        }
    };
    const check = () => {
        if (verifyLoad) {
            if (hasVerified) {
                setTimeout(callback, 0);
            } else if (!hasSentVerificationRequest) {
                hasSentVerificationRequest = true;
                frame.contentWindow.addEventListener("message", handleWindowMessage, false);
                frame.contentWindow.postMessage("AdFrame|request-verification", "*");
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
