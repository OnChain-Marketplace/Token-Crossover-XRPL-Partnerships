const fs = require('fs');

let savejson = async function(path, object) {
    await fs.writeFileSync(path, (
        JSON.stringify(object, null, 1)
    ), function(err) {});

};

module.exports = { savejson };