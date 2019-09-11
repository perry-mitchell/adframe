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
import { blobURLSupported, srcDocSupported } from "./features.js";
import { injectBuiltInRestorer, injectHTML, injectLoadVerifier } from "./content.js";
import { setIframeBlobURL, setIframeSrcDoc, writeDocumentContent } from "./inject.js";

const DEFAULT_WRITE_METHODS = [WRITE_MODE_BLOB_URL, WRITE_MODE_SRCDOC, WRITE_MODE_DOC_WRITE];
const NOOP = () => {};

/**
 * @typedef {Object} AdFrameInjection
 * @property {String} content - The content to inject
 * @property {Boolean=} prepend - Whether or not to prepend the injected content. Defaults to
 *  false (append).
 */

/**
 * @typedef {Object} CreateAdFrameOptions
 * @property {String} content - The HTML content to insert, when in HTML content mode, or the
 *  URL to load when in URL content mode
 * @property {String=} contentType - The type of content to use - defaults to CONTENT_HTML
 * @property {Array.<AdFrameInjection>=} injections - Content injections to inject into the
 *  provided content property by detecting <body> tags.
 * @property {Function=} onBeforeInsert - Callback fired before the iframe is inserted into
 *  the page so that final processing can be performed. This defaults to `prepareIframe`, which
 *  updates styles for the iframe so that it appears seamlessly in the page. Overriding this
 *  property will disable this default processing.
 * @property {Function=} onLoadCallback - Callback method to fire once the iframe has loaded
 * @property {HTMLElement} parent - The parent element to insert the iframe into
 * @property {String=} position - Insertion position. Either "first" among other children in
 *  the parent element or "last".
 * @property {Boolean=} restoreIframeBuiltIns - Restore built-in document/window methods if they're
 *  detected as having been overridden. Defaults to true. Can help un-break pages where some
 *  script has performed some nasty modifications to the page. Operates ONLY within created
 *  iframes.
 * @property {Boolean=} restorePageBuiltIns - Same as `restoreIframeBuiltIns`, but works on the
 *  parent, containing page (current document) instead. Defaults to false.
 * @property {Array.<String>=} sandboxFlags - Custom sandbox flags to set when security is set to
 *  custom mode (SECURITY_CUSTOM)
 * @property {String=} security - The security mode to use for securing the iframe's contents.
 *  Defaults to SECURITY_NONE.
 * @property {Boolean=} verifyLoad - Verify the contents as having been loaded by use of an
 *  injected helper. Defaults to false.
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
        content: contentRaw,
        contentType = CONTENT_HTML,
        injections = [],
        onBeforeInsert = prepareIframe,
        onLoadCallback = NOOP,
        parent,
        position = "last",
        restoreIframeBuiltIns = true,
        restorePageBuiltIns = false,
        sandboxFlags = [],
        security = SECURITY_NONE,
        verifyLoad = false,
        win = window,
        writeMethods = [...DEFAULT_WRITE_METHODS]
    } = options;
    const doc = win.document;
    let content = contentRaw;
    if (restorePageBuiltIns) {
        restoreBuiltIns(doc);
    }
    const iframe = doc.createElement("iframe");
    const willVerifyLoad = verifyLoad && contentType === CONTENT_HTML;
    const attachOnLoad = () => attachOnLoadListener(iframe, onLoadCallback, willVerifyLoad);
    let availableWriteMethods = writeMethods;
    const appliedSandboxing = applySecurityMeasures(iframe, security, sandboxFlags);
    if (appliedSandboxing && appliedSandboxing.indexOf("allow-same-origin") === -1) {
        // document.write cannot be used when frame is non-friendly
        availableWriteMethods = removeArrayElement(availableWriteMethods, WRITE_MODE_DOC_WRITE);
    }
    if (!blobURLSupported()) {
        availableWriteMethods = removeArrayElement(availableWriteMethods, WRITE_MODE_BLOB_URL);
    }
    if (!srcDocSupported()) {
        availableWriteMethods = removeArrayElement(availableWriteMethods, WRITE_MODE_SRCDOC);
    }
    const [chosenWriteMethod] = availableWriteMethods;
    if (contentType === CONTENT_URL) {
        attachOnLoad();
        iframe.setAttribute("src", content);
    } else if (contentType === CONTENT_HTML) {
        injections.forEach(injection => {
            content = injectHTML(
                content,
                injection.content,
                typeof injection.prepend === "boolean" ? injection.prepend : false
            );
        });
        if (restoreIframeBuiltIns) {
            content = injectBuiltInRestorer(content);
        }
        if (willVerifyLoad) {
            content = injectLoadVerifier(content);
        }
        if (appliedSandboxing && appliedSandboxing.indexOf("allow-same-origin") === -1) {
            iframe.setAttribute("src", "about:blank");
        }
        if (!chosenWriteMethod) {
            throw new Error("No available write methods");
        } else if (chosenWriteMethod === WRITE_MODE_SRCDOC) {
            attachOnLoad();
            setIframeSrcDoc(iframe, content, win);
        } else if (chosenWriteMethod === WRITE_MODE_BLOB_URL) {
            attachOnLoad();
            setIframeBlobURL(iframe, content);
        }
        // document.write is handled later, after DOM insertion
    } else {
        throw new Error(`Invalid iframe content type: ${contentType}`);
    }
    onBeforeInsert(iframe);
    if (position === "first") {
        parent.insertBefore(iframe, parent.firstChild);
    } else if (position === "last") {
        parent.appendChild(iframe);
    } else {
        throw new Error(`Invalid insertion position: ${position}`);
    }
    if (chosenWriteMethod === WRITE_MODE_DOC_WRITE) {
        attachOnLoad();
        writeDocumentContent(iframe, content);
    }
    return iframe;
}

/**
 * Prepare the iframe element (styles) before insertion into the DOM
 * @param {HTMLIFrameElement} iframe The target iframe element
 */
export function prepareIframe(iframe) {
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("align", "top");
    iframe.setAttribute("marginwidth", "0");
    iframe.setAttribute("marginheight", "0");
    iframe.style.border = "none";
}

function removeArrayElement(items, element) {
    return items.filter(item => item !== element);
}
