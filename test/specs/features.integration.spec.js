import { detectCSPBlocking } from "../../source/index.js";

describe("detectCSPBlocking", function() {
    it("fires the callback with a boolean value", function(done) {
        detectCSPBlocking(value => {
            expect(value).to.be.a("boolean");
            done();
        });
    });
});
