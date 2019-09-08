import {
    WRITE_MODE_BLOB_URL,
    WRITE_MODE_DOC_WRITE,
    WRITE_MODE_SRCDOC,
    createAdFrame
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
});
