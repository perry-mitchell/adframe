import commsHTML from "./html/comms.html";
import restoreBuiltInsHTML from "./html/restore-built-ins.html";
import verifyLoadHTML from "./html/verify-load.html";

export function injectBuiltInRestorer(html) {
    return injectHTML(html, restoreBuiltInsHTML, /* prepend: */ true);
}

export function injectComms(html, frameID) {
    const preparedHTML = commsHTML.replace("[FRAME_ID]", frameID);
    return injectHTML(html, preparedHTML, /* prepend: */ true);
}

export function injectHTML(content, newHTML, prepend = false) {
    const bodyRexp = prepend ? /(<body[^>]*>)/im : /(<\/body>)/i;
    if (bodyRexp.test(content)) {
        return prepend
            ? content.replace(bodyRexp, `$1${newHTML}`)
            : content.replace(bodyRexp, `${newHTML}$1`);
    }
    return prepend ? `${newHTML}${content}` : `${content}${newHTML}`;
}

export function injectLoadVerifier(html) {
    return injectHTML(html, verifyLoadHTML);
}
