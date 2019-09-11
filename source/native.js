const DOCUMENT_BUILTINS = ["appendChild", "createElement", "insertBefore", "write"];

export function restoreBuiltIns(doc = document) {
    if (!Object.getPrototypeOf || typeof Object.getPrototypeOf !== "function") {
        return;
    }
    const docProto = Object.getPrototypeOf(doc);
    DOCUMENT_BUILTINS.forEach(builtIn => {
        if (docProto[builtIn] !== doc[builtIn]) {
            doc[builtIn] = docProto[builtIn];
        }
        try {
            Object.defineProperty(doc, builtIn, {
                configurable: false,
                enumerable: false,
                value: docProto[builtIn],
                writable: false
            });
        } catch (err) {}
    });
}
