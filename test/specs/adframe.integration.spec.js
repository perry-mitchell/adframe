import { createAdFrame } from "../../source/index.js";

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
});
