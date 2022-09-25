import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { readdir } from "fs/promises";
import path from "path";

const figmaCacheFolder = path.resolve(__dirname, "..", "..", ".figma-cache");

export const getFigmaCache = async ({
  fileId,
  versionId,
}: {
  fileId: string;
  versionId: string;
}) => {
  const cachePath = path.resolve(
    figmaCacheFolder,
    `${fileId}_${versionId}.json`
  );
  if (!existsSync(cachePath)) return null;

  try {
    const data = JSON.parse(readFileSync(cachePath, "utf-8"));
    if (!data) return null;
    return data;
  } catch (e) {}

  return null;
};

export const getInlineSVGCache = async ({
  fileId,
  nodeId,
}: {
  fileId: string;
  nodeId: string;
}) => {
  const cachePath = path.resolve(
    figmaCacheFolder,
    `${fileId}_${nodeId}.inlinesvg`
  );
  if (!existsSync(cachePath)) return null;

  try {
    const data = JSON.parse(readFileSync(cachePath, "utf-8"));
    if (typeof data !== "string") return null;
    return data;
  } catch (e) {}

  return null;
};

export const getSVGCache = async ({
  fileId,
  nodeId,
}: {
  fileId: string;
  nodeId: string;
}) => {
  const cachePath = path.resolve(
    figmaCacheFolder,
    `${fileId}_${nodeId}.svgcode`
  );
  if (!existsSync(cachePath)) return null;

  try {
    const data = JSON.parse(readFileSync(cachePath, "utf-8"));
    if (typeof data !== "string") return null;
    return data;
  } catch (e) {}

  return null;
};

export const purgeCache = async (fileId: string) => {
  if (!existsSync(figmaCacheFolder)) return false;
  const files = await readdir(figmaCacheFolder);
  for (const file of files) {
    if (file.startsWith(fileId)) {
      const cacheFilePath = path.resolve(figmaCacheFolder, file);
      if (existsSync(cacheFilePath)) rmSync(cacheFilePath);
    }
  }
  return true;
};

export const setFigmaCache = async ({
  fileId,
  versionId,
  data,
}: {
  fileId: string;
  versionId: string;
  data: any;
}) => {
  if (!data) return false;
  const cachePath = path.resolve(
    figmaCacheFolder,
    `${fileId}_${versionId}.json`
  );
  if (!existsSync(figmaCacheFolder)) {
    try {
      mkdirSync(figmaCacheFolder, { recursive: true });
    } catch (e) {}
  }
  writeFileSync(cachePath, JSON.stringify(data, null, 2));
  return true;
};

export const setSVGCache = async ({
  fileId,
  nodeId,
  code,
}: {
  fileId: string;
  nodeId: string;
  code: string;
}) => {
  if (typeof code !== "string") return false;
  const cachePath = path.resolve(
    figmaCacheFolder,
    `${fileId}_${nodeId}.svgcode`
  );
  if (!existsSync(figmaCacheFolder)) {
    try {
      mkdirSync(figmaCacheFolder, { recursive: true });
    } catch (e) {}
  }
  writeFileSync(cachePath, JSON.stringify(code, null, 2));
  return true;
};

export const setInlineSVGCache = async ({
  fileId,
  nodeId,
  code,
}: {
  fileId: string;
  nodeId: string;
  code: string;
}) => {
  if (typeof code !== "string") return false;
  const cachePath = path.resolve(
    figmaCacheFolder,
    `${fileId}_${nodeId}.inlinesvg`
  );
  if (!existsSync(figmaCacheFolder)) {
    try {
      mkdirSync(figmaCacheFolder, { recursive: true });
    } catch (e) {}
  }
  writeFileSync(cachePath, JSON.stringify(code, null, 2));
  return true;
};

export const setImageFillUrlsCache = async ({
  fileId,
  versionId,
  imageFillUrls,
}: {
  fileId: string;
  versionId: string;
  imageFillUrls: any;
}) => {
  const cachePath = path.resolve(
    figmaCacheFolder,
    `${fileId}_${versionId}_images.json`
  );
  if (!existsSync(figmaCacheFolder)) {
    try {
      mkdirSync(figmaCacheFolder, { recursive: true });
    } catch (e) {}
  }
  writeFileSync(cachePath, JSON.stringify(imageFillUrls, null, 2));
  return true;
};

export const getImageFillUrlsCache = async ({
  fileId,
  versionId,
}: {
  fileId: string;
  versionId: string;
}) => {
  const cachePath = path.resolve(
    figmaCacheFolder,
    `${fileId}_${versionId}_images.json`
  );
  if (!existsSync(cachePath)) return null;

  try {
    const data = JSON.parse(readFileSync(cachePath, "utf-8"));
    if (!data) return null;
    return data;
  } catch (e) {}

  return null;
};

export const getPretendardFont = ({ fontFamily }: { fontFamily: string }) => {
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

export const getFontCache = async ({ fontFamily }: { fontFamily: string }) => {
  const appleLikeFonts = [
    "Pretendard",
    "SF Pro",
    "SF Pro Text",
    "SF Pro Display",
    "SF Pro Rounded",
    "SF Pro Icons",
    "SF Compact Rounded",
    "SF Compact Text",
    "SF Compact Display",
    "SF Compact Icons",
    "SF Compact Rounded",
    "SF Mono",
    "SF Arabic",
    "New York",
  ];

  if (!appleLikeFonts.includes(fontFamily)) return null;
  return getPretendardFont({ fontFamily: fontFamily });
};
