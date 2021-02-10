const { grabArgv } = require("./helpers/util");
const { processUrl } = require("./services/data.service")


function scanWebsite() {
    try {
        const url = grabArgv("--url");
        processUrl(url);
    } catch (err) {
        console.log(err.message);
    }
}


scanWebsite();
