import {
    CONTENT_HTML,
    CONTENT_URL,
    SECURITY_NONE,
    WRITE_MODE_BLOB_URL,
    WRITE_MODE_DOC_WRITE,
    WRITE_MODE_SRCDOC
} from "./symbols.js";
import { restoreBuiltIns } from "./native.js";
import { attachOnLoadListener } from "./events.js";
import { applySecurityMeasures } from "./security.js";

const DEFAULT_WRITE_METHODS = [WRITE_MODE_BLOB_URL, WRITE_MODE_SRCDOC, WRITE_MODE_DOC_WRITE];
const NOOP = () => {};

/**
 * @typedef {Object} CreateAdFrameOptions
 * @property {String} content - The HTML content to insert, when in HTML content mode, or the
 *  URL to load when in URL content mode
 * @property {String=} contentType - The type of content to use - defaults to CONTENT_HTML
 * @property {Function=} onLoadCallback - Callback method to fire once the iframe has loaded
 * @property {HTMLElement} parent - The parent element to insert the iframe into
 * @property {String=} position - Insertion position. Either "first" among other children in
 *  the parent element or "last".
 * @property {Boolean=} restoreBuiltIns - Restore built-in document/window methods if they're
 *  detected as having been overridden. Defaults to true. Can help un-break pages where some
 *  script has performed some nasty modifications to the page.
 * @property {Array.<String>=} sandboxFlags - Custom sandbox flags to set when security is set to
 *  custom mode (SECURITY_CUSTOM)
 * @property {String=} security - The security mode to use for securing the iframe's contents.
 *  Defaults to SECURITY_NONE.
 * @property {Window=} win - Window reference
 * @property {Array.<String>=} writeMethods - Write methods that can be used, in order of
 *  preference. If no write modes can be selected an error will be thrown.
 */

/**
 * Create an adframe instance
 * @param {CreateAdFrameOptions} options Creation options
 * @returns {HTMLIFrameElement} The created (and inserted) iframe element
 * @memberof module:AdFrame
 */
export function createAdFrame(options) {
    const {
        content,
        contentType = CONTENT_HTML,
        onLoadCallback = NOOP,
        parent,
        position = "last",
        restoreBuiltIns: runRestoreBuiltIns = true,
        sandboxFlags = [],
        security = SECURITY_NONE,
        win = window,
        writeMethods = [...DEFAULT_WRITE_METHODS]
    } = options;
    const doc = win.document;
    if (runRestoreBuiltIns) {
        restoreBuiltIns(doc);
    }
    const iframe = doc.createElement("iframe");
    let availableWriteMethods = writeMethods;
    const appliedSandboxing = applySecurityMeasures(iframe, security, sandboxFlags);
    if (appliedSandboxing && appliedSandboxing.indexOf("allow-same-origin") === -1) {
        // document.write cannot be used when frame is non-friendly
        availableWriteMethods = availableWriteMethods.filter(wm => wm !== WRITE_MODE_DOC_WRITE);
    }
    const [chosenWriteMethod] = availableWriteMethods;
    if (contentType === CONTENT_URL) {
        attachOnLoadListener(iframe, onLoadCallback);
        iframe.setAttribute("src", content);
    } else if (contentType === CONTENT_HTML) {
        if (appliedSandboxing && appliedSandboxing.indexOf("allow-same-origin") === -1) {
            iframe.setAttribute("src", "about:blank");
        }
        if (!chosenWriteMethod) {
            throw new Error("No available write methods");
        } else if (chosenWriteMethod === WRITE_MODE_SRCDOC) {
            attachOnLoadListener(iframe, onLoadCallback);
            setIframeSrcDoc(iframe, content);
        } else if (chosenWriteMethod === WRITE_MODE_BLOB_URL) {
            attachOnLoadListener(iframe, onLoadCallback);
            setIframeBlobURL(iframe, content);
        }
        // document.write is handled later, after DOM insertion
    } else {
        throw new Error(`Invalid iframe content type: ${contentType}`);
    }
    if (position === "first") {
        parent.insertBefore(iframe, parent.firstChild);
    } else if (position === "last") {
        parent.appendChild(iframe);
    } else {
        throw new Error(`Invalid insertion position: ${position}`);
    }
    if (chosenWriteMethod === WRITE_MODE_DOC_WRITE) {
        setTimeout(onLoadCallback, 0);
        writeDocumentContent(iframe, content);
    }
    return iframe;
}

function setIframeBlobURL(iframe, content, mime = "text/html") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    iframe.setAttribute("src", url);
}

function setIframeSrcDoc(iframe, content) {
    const encodedContent = win.btoa(encodeURIComponent(content));
    iframe.setAttribute(
        "srcdoc",
        `<script>document.open(); document.write(decodeURIComponent(atob('${encodedContent}'))); document.close();</script>`
    );
}

function writeDocumentContent(iframe, content) {
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(content);
    doc.close();
}
