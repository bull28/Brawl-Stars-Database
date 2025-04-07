import {expect} from "chai";
import {findName} from "../../../frank/modules/utils";

describe("Module utilities", function(){
    it("Find an object with a given name in an array", function(){
        const array = ["bull", "darryl", "el primo", "frank", "ash"].map((value) => ({name: value}));
        const array2 = ["darryl", "bull", "ash", "el primo", "frank"].map((value) => ({name: value}));
        const lookup = new Map(array.map((value, index) => [value.name, index]));

        // Ensure the lookup map is set up properly before starting
        for (let x = 0; x < array.length; x++){
            expect(lookup.get(array[x].name)).to.equal(x);
        }

        // No lookup
        expect(findName(array, "bull")).to.equal(0);
        expect(findName(array, "el primo")).to.equal(2);
        expect(findName(array, "ash")).to.equal(4);
        expect(findName(array, "mandy")).to.equal(-1);
        expect(findName(array, "")).to.equal(-1);

        // Using lookup
        expect(findName(array, "bull", lookup)).to.equal(0);
        expect(findName(array, "el primo", lookup)).to.equal(2);
        expect(findName(array, "ash", lookup)).to.equal(4);
        expect(findName(array, "mandy", lookup)).to.equal(-1);
        expect(findName(array, "", lookup)).to.equal(-1);

        // Array order does not match lookup
        expect(findName(array2, "darryl", lookup)).to.equal(0);
        expect(findName(array2, "bull", lookup)).to.equal(1);
        expect(findName(array2, "ash", lookup)).to.equal(2);
        expect(findName(array2, "el primo", lookup)).to.equal(3);
        expect(findName(array2, "frank", lookup)).to.equal(4);
        expect(findName(array2, "mandy", lookup)).to.equal(-1);
        expect(findName(array2, "", lookup)).to.equal(-1);
    });
});
