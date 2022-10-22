"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFontCache = exports.getPretendardFont = exports.getImageFillUrlsCache = exports.setImageFillUrlsCache = exports.setInlineSVGCache = exports.setSVGCache = exports.setFigmaCache = exports.purgeCache = exports.getSVGCache = exports.getInlineSVGCache = exports.getFigmaCache = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const figmaCacheFolder = path_1.default.resolve(__dirname, '..', '..', '.figma-cache');
const getFigmaCache = ({ fileId, versionId }) => __awaiter(void 0, void 0, void 0, function* () {
    const cachePath = path_1.default.resolve(figmaCacheFolder, `${fileId}_${versionId}.json`);
    if (!(0, fs_1.existsSync)(cachePath))
        return null;
    try {
        const data = JSON.parse((0, fs_1.readFileSync)(cachePath, 'utf-8'));
        if (!data)
            return null;
        return data;
    }
    catch (e) { }
    return null;
});
exports.getFigmaCache = getFigmaCache;
const getInlineSVGCache = ({ fileId, nodeId }) => __awaiter(void 0, void 0, void 0, function* () {
    const cachePath = path_1.default.resolve(figmaCacheFolder, `${fileId}_${nodeId.replace(';', '-').replace(':', '.')}.inlinesvg`);
    if (!(0, fs_1.existsSync)(cachePath))
        return null;
    try {
        const data = JSON.parse((0, fs_1.readFileSync)(cachePath, 'utf-8'));
        if (typeof data !== 'string')
            return null;
        return data;
    }
    catch (e) { }
    return null;
});
exports.getInlineSVGCache = getInlineSVGCache;
const getSVGCache = ({ fileId, nodeId }) => __awaiter(void 0, void 0, void 0, function* () {
    const cachePath = path_1.default.resolve(figmaCacheFolder, `${fileId}_${nodeId.replace(';', '-').replace(':', '.')}.svgcode`);
    if (!(0, fs_1.existsSync)(cachePath))
        return null;
    try {
        const data = JSON.parse((0, fs_1.readFileSync)(cachePath, 'utf-8'));
        if (typeof data !== 'string')
            return null;
        return data;
    }
    catch (e) { }
    return null;
});
exports.getSVGCache = getSVGCache;
const purgeCache = (fileId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(0, fs_1.existsSync)(figmaCacheFolder))
        return false;
    const files = yield (0, promises_1.readdir)(figmaCacheFolder);
    for (const file of files) {
        if (file.startsWith(fileId)) {
            const cacheFilePath = path_1.default.resolve(figmaCacheFolder, file);
            if ((0, fs_1.existsSync)(cacheFilePath))
                (0, fs_1.rmSync)(cacheFilePath);
        }
    }
    return true;
});
exports.purgeCache = purgeCache;
const setFigmaCache = ({ fileId, versionId, data }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data)
        return false;
    const cachePath = path_1.default.resolve(figmaCacheFolder, `${fileId}_${versionId}.json`);
    if (!(0, fs_1.existsSync)(figmaCacheFolder)) {
        try {
            (0, fs_1.mkdirSync)(figmaCacheFolder, { recursive: true });
        }
        catch (e) { }
    }
    (0, fs_1.writeFileSync)(cachePath, JSON.stringify(data, null, 2));
    return true;
});
exports.setFigmaCache = setFigmaCache;
const setSVGCache = ({ fileId, nodeId, code }) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof code !== 'string')
        return false;
    const cachePath = path_1.default.resolve(figmaCacheFolder, `${fileId}_${nodeId.replace(';', '-').replace(':', '.')}.svgcode`);
    if (!(0, fs_1.existsSync)(figmaCacheFolder)) {
        try {
            (0, fs_1.mkdirSync)(figmaCacheFolder, { recursive: true });
        }
        catch (e) { }
    }
    (0, fs_1.writeFileSync)(cachePath, JSON.stringify(code, null, 2));
    return true;
});
exports.setSVGCache = setSVGCache;
const setInlineSVGCache = ({ fileId, nodeId, code }) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof code !== 'string')
        return false;
    const cachePath = path_1.default.resolve(figmaCacheFolder, `${fileId}_${nodeId.replace(';', '-').replace(':', '.')}.inlinesvg`);
    if (!(0, fs_1.existsSync)(figmaCacheFolder)) {
        try {
            (0, fs_1.mkdirSync)(figmaCacheFolder, { recursive: true });
        }
        catch (e) { }
    }
    (0, fs_1.writeFileSync)(cachePath, JSON.stringify(code, null, 2));
    return true;
});
exports.setInlineSVGCache = setInlineSVGCache;
const setImageFillUrlsCache = ({ fileId, versionId, imageFillUrls }) => __awaiter(void 0, void 0, void 0, function* () {
    const cachePath = path_1.default.resolve(figmaCacheFolder, `${fileId}_${versionId}_images.json`);
    if (!(0, fs_1.existsSync)(figmaCacheFolder)) {
        try {
            (0, fs_1.mkdirSync)(figmaCacheFolder, { recursive: true });
        }
        catch (e) { }
    }
    (0, fs_1.writeFileSync)(cachePath, JSON.stringify(imageFillUrls, null, 2));
    return true;
});
exports.setImageFillUrlsCache = setImageFillUrlsCache;
const getImageFillUrlsCache = ({ fileId, versionId }) => __awaiter(void 0, void 0, void 0, function* () {
    const cachePath = path_1.default.resolve(figmaCacheFolder, `${fileId}_${versionId}_images.json`);
    if (!(0, fs_1.existsSync)(cachePath))
        return null;
    try {
        const data = JSON.parse((0, fs_1.readFileSync)(cachePath, 'utf-8'));
        if (!data)
            return null;
        return data;
    }
    catch (e) { }
    return null;
});
exports.getImageFillUrlsCache = getImageFillUrlsCache;
const getPretendardFont = ({ fontFamily }) => {
    return `/*
Copyright (c) 2021 Kil Hyung-jin, with Reserved Font Name Pretendard.
https://github.com/orioncactus/pretendard

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL
*/

@font-face {
	font-family: '${fontFamily}';
	font-weight: 900;
	font-display: swap;
	src: local('Pretendard Black'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff2/Pretendard-Black.woff2') format('woff2'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff/Pretendard-Black.woff') format('woff');
}

@font-face {
	font-family: '${fontFamily}';
	font-weight: 800;
	font-display: swap;
	src: local('Pretendard ExtraBold'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff2/Pretendard-ExtraBold.woff2') format('woff2'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff/Pretendard-ExtraBold.woff') format('woff');
}

@font-face {
	font-family: '${fontFamily}';
	font-weight: 700;
	font-display: swap;
	src: local('Pretendard Bold'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff2/Pretendard-Bold.woff2') format('woff2'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff/Pretendard-Bold.woff') format('woff');
}

@font-face {
	font-family: '${fontFamily}';
	font-weight: 600;
	font-display: swap;
	src: local('Pretendard SemiBold'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff2/Pretendard-SemiBold.woff2') format('woff2'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff/Pretendard-SemiBold.woff') format('woff');
}

@font-face {
	font-family: '${fontFamily}';
	font-weight: 500;
	font-display: swap;
	src: local('Pretendard Medium'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff2/Pretendard-Medium.woff2') format('woff2'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff/Pretendard-Medium.woff') format('woff');
}

@font-face {
	font-family: '${fontFamily}';
	font-weight: 400;
	font-display: swap;
	src: local('Pretendard Regular'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff2/Pretendard-Regular.woff2') format('woff2'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff/Pretendard-Regular.woff') format('woff');
}

@font-face {
	font-family: '${fontFamily}';
	font-weight: 300;
	font-display: swap;
	src: local('Pretendard Light'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff2/Pretendard-Light.woff2') format('woff2'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff/Pretendard-Light.woff') format('woff');
}

@font-face {
	font-family: '${fontFamily}';
	font-weight: 200;
	font-display: swap;
	src: local('Pretendard ExtraLight'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff2/Pretendard-ExtraLight.woff2') format('woff2'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff/Pretendard-ExtraLight.woff') format('woff');
}

@font-face {
	font-family: '${fontFamily}';
	font-weight: 100;
	font-display: swap;
	src: local('Pretendard Thin'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff2/Pretendard-Thin.woff2') format('woff2'), url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.5/static/woff/Pretendard-Thin.woff') format('woff');
}`;
};
exports.getPretendardFont = getPretendardFont;
const getFontCache = ({ fontFamily }) => __awaiter(void 0, void 0, void 0, function* () {
    const appleLikeFonts = [
        'Pretendard',
        'SF Pro',
        'SF Pro Text',
        'SF Pro Display',
        'SF Pro Rounded',
        'SF Pro Icons',
        'SF Compact Rounded',
        'SF Compact Text',
        'SF Compact Display',
        'SF Compact Icons',
        'SF Compact Rounded',
        'SF Mono',
        'SF Arabic',
        'New York'
    ];
    if (!appleLikeFonts.includes(fontFamily))
        return null;
    return (0, exports.getPretendardFont)({ fontFamily: fontFamily });
});
exports.getFontCache = getFontCache;
