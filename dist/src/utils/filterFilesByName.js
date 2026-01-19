"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterFilesByName = filterFilesByName;
function filterFilesByName(files, filename) {
    let results = [];
    files.forEach((file) => {
        if (file.fieldname === filename) {
            results.push(file.filename);
        }
    });
    return results;
}
