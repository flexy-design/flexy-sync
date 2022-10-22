export declare const getFigmaCache: ({ fileId, versionId }: {
    fileId: string;
    versionId: string;
}) => Promise<any>;
export declare const getInlineSVGCache: ({ fileId, nodeId }: {
    fileId: string;
    nodeId: string;
}) => Promise<string>;
export declare const getSVGCache: ({ fileId, nodeId }: {
    fileId: string;
    nodeId: string;
}) => Promise<string>;
export declare const purgeCache: (fileId: string) => Promise<boolean>;
export declare const setFigmaCache: ({ fileId, versionId, data }: {
    fileId: string;
    versionId: string;
    data: any;
}) => Promise<boolean>;
export declare const setSVGCache: ({ fileId, nodeId, code }: {
    fileId: string;
    nodeId: string;
    code: string;
}) => Promise<boolean>;
export declare const setInlineSVGCache: ({ fileId, nodeId, code }: {
    fileId: string;
    nodeId: string;
    code: string;
}) => Promise<boolean>;
export declare const setImageFillUrlsCache: ({ fileId, versionId, imageFillUrls }: {
    fileId: string;
    versionId: string;
    imageFillUrls: any;
}) => Promise<boolean>;
export declare const getImageFillUrlsCache: ({ fileId, versionId }: {
    fileId: string;
    versionId: string;
}) => Promise<any>;
export declare const getPretendardFont: ({ fontFamily }: {
    fontFamily: string;
}) => string;
export declare const getFontCache: ({ fontFamily }: {
    fontFamily: string;
}) => Promise<string>;
