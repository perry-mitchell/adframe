import {
    CONTENT_URL,
    SECURITY_CUSTOM,
    SECURITY_SANDBOX_NONFRIENDLY,
    SECURITY_SANDBOX_SAMEORIGIN,
    WRITE_MODE_BLOB_URL,
    WRITE_MODE_DOC_WRITE,
    WRITE_MODE_SRCDOC,
    createAdFrame,
    prepareIframe
} from "../../source/index.js";

describe("createAdFrame", function() {
    beforeEach(function() {
        this.container = document.createElement("div");
        document.body.appendChild(this.container);
    });

    afterEach(function() {
        this.container.parentElement.removeChild(this.container);
    });

    it("creates an iframe element", function() {
        createAdFrame({
            parent: this.container,
            content: "<p>Test</p>"
        });
        expect(this.container.children[0].tagName).to.match(/^iframe$/i);
    });

    it("fires `onLoadCallback` when iframe loaded", function(done) {
        createAdFrame({
            parent: this.container,
            content: "<br />",
            onLoadCallback: done
        });
    });

    it("renders content using blob URLs", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content: '<div id="test">',
            writeMethods: [WRITE_MODE_BLOB_URL],
            onLoadCallback: () => {
                expect(iframe.contentWindow.document.querySelector("#test"))
                    .to.have.property("tagName")
                    .that.matches(/^div$/i);
                expect(iframe.getAttribute("src")).to.match(/^blob:/);
                done();
            }
        });
    });

    it("renders content using srcdoc", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content: '<div id="test">',
            writeMethods: [WRITE_MODE_SRCDOC],
            onLoadCallback: () => {
                expect(iframe.contentWindow.document.querySelector("#test"))
                    .to.have.property("tagName")
                    .that.matches(/^div$/i);
                expect(iframe.getAttribute("srcdoc").indexOf("<script>document.open()")).to.equal(
                    0
                );
                done();
            }
        });
    });

    it("renders content using document.write", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content: '<div id="test">',
            writeMethods: [WRITE_MODE_DOC_WRITE],
            onLoadCallback: () => {
                expect(iframe.contentWindow.document.querySelector("#test"))
                    .to.have.property("tagName")
                    .that.matches(/^div$/i);
                expect(iframe.getAttribute("src")).to.be.null;
                done();
            }
        });
    });

    it("can render iframes using only a URL", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content: "about:blank",
            contentType: CONTENT_URL,
            onLoadCallback: () => {
                expect(iframe.getAttribute("src")).to.equal("about:blank");
                done();
            }
        });
    });

    it("positions last by default", function() {
        const testEl = document.createElement("div");
        this.container.appendChild(testEl);
        createAdFrame({
            parent: this.container,
            content: "<p>Test</p>"
        });
        expect(this.container.children[1].tagName).to.match(/^iframe$/i);
    });

    it("positions first when configured", function() {
        const testEl = document.createElement("div");
        this.container.appendChild(testEl);
        createAdFrame({
            parent: this.container,
            content: "<p>Test</p>",
            position: "first"
        });
        expect(this.container.children[0].tagName).to.match(/^iframe$/i);
    });

    it("can sandbox, allowing same origin", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content: "<p>test</p>",
            security: SECURITY_SANDBOX_SAMEORIGIN,
            onLoadCallback: () => {
                const sandbox = iframe.getAttribute("sandbox");
                expect(sandbox).to.match(/\ballow-scripts\b/);
                expect(sandbox).to.match(/\ballow-same-origin\b/);
                done();
            }
        });
    });

    it("can sandbox, disallowing same origin (non-friendly)", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content: "<p>test</p>",
            security: SECURITY_SANDBOX_NONFRIENDLY,
            onLoadCallback: () => {
                const sandbox = iframe.getAttribute("sandbox");
                expect(sandbox).to.match(/\ballow-scripts\b/);
                expect(sandbox).to.not.match(/\ballow-same-origin\b/);
                done();
            }
        });
    });

    it("can sandbox with custom flags", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content: "<p>test</p>",
            sandboxFlags: ["allow-scripts"],
            security: SECURITY_CUSTOM,
            onLoadCallback: () => {
                const sandbox = iframe.getAttribute("sandbox");
                expect(sandbox).to.equal("allow-scripts");
                done();
            }
        });
    });

    it("injects built-in restoration code", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content: '<div id="test">',
            onLoadCallback: () => {
                expect(iframe.contentWindow.document.querySelector("[data-adframe=restorer]"))
                    .to.have.property("tagName")
                    .that.matches(/^script$/i);
                done();
            }
        });
    });

    it("can disable built-in restoration code injection", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content: '<div id="test">',
            restoreIframeBuiltIns: false,
            onLoadCallback: () => {
                expect(iframe.contentWindow.document.querySelector("[data-adframe=restorer]")).to.be
                    .null;
                done();
            }
        });
    });

    it("executes injected JS via blob URL write method", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content: '<script type="text/javascript">\nwindow.codeExecuted = true;\n</script>',
            writeMethods: [WRITE_MODE_BLOB_URL],
            onLoadCallback: () => {
                expect(iframe.contentWindow).to.have.property("codeExecuted", true);
                done();
            }
        });
    });

    it("executes injected JS via srcdoc write method", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content: '<script type="text/javascript">\nwindow.codeExecuted = true;\n</script>',
            writeMethods: [WRITE_MODE_SRCDOC],
            onLoadCallback: () => {
                expect(iframe.contentWindow).to.have.property("codeExecuted", true);
                done();
            }
        });
    });

    it("executes injected JS via document.write write method", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content: '<script type="text/javascript">\nwindow.codeExecuted = true;\n</script>',
            writeMethods: [WRITE_MODE_DOC_WRITE],
            onLoadCallback: () => {
                expect(iframe.contentWindow).to.have.property("codeExecuted", true);
                done();
            }
        });
    });

    it("restores overridden built-ins within iframes", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content:
                '<script type="text/javascript">\nwindow.testFunc = function() {}; document.write = testFunc;\n</script>',
            onLoadCallback: () => {
                expect(iframe.contentWindow.document.write).to.not.equal(
                    iframe.contentWindow.testFunc
                );
                done();
            }
        });
    });

    it("renders injections", function(done) {
        const iframe = createAdFrame({
            parent: this.container,
            content: '<div id="test"></div>',
            injections: [
                { content: '<div id="before"></div>', prepend: true },
                { content: '<div id="after"></div>' }
            ],
            onLoadCallback: () => {
                expect(iframe.contentWindow.document.querySelector("#test")).to.not.be.null;
                const elements = iframe.contentWindow.document.body.querySelectorAll("div");
                expect(elements[0].getAttribute("id")).to.equal("before");
                expect(elements[1].getAttribute("id")).to.equal("test");
                expect(elements[2].getAttribute("id")).to.equal("after");
                done();
            }
        });
    });

    it("fires verified on-load callback when using blob URLs", function(done) {
        createAdFrame({
            parent: this.container,
            content: '<div id="test">',
            verifyLoad: true,
            writeMethods: [WRITE_MODE_BLOB_URL],
            onLoadCallback: done
        });
    });

    it("fires verified on-load callback when using srcdoc", function(done) {
        createAdFrame({
            parent: this.container,
            content: '<div id="test">',
            verifyLoad: true,
            writeMethods: [WRITE_MODE_SRCDOC],
            onLoadCallback: done
        });
    });

    it("fires verified on-load callback when using document.write", function(done) {
        createAdFrame({
            parent: this.container,
            content: '<div id="test">',
            verifyLoad: true,
            writeMethods: [WRITE_MODE_DOC_WRITE],
            onLoadCallback: done
        });
    });

    it("prepares iframe styling", function() {
        const iframe = createAdFrame({
            content: "<div><p>Some content</p></div>",
            parent: this.container
        });
        expect(iframe.getAttribute("scrolling")).to.equal("no");
    });

    it("allows for overidding iframe preparation", function() {
        const iframe = createAdFrame({
            content: "<div><p>Some content</p></div>",
            onBeforeInsert: iframe => {
                prepareIframe(iframe);
                iframe.setAttribute("id", "my-iframe");
            },
            parent: this.container
        });
        expect(iframe.getAttribute("id")).to.equal("my-iframe");
    });

    it("provides a communication interface for contained scripts", function(done) {
        const { onMessage, sendMessage } = createAdFrame({
            content: `
                <script type="text/javascript">
                    window.AdFrame.onMessage(function(msg) {
                        if (msg.type === "sendBack") {
                            window.AdFrame.sendMessage({ type: "done" });
                        }
                    });
                </script>
            `,
            parent: this.container
            // verifyLoad: true
        });
        onMessage(msg => {
            if (msg.type === "done") {
                done();
            }
        });
        sendMessage({ type: "sendBack" });
    });
});
