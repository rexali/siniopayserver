"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.uploadFiles = uploadFiles;
exports.uploadMultipleFiles = uploadMultipleFiles;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
/**
 * Upload upload file with a field name
 * @returns upload
 */
function uploadFile(fieldname) {
    const storage = multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path_1.default.join(process.cwd(), 'src/public/uploads/'));
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            if (file?.originalname.endsWith('.jpg')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
            }
            else if (file?.originalname.endsWith('.png')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
            }
            else if (file?.originalname.endsWith('.pdf')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
            }
            else if (file?.originalname.endsWith('.mp3')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.mp3');
            }
            else if (file?.originalname.endsWith('.mp4')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.mp4');
            }
            else if (file?.originalname.endsWith('.jpeg')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.jpeg');
            }
            else {
                cb(null, file.fieldname + '-' + uniqueSuffix);
            }
        }
    });
    const upload = (0, multer_1.default)({ storage: storage }).single(fieldname);
    return upload;
}
/**
 * Upload multiple file with different field names
 * @returns upload
 */
function uploadFiles() {
    const storage = multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path_1.default.join(process.cwd(), 'public/uploads/'));
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            if (file?.originalname.endsWith('.jpg')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
            }
            else if (file?.originalname.endsWith('.png')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
            }
            else if (file?.originalname.endsWith('.pdf')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
            }
            else if (file?.originalname.endsWith('.mp3')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.mp3');
            }
            else if (file?.originalname.endsWith('.mp4')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.mp4');
            }
            else if (file?.originalname.endsWith('.jpeg')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.jpeg');
            }
            else {
                cb(null, file.fieldname + '-' + uniqueSuffix);
            }
        }
    });
    const upload = (0, multer_1.default)({ storage: storage }).any();
    return upload;
}
/**
 * Upload multiple file with same fieldnames
 * @returns upload
 */
function uploadMultipleFiles(filedName) {
    const storage = multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path_1.default.join(process.cwd(), 'public/uploads/'));
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            if (file?.originalname.endsWith('.jpg')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
            }
            else if (file?.originalname.endsWith('.png')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
            }
            else if (file?.originalname.endsWith('.pdf')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
            }
            else if (file?.originalname.endsWith('.mp3')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.mp3');
            }
            else if (file?.originalname.endsWith('.mp4')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.mp4');
            }
            else if (file?.originalname.endsWith('.jpeg')) {
                cb(null, file.fieldname + '-' + uniqueSuffix + '.jpeg');
            }
            else {
                cb(null, file.fieldname + '-' + uniqueSuffix);
            }
        }
    });
    const upload = (0, multer_1.default)({ storage: storage }).array(filedName);
    return upload;
}
