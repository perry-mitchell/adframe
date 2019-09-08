export function attachOnLoadListener(frame, callback) {
    let hasFired = false;
    // Modern browsers:
    frame.onload = function() {
        if (!hasFired) {
            hasFired = true;
            callback();
        }
    };
    // Older browsers, like Internet Explorer:
    frame.onreadystatechange = function() {
        if (this.readyState === "complete" || this.readyState === "interactive") {
            if (!hasFired) {
                hasFired = true;
                callback();
            }
        }
    };
}
