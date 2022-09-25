"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSVGToUniqueId = void 0;
const uuid_1 = require("uuid");
const svgson_1 = require("svgson");
const collectIds = (children) => {
    let ids = [];
    children.forEach((child) => {
        if (child.attributes.id && !ids.includes(child.attributes.id))
            ids.push(child.attributes.id);
        if (child.children) {
            ids = [...ids, ...collectIds(child.children)];
        }
    });
    return ids;
};
const collectClasses = (children) => {
    let classes = [];
    children.forEach((child) => {
        if (child.attributes.class && !classes.includes(child.attributes.class))
            classes.push(child.attributes.class);
        if (child.children) {
            classes = [...classes, ...collectClasses(child.children)];
        }
    });
    return classes;
};
const generateIdMap = (ids) => {
    const idMap = {};
    ids.forEach((id) => {
        idMap[id] = (0, uuid_1.v4)();
    });
    return idMap;
};
const generateClassMap = (classes) => {
    const classMap = {};
    classes.forEach((className) => {
        classMap[className] = (0, uuid_1.v4)();
    });
    return classMap;
};
// replaceAll not prototype
const replaceAll = (string, search, replacement) => {
    return string.replace(new RegExp(search, "g"), replacement);
};
const replaceIds = (file, idMap) => {
    let newFile = file;
    Object.keys(idMap).forEach((id) => {
        newFile = replaceAll(newFile, `id="${id}"`, `id="${idMap[id]}"`);
        newFile = replaceAll(newFile, `#${id}`, `#${idMap[id]}`);
        return newFile;
    });
    return newFile;
};
const replaceClasses = (file, classMap) => {
    let newFile = file;
    Object.keys(classMap).forEach((className) => {
        newFile = replaceAll(newFile, `class="${className}"`, `class="${classMap[className]}"`);
        newFile = replaceAll(newFile, `.${className}`, `.${classMap[className]}`);
        return newFile;
    });
    return newFile;
};
const convertSVGToUniqueId = (file) => {
    const result = (0, svgson_1.parseSync)(file, {});
    const ids = collectIds(result.children);
    const classes = collectClasses(result.children);
    if ((ids === null || ids === void 0 ? void 0 : ids.length) === 0 && (classes === null || classes === void 0 ? void 0 : classes.length) === 0)
        return file;
    const idMap = generateIdMap(ids);
    const classMap = generateClassMap(classes);
    const newFile = replaceClasses(replaceIds(file, idMap), classMap);
    return newFile;
};
exports.convertSVGToUniqueId = convertSVGToUniqueId;
