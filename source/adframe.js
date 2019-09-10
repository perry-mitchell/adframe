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
        onLoadCallback = NOOP,
        parent,
        position = "last",
        restoreBuiltIns: runRestoreBuiltIns = true,
        sandboxFlags = [],
        security = SECURITY_NONE,
        verifyLoad = false,
        win = window,
        writeMethods = [...DEFAULT_WRITE_METHODS]
    } = options;
    const doc = win.document;
    let content = contentRaw;
    if (runRestoreBuiltIns) {
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
        if (runRestoreBuiltIns) {
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

function removeArrayElement(items, element) {
    return items.filter(item => item !== element);
}

function setIframeBlobURL(iframe, content, mime = "text/html") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    iframe.setAttribute("src", url);
}

function setIframeSrcDoc(iframe, content, win = window) {
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
