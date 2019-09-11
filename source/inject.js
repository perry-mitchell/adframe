export function setIframeBlobURL(iframe, content, mime = "text/html") {
    const blob = new Blob([content], { type: mime });
    const url = (URL || webkitURL).createObjectURL(blob);
    iframe.setAttribute("src", url);
}

export function setIframeSrcDoc(iframe, content, win = window) {
    const encodedContent = win.btoa(encodeURIComponent(content));
    iframe.setAttribute(
        "srcdoc",
        `<script>document.open(); document.write(decodeURIComponent(atob('${encodedContent}'))); document.close();</script>`
    );
}

export function writeDocumentContent(iframe, content) {
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(content);
    doc.close();
}
