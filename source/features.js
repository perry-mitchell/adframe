let __srcDocSupported = null;

export function blobURLSupported() {
    return typeof Blob === "function" && typeof URL === "function";
}

export function srcDocSupported() {
    if (__srcDocSupported === null) {
        __srcDocSupported = !!("srcdoc" in document.createElement("iframe"));
    }
    return __srcDocSupported;
}
