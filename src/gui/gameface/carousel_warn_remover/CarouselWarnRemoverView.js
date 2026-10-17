// in "gui/gameface/_dist/production/mono/hangar/chunks/lib.js"
// there is kinda this code:

/*
const resources = createContainer();
...
class StringsRClassProvider {
    ...
    readOrEmpty(e, t = "warn") {
        return this.readOr(e, (() => ""), t)
    }
    ...
}
...
resources.register({
    strings: asFunction((() => new StringsRClassProvider)).singleton(),
    ...
});
...
export {
    ..., resources as r, ...
}
*/

// `readOrEmpty` method is used by `FormatString` function (component)
// but we cannot override `FormatString` itself
// however, we can override `readOrEmpty` method that is used by FormatString
// which is used by components rendering warn text in vehicle cards
//
// so, first we want to capture `resources.resolve("strings")` result object
// which is of `StringsRClassProvider` class
// which handles translations
// including those that we want to remove
//
// but we cannot simply `import { r as resources } from "..."`
// because exported alias might be different with each WoT build
// so we have to (hopefully) guess it
//
// so, iterate over all exports and:
// - find something resembling container object (`register` and `resolve` functions)
// - hope that it has "strings" registration
// - if it really is our `StringsRClassProvider`, it should have `readOrEmpty` function
import * as libExports from "../_dist/production/mono/hangar/chunks/lib.js"

let resources = Object.values(libExports).find(libExport => {
    if (typeof libExport.register !== "function") return false;
    if (typeof libExport.resolve !== "function") return false;

    try {
        let stringObject = libExport.resolve("strings");
        if (stringObject && typeof stringObject.readOrEmpty === "function") {
            return true;
        }

        return false;
    }
    catch (e) {
        return false;
    }
});

if (resources) {
    // ignore those keys, because those are VERY common
    // and due to this are annoying
    let ignoredKeys = [
        "menu.tankCarousel.vehicleStates.crewNotFull",
        "menu.tankCarousel.vehicleStates.ammoNotFull",
        "menu.tankCarousel.vehicleStates.rentalIsOver",
        "menu.tankCarousel.vehicleStates.battle",
        "menu.tankCarousel.vehicleStates.inPrebattle",
    ];

    let stringsObject = resources.resolve("strings");

    let oldReadOrEmpty = stringsObject.readOrEmpty;
    stringsObject.readOrEmpty = function (key, errorType = "warn") {
        if (ignoredKeys.indexOf(key) !== -1) {
            return "";
        }

        return oldReadOrEmpty.apply(this, arguments);
    }
}
else {
    console.error("Could not find resources object containing translations, skipping carousel warn removing");
}
