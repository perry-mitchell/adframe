let __srcDocSupported = null;

/**
 * Detect Blob URL support
 * @returns {Boolean} True if supported
 * @memberof module:AdFrame
 */
export function blobURLSupported() {
    return (
        typeof Blob === "function" && (typeof URL === "function" || typeof webkitURL === "function")
    );
}

/**
 * Detect iframe srcdoc support
 * @returns {Boolean} True if supported
 * @memberof module:AdFrame
 */
export function srcDocSupported() {
    if (__srcDocSupported === null) {
        __srcDocSupported = !!("srcdoc" in document.createElement("iframe"));
    }
    return __srcDocSupported;
}
