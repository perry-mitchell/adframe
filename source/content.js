import restoreBuiltInsHTML from "./html/restore-built-ins.html";

export function injectBuiltInRestorer(html) {
    return injectHTML(html, restoreBuiltInsHTML, /* prepend: */ true);
}

function injectHTML(content, newHTML, prepend = false) {
    const bodyRexp = prepend
        ? /(<body[^>]*>)/im
        : /(<\/body>)/i
    if (bodyRexp.test(content)) {
        return prepend
            ? content.replace(bodyRexp, `$1${newHTML}`)
            : content.replace(bodyRexp, `${newHTML}$1`);
    }
    return prepend
        ? `${newHTML}${content}`
        : `${content}${newHTML}`;
}
