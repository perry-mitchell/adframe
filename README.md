# AdFrame
> Iframe control system designed for iframes that contain ads

[![Build Status](https://travis-ci.org/perry-mitchell/adframe.svg?branch=master)](https://travis-ci.org/perry-mitchell/adframe) [![npm version](https://badge.fury.io/js/adframe.svg)](https://www.npmjs.com/package/adframe)

# About

Create **well-prepared** iframes that are designed to handle dynamic advertising content held within. This library doesn't necessarily need to only be used in the advertising realm, and its array of features will most likely find it useful in a variety of situations.

Iframes created using this library can use a number of content insertion methods (blob URLs, `document.write`, `srcdoc` etc.), some combinations of iframe `sandbox` flags, content-loaded detection and a wealth of other tools.

To dive straight in to creating an iframe, check out the [API documentation](API.md).

Creation of AdFrame iframes is performed by using a single synchronous method, which outputs the iframe (`createAdFrame`). On-load listeners can be attached via the creation options:

```javascript
import { createAdFrame } from "adframe";

const container = document.querySelector("#container");

createAdFrame({
    content: "<div><p>Some content</p></div>",
    parent: container,
    onLoadCallback: () => {
        console.log("Loaded!");
    }
});
```

_Promises are not used so as to not bloat the library with polyfills (as IE 10 is supported, for example)._

Iframes with URLs can also be created:

```javascript
import { CONTENT_URL, createAdFrame } from "adframe";

createAdFrame({
    content: "https://some-page.com",
    contentType: CONTENT_URL,
    parent: container,
    onLoadCallback: () => {
        console.log("Loaded!");
    }
});
```

Iframes created by AdFrame are prepared, in terms of styling, before being inserted. This functionality can be overidden by changing the `onBeforeInsert` property to another function. You should, if you prefer that your iframe _looks_ good, still call the default styling function:

```javascript
import { createAdFrame, prepareIframe } from "adframe";

createAdFrame({
    content: "<div><p>Some content</p></div>",
    onBeforeInsert: iframe => {
        prepareIframe(iframe);
        iframe.setAttribute("id", "my-iframe");
    },
    parent: container
});
```

## Security

Secure iframes can be generated by passing one of the available security flags, or by passing a custom configuration:

 * `SECURITY_SANDBOX_NONFRIENDLY`: Sandbox the iframe and remove the `allow-same-origin` flag to completely lock down the container.
 * `SECURITY_SANDBOX_SAMEORIGIN`: Sandbox the iframe but keep the `allow-same-origin` flag to allow top-page referencing from within the container.
 * `SECURITY_CUSTOM`: Sandbox the iframe with a custom list of flags, provided by the `sandboxFlags` option
 * `SECURITY_NONE`: No sandboxing (default)

```javascript
import { SECURITY_CUSTOM, createAdFrame } from "adframe";

createAdFrame({
    content: "<div><p>Some content</p></div>",
    parent: container,
    security: SECURITY_CUSTOM,
    sandboxFlags: [
        "allow-forms",
        "allow-scripts",
        "allow-same-origin",
        "allow-downloads-without-user-activation",
        "allow-storage-access-by-user-activation"
    ]
});
```

## Built-In Browser Method Restoration

Some pages/scripts like to boast brand-safe ad-quality protection and the like, and can go as far as to override built-in methods like `document.write`, claiming this is so that they can control what ads are rendered. I, personally, don't trust third parties to make such a decision and risk forcing all scripts and third-parties on a page to use potentially unstable JavaScript to inject ad content. AdFrame, by default, removes overridden functions when detected. You can _disable_ this functionality by setting the `restoreBuiltIns` option to `false`.

## Content Injection Methods

AdFrame comes with a variety of ways to inject HTML content into an iframe, and this can be controlled via the `writeMethods` option. `writeMethods` takes an array of _allowed_ injection methods, listed in order of preference. They are automatically stripped of incompatible items when running, and if none are left after this process an error is thrown. The available methods are (listed in default order):

 * `WRITE_MODE_BLOB_URL`: Use [Blob URLs](http://qnimate.com/an-introduction-to-javascript-blobs-and-file-interface/#Blob_URLs) to inject content (preferred)
 * `WRITE_MODE_SRCDOC`: Use the iframe `srcdoc` attribute, along with base 64 encoding/decoding, to inject content
 * `WRITE_MODE_DOC_WRITE`: Use `document.write` to inject content (not available when using sandboxing)

It is recommended to leave `writeMethods` to the default value in most cases, as it will auto-detect what's best for the current environment and content.

## Injecting Extra Content/Snippets

Sometimes you're given a template of data to inject along with several other snippets of HTML (styles, JavaScript etc.) to write into the same frame. This can become tedious when the primary content to insert already has a `<body>`. AdFrame provides the `injections` option to allow for inserting extra snippets of content correctly within the main `content`:

```javascript
import { createAdFrame } from "adframe";

createAdFrame({
    content: "<html><body><p>Test</p></body></html>",
    injections: [
        { content: "<style>body { background: red; }</style>", prepend: true },
        { content: "<footer>Footer</footer>" }
    ],
    parent: container,
    onLoadCallback: () => {
        console.log("Loaded!");
    }
});
```

## Verifying Load State

AdFrame can further verify that iframe content was loaded by using `postMessage` to ping an injected internal script. Enable this functionality by using the `verifyLoad` option. Defaults to `false`.

## Browser Support

IE 10 and newer.

_NB: This section not negotiable._
