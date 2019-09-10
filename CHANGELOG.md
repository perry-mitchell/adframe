# AdFrame Changelog

## v0.6.0
_2019-09-10_

 * Break out `restoreBuiltIns` into two separate options:
   * `restoreIframeBuiltIns` to work inside iframes (default true)
   * `restorePageBuiltIns` to work in the current page (default false)

## v0.5.0
_2019-09-10_

 * Iframe preparation before insertion using `onBeforeInsert` option
 * Expose `prepareIframe` method for custom iframe preparation callbacks

## v0.4.0
_2019-09-10_

 * Expose `blobURLSupported` and `srcDocSupported` feature detection methods
 * `verifyLoad` option

## v0.3.0
_2019-09-09_

 * `injections` option for injecting more content (body recognition)

## v0.2.0
_2019-09-09_

 * Drastically reduced payload size
 * Write method detection and filtering
 * Built-in restorer injection (inner protection)
 * Built-in override prevention

## v0.1.0
_2019-09-08_

 * Initial release
