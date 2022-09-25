import { v4 as uuidv4 } from "uuid";
import { parseSync } from "svgson";

const collectIds = (children: any) => {
  let ids: string[] = [];
  children.forEach((child: any) => {
    if (child.attributes.id && !ids.includes(child.attributes.id))
      ids.push(child.attributes.id);
    if (child.children) {
      ids = [...ids, ...collectIds(child.children)];
    }
  });
  return ids;
};

const collectClasses = (children: any) => {
  let classes: string[] = [];
  children.forEach((child: any) => {
    if (child.attributes.class && !classes.includes(child.attributes.class))
      classes.push(child.attributes.class);
    if (child.children) {
      classes = [...classes, ...collectClasses(child.children)];
    }
  });
  return classes;
};

const generateIdMap = (ids: any) => {
  const idMap: any = {};
  ids.forEach((id: any) => {
    idMap[id] = uuidv4();
  });
  return idMap;
};

const generateClassMap = (classes: any) => {
  const classMap = {} as any;
  classes.forEach((className: any) => {
    classMap[className] = uuidv4();
  });
  return classMap;
};

// replaceAll not prototype
const replaceAll = (string: string, search: string, replacement: string) => {
  return string.replace(new RegExp(search, "g"), replacement);
};

const replaceIds = (file: any, idMap: any) => {
  let newFile = file;
  Object.keys(idMap).forEach((id) => {
    newFile = replaceAll(newFile, `id="${id}"`, `id="${idMap[id]}"`);
    newFile = replaceAll(newFile, `#${id}`, `#${idMap[id]}`);
    return newFile;
  });
  return newFile;
};

const replaceClasses = (file: any, classMap: any) => {
  let newFile = file;
  Object.keys(classMap).forEach((className) => {
    newFile = replaceAll(
      newFile,
      `class="${className}"`,
      `class="${classMap[className]}"`
    );
    newFile = replaceAll(newFile, `.${className}`, `.${classMap[className]}`);
    return newFile;
  });
  return newFile;
};

export const convertSVGToUniqueId = (file: string) => {
  const result = parseSync(file, {});
  const ids = collectIds(result.children);
  const classes = collectClasses(result.children);
  if (ids?.length === 0 && classes?.length === 0) return file;

  const idMap = generateIdMap(ids);
  const classMap = generateClassMap(classes);
  const newFile = replaceClasses(replaceIds(file, idMap), classMap);
  return newFile;
};
