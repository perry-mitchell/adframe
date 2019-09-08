const DOCUMENT_BUILTINS = ["createElement", "write"];

export function restoreBuiltIns(doc = document) {
    if (!Object.getPrototypeOf || typeof Object.getPrototypeOf !== "function") {
        return;
    }
    const docProto = Object.getPrototypeOf(doc);
    DOCUMENT_BUILTINS.forEach(builtIn => {
        if (docProto[builtIn] !== doc[builtIn]) {
            doc[builtIn] = docProto[builtIn];
        }
    });
}
