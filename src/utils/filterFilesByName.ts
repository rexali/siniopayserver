
export function filterFilesByName(files: any, filename: string) {
    let results: Array<any> = [];
    files.forEach((file: any) => {
        if (file.fieldname === filename) {
            results.push(file.filename)
        }

    });

    return results;
}