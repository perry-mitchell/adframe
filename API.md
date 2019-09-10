## Modules

<dl>
<dt><a href="#module_AdFrame">AdFrame</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#prepareIframe">prepareIframe(iframe)</a></dt>
<dd><p>Prepare the iframe element (styles) before insertion into the DOM</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#AdFrameInjection">AdFrameInjection</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#CreateAdFrameOptions">CreateAdFrameOptions</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="module_AdFrame"></a>

## AdFrame

* [AdFrame](#module_AdFrame)
    * [.exports.createAdFrame(options)](#module_AdFrame.exports.createAdFrame) ⇒ <code>HTMLIFrameElement</code>
    * [.exports.blobURLSupported()](#module_AdFrame.exports.blobURLSupported) ⇒ <code>Boolean</code>
    * [.exports.srcDocSupported()](#module_AdFrame.exports.srcDocSupported) ⇒ <code>Boolean</code>

<a name="module_AdFrame.exports.createAdFrame"></a>

### AdFrame.exports.createAdFrame(options) ⇒ <code>HTMLIFrameElement</code>
Create an adframe instance

**Kind**: static method of [<code>AdFrame</code>](#module_AdFrame)  
**Returns**: <code>HTMLIFrameElement</code> - The created (and inserted) iframe element  

| Param | Type | Description |
| --- | --- | --- |
| options | [<code>CreateAdFrameOptions</code>](#CreateAdFrameOptions) | Creation options |

<a name="module_AdFrame.exports.blobURLSupported"></a>

### AdFrame.exports.blobURLSupported() ⇒ <code>Boolean</code>
Detect Blob URL support

**Kind**: static method of [<code>AdFrame</code>](#module_AdFrame)  
**Returns**: <code>Boolean</code> - True if supported  
<a name="module_AdFrame.exports.srcDocSupported"></a>

### AdFrame.exports.srcDocSupported() ⇒ <code>Boolean</code>
Detect iframe srcdoc support

**Kind**: static method of [<code>AdFrame</code>](#module_AdFrame)  
**Returns**: <code>Boolean</code> - True if supported  
<a name="prepareIframe"></a>

## prepareIframe(iframe)
Prepare the iframe element (styles) before insertion into the DOM

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| iframe | <code>HTMLIFrameElement</code> | The target iframe element |

<a name="AdFrameInjection"></a>

## AdFrameInjection : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| content | <code>String</code> | The content to inject |
| [prepend] | <code>Boolean</code> | Whether or not to prepend the injected content. Defaults to  false (append). |

<a name="CreateAdFrameOptions"></a>

## CreateAdFrameOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| content | <code>String</code> | The HTML content to insert, when in HTML content mode, or the  URL to load when in URL content mode |
| [contentType] | <code>String</code> | The type of content to use - defaults to CONTENT_HTML |
| [injections] | [<code>Array.&lt;AdFrameInjection&gt;</code>](#AdFrameInjection) | Content injections to inject into the  provided content property by detecting <body> tags. |
| [onBeforeInsert] | <code>function</code> | Callback fired before the iframe is inserted into  the page so that final processing can be performed. This defaults to `prepareIframe`, which  updates styles for the iframe so that it appears seamlessly in the page. Overriding this  property will disable this default processing. |
| [onLoadCallback] | <code>function</code> | Callback method to fire once the iframe has loaded |
| parent | <code>HTMLElement</code> | The parent element to insert the iframe into |
| [position] | <code>String</code> | Insertion position. Either "first" among other children in  the parent element or "last". |
| [restoreIframeBuiltIns] | <code>Boolean</code> | Restore built-in document/window methods if they're  detected as having been overridden. Defaults to true. Can help un-break pages where some  script has performed some nasty modifications to the page. Operates ONLY within created  iframes. |
| [restorePageBuiltIns] | <code>Boolean</code> | Same as `restoreIframeBuiltIns`, but works on the  parent, containing page (current document) instead. Defaults to false. |
| [sandboxFlags] | <code>Array.&lt;String&gt;</code> | Custom sandbox flags to set when security is set to  custom mode (SECURITY_CUSTOM) |
| [security] | <code>String</code> | The security mode to use for securing the iframe's contents.  Defaults to SECURITY_NONE. |
| [verifyLoad] | <code>Boolean</code> | Verify the contents as having been loaded by use of an  injected helper. Defaults to false. |
| [win] | <code>Window</code> | Window reference |
| [writeMethods] | <code>Array.&lt;String&gt;</code> | Write methods that can be used, in order of  preference. If no write modes can be selected an error will be thrown. |

