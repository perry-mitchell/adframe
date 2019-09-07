export function attachOnLoadListener(frame) {
    return new Promise(resolve => {
        // Modern browsers:
        frame.onload = function() {
            resolve();
        };
        // Older browsers, like Internet Explorer:
        frame.onreadystatechange = function() {
            if (this.readyState === "complete" || this.readyState === "interactive") {
                resolve();
            }
        };
    });
}
