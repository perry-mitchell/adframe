import { attachOnLoadListener } from "./events.js";
import { setIframeBlobURL } from "./inject.js";
import { injectComms, injectLoadVerifier } from "./content.js";
import { establishComms } from "./comms.js";

const CSP_VIOLATION_EVENT = "securitypolicyviolation";
const NOOP = () => {};

let __srcDocSupported = null,
    __cspBlocksBlobURLs = null;

/**
 * Detect Blob URL support
 * @returns {Boolean} True if supported
 * @memberof module:AdFrame
 */
export function blobURLSupported() {
    return (
        (__cspBlocksBlobURLs !== false) && typeof Blob === "function" && (typeof URL === "function" || typeof webkitURL === "function")
    );
}

/**
 * Detect any Content-Security-Policy blocking that affects blob-URLs
 * @param {Function=} callback Callback function to fire when detection has completed
 * @param {HTMLDocument=} doc Optional document reference
 */
export function detectCSPBlocking(callback = NOOP, doc = document) {
    if (__cspBlocksBlobURLs !== null) {
        setTimeout(() => callback(__cspBlocksBlobURLs), 0);
        return;
    }
    const handleBlockEvent = event => {
        const { blockedURI, violatedDirective } = event;
        if (/^blob/.test(blockedURI) && violatedDirective === "frame-src") {
            __cspBlocksBlobURLs = true;
            doc.removeEventListener(CSP_VIOLATION_EVENT, handleBlockEvent);
            callback(true);
        }
    };
    doc.addEventListener(CSP_VIOLATION_EVENT, handleBlockEvent);
    const iframe = doc.createElement("iframe");
    const id = `csp_${Date.now()}_${Math.floor(Math.random() * 9000000)}`;
    const comms = establishComms(id);
    attachOnLoadListener(
        iframe,
        comms,
        function() {
            if (__cspBlocksBlobURLs !== null) {
                return;
            }
            __cspBlocksBlobURLs = false;
            doc.removeEventListener(CSP_VIOLATION_EVENT, handleBlockEvent);
            callback(false);
        },
        /* verify: */ true
    );
    iframe.setAttribute("style", "display:none");
    iframe.setAttribute("data-adframe", "csp-test");
    let content = injectLoadVerifier("<!-- Verify CSP -->");
    content = injectComms(content, id);
    setIframeBlobURL(iframe, content);
    doc.body.appendChild(iframe);
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
