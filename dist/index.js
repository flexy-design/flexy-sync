"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const nanoid_1 = require("nanoid");
const fs_1 = require("fs");
const cache_1 = require("./utils/cache");
const FigmaAPI = __importStar(require("figma-api"));
const svg_1 = require("./utils/svg");
const isomorphic_unfetch_1 = __importDefault(require("isomorphic-unfetch"));
void (() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const flexyConfigPath = path_1.default.resolve(process.cwd(), 'flexy.config.json');
    const flexySecretPath = path_1.default.resolve(process.cwd(), 'flexy.secret.json');
    if (!(0, fs_1.existsSync)(flexyConfigPath)) {
        console.log(chalk_1.default.red(`Flexy config file not found at ${flexyConfigPath}`));
        return;
    }
    if (!(0, fs_1.existsSync)(flexySecretPath)) {
        console.log(chalk_1.default.red(`Flexy secret file not found at ${flexySecretPath}`));
        return;
    }
    const flexyConfig = require(flexyConfigPath);
    const { personalAccessToken, betaTesterToken } = require(flexySecretPath);
    const publicFolderPath = path_1.default.resolve(process.cwd(), flexyConfig.publicPath);
    try {
        (0, fs_1.mkdirSync)(publicFolderPath, { recursive: true });
    }
    catch (e) { }
    console.log(chalk_1.default.blueBright(`    ________    _______  ____  __
   / ____/ /   / ____/ |/ /\\ \/  \/
  / /_  / /   / __/  |   /  \\  /
 / __/ / /___/ /___ /   |   / /
/_/   /_____/_____//_/|_|  /_/`));
    const moduleJsonPath = path_1.default.resolve(__dirname, '../package.json');
    const packageJson = JSON.parse(String((0, fs_1.readFileSync)(moduleJsonPath)));
    console.log(chalk_1.default.blueBright(`\nWelcome to Flexy CLI! (${packageJson.version})`));
    for (const componentName of Object.keys(flexyConfig.components)) {
        console.log(chalk_1.default.blueBright(`\n[Flexy] [${componentName}.tsx] Synchronization in progress...`));
        const [fileIdAlias, pageName, frameName] = flexyConfig.components[componentName];
        const fileId = flexyConfig.figmaUrls[fileIdAlias].replace(/^https:\/\/www\.figma\.com\/file\/(.*)\/(.*)$/, '$1');
        try {
            // Request the transformed html and file urls
            const { data, status } = yield axios_1.default.post('https://api.flexy.design/v1/sync', {
                personalAccessToken,
                fileId,
                pageName,
                frameName,
                inlineSvg: flexyConfig.inlineSvg,
                workUuid: (0, nanoid_1.nanoid)(),
                target: (_a = flexyConfig.target) !== null && _a !== void 0 ? _a : 'react',
                betaTesterKey: betaTesterToken !== null && betaTesterToken !== void 0 ? betaTesterToken : 'public'
            });
            if (data.success)
                console.log(chalk_1.default.blueBright(`[Flexy] [${componentName}.tsx] Transpile finished in ${Math.floor(data.time)}ms.`));
            if (!data.success) {
                console.log(chalk_1.default.redBright(`[Flexy] [${componentName}.tsx] Error: ${data.message}`));
                continue;
            }
            if (flexyConfig.inlineSvg !== true) {
                const svgs = Object.entries(data.files).filter(([key]) => key.endsWith('.svg'));
                // Purify the svg
                let convertedSVGCount = 0;
                for (const [filePath, value] of svgs) {
                    convertedSVGCount += 1;
                    const svgFilePath = path_1.default.resolve(publicFolderPath, filePath);
                    const svgId = value.content;
                    // if (existsSync(svgFilePath)) continue
                    const cache = yield (0, cache_1.getSVGCache)({
                        fileId,
                        nodeId: svgId
                    });
                    try {
                        if (cache === null) {
                            const api = new FigmaAPI.Api({
                                personalAccessToken
                            });
                            const response = yield api.getImage(fileId, {
                                format: 'svg',
                                ids: svgId,
                                scale: 1
                            });
                            const svgUrl = response.images[svgId];
                            if (!svgUrl)
                                throw new Error('No svg url');
                            let svgHTML = yield (0, isomorphic_unfetch_1.default)(svgUrl).then((res) => res.text());
                            if (!svgHTML)
                                throw new Error('No svg response');
                            svgHTML = (0, svg_1.convertSVGToUniqueId)(svgHTML);
                            (0, fs_1.writeFileSync)(svgFilePath, svgHTML);
                            console.log(chalk_1.default.blueBright(`[Flexy] [${componentName}.tsx] Converted SVG of ${filePath}... (${convertedSVGCount}/${svgs.length})`));
                            // doesn't need to wait
                            (0, cache_1.setSVGCache)({
                                fileId,
                                nodeId: svgId,
                                code: svgHTML
                            });
                        }
                        else {
                            if (typeof cache === 'string' && cache.length === 0) {
                                console.log(chalk_1.default.yellowBright(`[Flexy] [${componentName}.tsx] Cannot convert hidden SVG elements of ${filePath}... (${convertedSVGCount}/${svgs.length})`));
                            }
                            else {
                                if (typeof cache === 'string') {
                                    console.log(chalk_1.default.blueBright(`[Flexy] [${componentName}.tsx] Converted SVG of ${filePath}... (${convertedSVGCount}/${svgs.length})`));
                                    (0, fs_1.writeFileSync)(svgFilePath, cache);
                                }
                            }
                        }
                    }
                    catch (e) {
                        // doesn't need to wait
                        (0, cache_1.setSVGCache)({
                            fileId,
                            nodeId: svgId,
                            code: ''
                        });
                        console.log(chalk_1.default.yellowBright(`[Flexy] [${componentName}.tsx] Cannot convert hidden SVG elements of ${filePath}... (${convertedSVGCount}/${svgs.length})`));
                    }
                }
            }
            let convertedImageCount = 0;
            const images = Object.entries(data.files).filter(([key, file]) => !key.endsWith('.svg') && file.isBinary);
            for (const [filePath, value] of images) {
                convertedImageCount += 1;
                console.log(chalk_1.default.blueBright(`[Flexy] [${componentName}.tsx] Convert Image of ${filePath}... (${convertedImageCount}/${images.length})`));
                const url = value.content;
                const imagePath = path_1.default.resolve(publicFolderPath, filePath);
                if ((0, fs_1.existsSync)(imagePath))
                    continue;
                try {
                    yield (0, axios_1.default)({
                        method: 'get',
                        url,
                        responseType: 'arraybuffer'
                    })
                        .then((response) => {
                        (0, fs_1.writeFileSync)(imagePath, response.data);
                    })
                        .catch((e) => {
                        console.log(chalk_1.default.yellowBright(`[Flexy] [${componentName}.tsx] Warning: Failed Image Download of ${filePath}... (${convertedImageCount}/${images.length})`));
                    });
                }
                catch (e) {
                    console.log(chalk_1.default.yellowBright(`[Flexy] [${componentName}.tsx] Warning: Failed Image Download of ${filePath}... (${convertedImageCount}/${images.length})`));
                }
            }
            const uiComponentFolderPath = flexyConfig.rawComponentPath
                ? path_1.default.resolve(process.cwd(), flexyConfig.rawComponentPath)
                : path_1.default.resolve(process.cwd(), 'components', 'flexy');
            const uxComponentFolderPath = flexyConfig.componentsPath
                ? path_1.default.resolve(process.cwd(), flexyConfig.componentsPath)
                : path_1.default.resolve(process.cwd(), 'components');
            try {
                (0, fs_1.mkdirSync)(uiComponentFolderPath, { recursive: true });
            }
            catch (e) { }
            try {
                (0, fs_1.mkdirSync)(uxComponentFolderPath, { recursive: true });
            }
            catch (e) { }
            const uiComponentPath = path_1.default.resolve(uiComponentFolderPath, `${componentName}.tsx`);
            (0, fs_1.writeFileSync)(uiComponentPath, (_c = (_b = data === null || data === void 0 ? void 0 : data.files) === null || _b === void 0 ? void 0 : _b['index.tsx']) === null || _c === void 0 ? void 0 : _c.content);
            const uxComponentPath = path_1.default.resolve(uxComponentFolderPath, `${componentName}UX.tsx`);
            const relativeComponentPath = path_1.default.relative(uxComponentFolderPath, uiComponentFolderPath);
            if (!(0, fs_1.existsSync)(uxComponentPath))
                (0, fs_1.writeFileSync)(uxComponentPath, `import { Flexy } from "@flexy-design/react";
import * as designToken from "./${relativeComponentPath}/${componentName}";

const ${componentName}UX = () => {
  return (
    <Flexy.UX
      className=""
      fit="width"
      backgroundColor="auto"
      adjustTextSize={false}
      {...designToken}
    >
      {/* TODO Use <Flexy.*> */}
    </Flexy.UX>
  );
};

export default ${componentName}UX;
`);
            console.log(chalk_1.default.greenBright(`[Flexy] [${componentName}.tsx] Sync is completed. ${uxComponentPath}`));
        }
        catch (e) {
            console.error(e);
        }
    }
}))();
