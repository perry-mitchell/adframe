## Modules

<dl>
<dt><a href="#module_AdFrame">AdFrame</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#CreateAdFrameOptions">CreateAdFrameOptions</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="module_AdFrame"></a>

## AdFrame
<a name="module_AdFrame.exports.createAdFrame"></a>

### AdFrame.exports.createAdFrame(options) ⇒ <code>HTMLIFrameElement</code>
Create an adframe instance

**Kind**: static method of [<code>AdFrame</code>](#module_AdFrame)  
**Returns**: <code>HTMLIFrameElement</code> - The created (and inserted) iframe element  

| Param | Type | Description |
| --- | --- | --- |
| options | [<code>CreateAdFrameOptions</code>](#CreateAdFrameOptions) | Creation options |

<a name="CreateAdFrameOptions"></a>

## CreateAdFrameOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| content | <code>String</code> | The HTML content to insert, when in HTML content mode, or the  URL to load when in URL content mode |
| [contentType] | <code>String</code> | The type of content to use - defaults to CONTENT_HTML |
| [doc] | <code>HTMLDocument</code> | The document to use for all element references |
| [onLoadCallback] | <code>function</code> | Callback method to fire once the iframe has loaded |
| parent | <code>HTMLElement</code> | The parent element to insert the iframe into |
| [position] | <code>String</code> | Insertion position. Either "first" among other children in  the parent element or "last". |
| [restoreBuiltIns] | <code>Boolean</code> | Restore built-in document/window methods if they're  detected as having been overridden. Defaults to true. Can help un-break pages where some  script has performed some nasty modifications to the page. |
| [sandboxFlags] | <code>Array.&lt;String&gt;</code> | Custom sandbox flags to set when security is set to  custom mode (SECURITY_CUSTOM) |
| [security] | <code>String</code> | The security mode to use for securing the iframe's contents.  Defaults to SECURITY_NONE. |
| [writeMethods] | <code>Array.&lt;String&gt;</code> | Write methods that can be used, in order of  preference. If no write modes can be selected an error will be thrown. |

