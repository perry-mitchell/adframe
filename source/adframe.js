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

export function createAdFrame(options) {
    const {
        content,
        contentType = CONTENT_HTML,
        doc = document,
        onLoadCallback = NOOP,
        parent,
        position = "last",
        restoreBuiltIns: runRestoreBuiltIns = true,
        sandboxFlags = [],
        security = SECURITY_NONE,
        writeMethods = [...DEFAULT_WRITE_METHODS]
    } = options;
    if (runRestoreBuiltIns) {
        restoreBuiltIns(doc);
    }
    const iframe = doc.createElement("iframe");
    attachOnLoadListener(iframe);
    let availableWriteMethods = writeMethods;
    const appliedSandboxing = applySecurityMeasures(iframe, security, sandboxFlags);
    if (appliedSandboxing && appliedSandboxing.indexOf("allow-same-origin") === -1) {
        // document.write cannot be used when frame is non-friendly
        availableWriteMethods = availableWriteMethods.filter(wm => wm !== WRITE_MODE_DOC_WRITE);
    }
    const [chosenWriteMethod] = availableWriteMethods;
    if (contentType === CONTENT_URL) {
        iframe.setAttribute("src", content);
    } else if (contentType === CONTENT_HTML) {
        if (appliedSandboxing && appliedSandboxing.indexOf("allow-same-origin") === -1) {
            iframe.setAttribute("src", "about:blank");
        }
        if (!chosenWriteMethod) {
            throw new Error("No available write methods");
        } else if (chosenWriteMethod === WRITE_MODE_SRCDOC) {
            setIframeSrcDoc(iframe, content);
        } else if (chosenWriteMethod === WRITE_MODE_BLOB_URL) {
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
        writeDocumentContent(iframe, content);
    }
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
