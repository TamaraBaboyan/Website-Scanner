const URI = require("urijs");
const { url_regex } = require("../constants/regex");


const grabArgv = (flag) => {
    let indexAfterFlag = process.argv.indexOf(flag) + 1;
    url = process.argv[indexAfterFlag];
    if (!url.match(url_regex)) {
        throw new Error("Invalid URL");
    }
    return process.argv[indexAfterFlag];
};


function joinUrl(url, baseUrl) {
    var theUrl = new URI(url);
    if (theUrl.is("relative")) {
        theUrl = theUrl.absoluteTo(baseUrl);
    }
    return theUrl.toString();
}

function normalizeUrl(url) {
    url = url[url.length - 1] === "/" ? url.substring(0, url.length - 1) : url;
    url = url[0] === "/" ? url.substring(1) : url;
    return url;
}


module.exports = {
    grabArgv,
    joinUrl,
    normalizeUrl,
};
