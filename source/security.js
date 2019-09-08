import {
    SECURITY_CUSTOM,
    SECURITY_NONE,
    SECURITY_SANDBOX_NONFRIENDLY,
    SECURITY_SANDBOX_SAMEORIGIN
} from "./symbols.js";

const SANDBOX_NONFRIENDLY_FLAGS = [
    "allow-forms",
    "allow-popups",
    "allow-popups-to-escape-sandbox",
    "allow-scripts"
];

export function applySecurityMeasures(iframe, securitySetting, sandboxAllowances = []) {
    let sandboxFlags;
    if (securitySetting === SECURITY_NONE) {
        return null;
    } else if (securitySetting === SECURITY_CUSTOM) {
        sandboxFlags = sandboxAllowances;
    } else if (securitySetting === SECURITY_SANDBOX_SAMEORIGIN) {
        sandboxFlags = [...SANDBOX_NONFRIENDLY_FLAGS, "allow-same-origin"];
    } else if (securitySetting === SECURITY_SANDBOX_NONFRIENDLY) {
        sandboxFlags = SANDBOX_NONFRIENDLY_FLAGS;
    } else {
        throw new Error(`Unrecognised security setting: ${securitySetting}`);
    }
    iframe.setAttribute("sandbox", sandboxFlags.join(" "));
    return sandboxFlags;
}
