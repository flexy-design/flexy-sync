import {
  DetailedHTMLProps,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import {
  ContainerProvider,
  useContainerContext,
} from "./context/ContainerContext";
import { round, useFlexy, useUniqueClassName } from "./utils/useFlexy";
import { CommonProvider, useCommonContext } from "./context/CommonContext";
import { localeList } from "./utils/locale";

import type { ReactNode, ElementType, HTMLAttributes } from "react";
import ReactDOM from "react-dom";

export interface IContainerProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  sync: () => JSX.Element;
  fit?: "width" | "height";
  children?: ReactNode;
  adjustTextSize?: boolean;
  adjustInlineSvgSize?: boolean;
  backgroundColor?: "auto" | string;
  borderColor?: string;
  animate?: boolean;
  overflow?: "auto" | "hidden" | "scroll" | "visible" | "initial";
}

export const UX = (props: IContainerProps) => {
  const {
    sync: Root,
    children,
    fit,
    adjustTextSize,
    adjustInlineSvgSize,
    backgroundColor,
    borderColor,
    animate,
    overflow,
    ...containerProps
  } = props;

  return (
    <ContainerProvider
      {...containerProps}
      fit={fit}
      adjustTextSize={adjustTextSize}
      adjustInlineSvgSize={adjustInlineSvgSize}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      animate={animate}
      overflow={overflow}
    >
      <Root />
      {children}
    </ContainerProvider>
  );
};

export interface IComponentProps extends HTMLAttributes<HTMLOrSVGElement> {
  name: string;
  as?: ElementType;
  visibile?: boolean;
  children?: ReactNode;
}

export const Component = ({
  name,
  as,
  visibile = true,
  children,
  ...handlers
}: IComponentProps) => {
  const ref = useContainerContext();
  const { selector } = useFlexy(ref);

  const element = selector(`[data-name="${name}"]`) as HTMLElement &
    Record<string, any>;
  const innerProps = handlers as typeof handlers & Record<string, any>;

  useEffect(() => {
    if (element) {
      element.style.visibility = visibile ? "visible" : "none";
      for (const propKey of Object.keys(innerProps)) {
        if (propKey.startsWith("on")) {
          element.addEventListener(
            propKey.replace("on", "").toLowerCase(),
            innerProps[propKey]
          );
        } else {
          element[propKey] = innerProps[propKey];
        }
      }
    }

    return () => {
      if (element) {
        for (const propKey of Object.keys(innerProps)) {
          if (propKey.startsWith("on")) {
            element.removeEventListener(
              propKey.replace("on", "").toLowerCase(),
              innerProps[propKey]
            );
          }
        }
      }
    };
  });

  return <CommonProvider value={element}>{children}</CommonProvider>;
};

export type DeviceType = "mobile" | "tablet" | "desktop";
export type DeviceOrientationType = "portrait" | "landscape";
export interface IDeviceProps {
  children?: ReactNode;
  default?: boolean;
  deviceOrientations?: DeviceOrientationType[] | DeviceOrientationType;
  deviceTypes?: DeviceType[] | DeviceType;
  language?: typeof localeList[number][] | typeof localeList[number];
  breakpoints?: {
    max?: [number?, number?];
    min?: [number?, number?];
  }[];
}

export const Device = (props: IDeviceProps) => {
  const { children, language, breakpoints, deviceTypes, deviceOrientations } =
    props;

  const checkCurrentDeviceOrientation = () => {
    const currentDeviceOrientation =
      window.innerWidth > window.innerHeight ? "landscape" : "portrait";

    if (deviceOrientations) {
      if (Array.isArray(deviceOrientations))
        return deviceOrientations.includes(currentDeviceOrientation);
      return deviceOrientations === currentDeviceOrientation;
    }
    return true;
  };

  const checkCurrentDeviceType = () => {
    let currentDeviceType: DeviceType = "desktop";
    if (window.innerWidth <= 768) currentDeviceType = "mobile";
    if (window.innerWidth <= 1024) currentDeviceType = "tablet";

    if (Array.isArray(deviceTypes)) {
      return deviceTypes.includes(currentDeviceType);
    } else {
      return deviceTypes === currentDeviceType;
    }
  };

  const checkLanguages = () => {
    const currentLanguage = navigator.language as typeof localeList[number];

    if (language) {
      if (Array.isArray(language)) return language.includes(currentLanguage);
      return language === currentLanguage;
    }
  };

  const checkBreakpoints = () => {
    if (!breakpoints) return true;

    for (const breakpoint of breakpoints) {
      const { max, min } = breakpoint;
      if (max) {
        if (max[0] && window.innerWidth > max[0]) return false;
        if (max[1] && window.innerHeight > max[1]) return false;
      }
      if (min) {
        if (min[0] && window.innerWidth < min[0]) return false;
        if (min[1] && window.innerHeight < min[1]) return false;
      }
    }
    return true;
  };

  if (
    props.default ||
    (checkCurrentDeviceOrientation() &&
      checkCurrentDeviceType() &&
      checkLanguages() &&
      checkBreakpoints())
  ) {
    return <>{children}</>;
  } else {
    return <></>;
  }
};

export interface IListProps {
  list: string;
  item: string;
  as?: ElementType;
  scroll?: "vertical" | "horizontal";
  direction?: "row" | "column";
  gap?: number;
  children?: ReactNode;
}

export const List = (props: IListProps) => {
  const { list, item, scroll, direction, gap, children } = props;

  const containerRef = useContainerContext();
  const { selector, useList } = useFlexy(containerRef);

  const functions: Record<string, any> = useMemo(() => ({}), []);
  const listElement = selector(`[data-name="${list}"]`);
  const itemElement = selector(`[data-name="${item}"]`);

  useList({
    list,
    item,
    preset: "column-list",
    render: ({ create, select, getHtml }) => {
      functions.create = create;
      functions.select = select;
      functions.getHtml = getHtml;
    },
    deps: [containerRef],
  });

  useEffect(() => {
    if (!listElement) return;
    if (!itemElement) return;

    if (scroll) {
      if (scroll === "horizontal") listElement.style.overflowY = "scroll";
      if (scroll === "vertical") listElement.style.overflowX = "scroll";
    }

    if (direction) {
      if (direction === "column") listElement.style.flexDirection = "column";
      if (direction === "row") listElement.style.flexDirection = "row";
    }

    if (gap) listElement.style.gap = String(gap);
  });

  const ListPortal = () => {
    const [isFirst, setFirst] = useState<any>(true);

    if (isFirst && listElement) setFirst(false);

    return <>{ReactDOM.createPortal(children, listElement)}</>;
  };

  return (
    <CommonProvider value={{ functions, list, item }}>
      {listElement && <ListPortal />}
    </CommonProvider>
  );
};

export interface IItemProps extends HTMLAttributes<HTMLOrSVGElement> {
  children: ReactNode;
}

export const Item = (props: IItemProps) => {
  const { children, ...handlers } = props;
  const contextValue = useCommonContext();
  const { functions, list, item } = contextValue ?? {};
  const [componentHtml, setComponentHtml] = useState("");

  const ref = useRef(null);
  useEffect(() => {
    if (functions && Object.keys(functions).length > 0) {
      const html = functions.getHtml();
      setComponentHtml(html);
    }
  }, [functions, handlers]);

  return (
    <CommonProvider value={{ ref, list, item, ...props }}>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: componentHtml }} />
      {children}
    </CommonProvider>
  );
};

export interface IPropertyProps {
  name: string;
  innerText?: string;
}

export interface IPropertyProps
  extends DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLInputElement
  > {}

export const Property = (props: IPropertyProps) => {
  const { ...elementProps } = props as IPropertyProps &
    Record<string, EventListener>;

  const context = useCommonContext();
  const { selector } = useFlexy(context?.ref);

  useEffect(() => {
    const element = context?.ref?.current
      ? selector(`[data-name="${props.name}"]`)
      : null;

    for (const propKey of Object.keys(props)) {
      if (propKey.startsWith("on") && element) {
        element.addEventListener(
          propKey.replace("on", "").toLowerCase(),
          elementProps[propKey]
        );
      } else {
        if (element) (element as any)[propKey] = elementProps[propKey];
      }
    }

    return () => {
      for (const propKey of Object.keys(props)) {
        if (propKey.startsWith("on")) {
          context?.ref?.currnet?.removeEventListener(
            propKey.replace("on", "").toLowerCase(),
            elementProps[propKey]
          );
        }
      }
    };
  });

  return <></>;
};

export interface IInputProps
  extends DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  boxName: string;
  textName: string;
  backgroundName?: string;
}

export const Input = (props: IInputProps) => {
  const { boxName, textName, backgroundName, children, ...inputProps } = props;
  const ref = useContainerContext();
  const { selector } = useFlexy(ref);

  useEffect(() => {
    if (!ref?.current) return;
    const boxDesign = selector(`[data-name="${boxName}"]`);
    const textDesign = selector(`[data-name="${textName}"]`);
    const backgroundDesign = backgroundName
      ? selector(`[data-name="${backgroundName}"]`)
      : null;

    if (boxDesign) {
      const boxClassName = boxDesign.className;

      const input = document.createElement("input");
      input.className = `${boxClassName}`;
      input.style.boxSizing = "border-box";

      if (textDesign) {
        const textDesignStyle = window.getComputedStyle(textDesign);
        if (textDesignStyle.fontSize)
          input.style.fontSize = textDesignStyle.fontSize;
        if (textDesignStyle.fontFamily)
          input.style.fontFamily = textDesignStyle.fontFamily;
        if (textDesignStyle.fontWeight)
          input.style.fontWeight = textDesignStyle.fontWeight;
        if (textDesignStyle.fontStyle)
          input.style.fontStyle = textDesignStyle.fontStyle;
        if (textDesignStyle.letterSpacing)
          input.style.letterSpacing = textDesignStyle.letterSpacing;
        if (textDesignStyle.whiteSpace)
          input.style.whiteSpace = textDesignStyle.whiteSpace;
        if (textDesignStyle.lineHeight)
          input.style.lineHeight = textDesignStyle.lineHeight;
        if (textDesignStyle.display)
          input.style.display = textDesignStyle.display;
        if (textDesignStyle.flexWrap)
          input.style.flexWrap = textDesignStyle.flexWrap;
        if (textDesignStyle.textAlign)
          input.style.textAlign = textDesignStyle.textAlign;
        if (textDesignStyle.textTransform)
          input.style.textTransform = textDesignStyle.textTransform;
        if (textDesignStyle.textDecoration)
          input.style.textDecoration = textDesignStyle.textDecoration;
        if (textDesignStyle.textShadow)
          input.style.textShadow = textDesignStyle.textShadow;
        if (textDesignStyle.justifyContent)
          input.style.justifyContent = textDesignStyle.justifyContent;
        if (textDesignStyle.alignItems)
          input.style.alignItems = textDesignStyle.alignItems;
        if (textDesignStyle.alignContent)
          input.style.alignContent = textDesignStyle.alignContent;
        if (textDesignStyle.color) input.style.color = textDesignStyle.color;
      }

      if (backgroundDesign) {
        const backgroundDesignStyle = window.getComputedStyle(backgroundDesign);
        if (backgroundDesignStyle.backgroundColor)
          input.style.backgroundColor = backgroundDesignStyle.backgroundColor;
        if (backgroundDesignStyle.borderColor)
          input.style.borderColor = backgroundDesignStyle.borderColor;
        if (backgroundDesignStyle.borderWidth)
          input.style.borderWidth = backgroundDesignStyle.borderWidth;
        if (backgroundDesignStyle.borderStyle)
          input.style.borderStyle = backgroundDesignStyle.borderStyle;
        if (backgroundDesignStyle.borderRadius)
          input.style.borderRadius = backgroundDesignStyle.borderRadius;
        if (backgroundDesignStyle.boxShadow)
          input.style.boxShadow = backgroundDesignStyle.boxShadow;
        if (backgroundDesignStyle.backgroundImage)
          input.style.backgroundImage = backgroundDesignStyle.backgroundImage;
        if (backgroundDesignStyle.backgroundSize)
          input.style.backgroundSize = backgroundDesignStyle.backgroundSize;
        if (backgroundDesignStyle.backgroundPosition)
          input.style.backgroundPosition =
            backgroundDesignStyle.backgroundPosition;
        if (backgroundDesignStyle.backgroundRepeat)
          input.style.backgroundRepeat = backgroundDesignStyle.backgroundRepeat;
        if (backgroundDesignStyle.backgroundClip)
          input.style.backgroundClip = backgroundDesignStyle.backgroundClip;
        if (backgroundDesignStyle.backgroundOrigin)
          input.style.backgroundOrigin = backgroundDesignStyle.backgroundOrigin;
        if (backgroundDesignStyle.backgroundAttachment)
          input.style.backgroundAttachment =
            backgroundDesignStyle.backgroundAttachment;
      }

      for (const propKey of Object.keys(inputProps)) {
        if (propKey.startsWith("on")) {
          input.addEventListener(
            propKey.replace("on", "").toLowerCase(),
            // @ts-ignore
            inputProps[propKey]
          );
        } else {
          // @ts-ignore
          input[propKey] = inputProps[propKey];
        }
      }

      boxDesign.replaceWith(input);
    }
  }, [ref, boxName, textName, backgroundName, inputProps, selector]);
  return <></>;
};

export interface IPortalProps extends HTMLAttributes<HTMLElement> {
  name?: string;
  children?: ReactNode;
}

export const Portal = (props: IPortalProps) => {
  const { children, name, ...portalContainerProps } = props;
  const ref = useContainerContext();
  const { selector } = useFlexy(ref);

  const [portal, setPortal] = useState<HTMLElement | null>(null);

  const ActualPortal = () => {
    return <>{ReactDOM.createPortal(children, portal!)}</>;
  };

  useEffect(() => {
    if (!ref?.current) return;
    const portalElement = document.createElement("div") as HTMLElement &
      Record<string, any>;

    for (const propKey of Object.keys(portalContainerProps)) {
      const vanilaPropKey = propKey.replace("className", "class");
      if (propKey.startsWith("on")) {
        portalElement.addEventListener(
          vanilaPropKey.replace("on", "").toLowerCase(),
          (portalContainerProps as any)[propKey]
        );
      } else {
        portalElement.setAttribute(
          vanilaPropKey,
          (portalContainerProps as any)[propKey]
        );
      }
    }

    if (name) {
      const element = selector(`[data-name="${name}"]`);
      if (element) {
        element.appendChild(portalElement);
      }
    } else {
      if (ref.current) {
        ref.current.appendChild(portalElement);
      }
    }

    setPortal(portalElement);

    return () => {
      if (name) {
        const element = selector(`[data-name="${name}"]`);
        if (element) element.removeChild(portalElement);
      } else {
        ref.current?.removeChild(portalElement);
      }
      setPortal(null);
    };
  }, [children, name, ref]);

  return <>{portal && <ActualPortal />}</>;
};

export interface IFloatingProps {
  name: string;
  position: "bottom";
  children?: ReactNode;
}

export const Floating = (props: IFloatingProps) => {
  const ref = useContainerContext();
  const { selector } = useFlexy(ref);
  const uniqueClassName = useUniqueClassName();
  const [isFloating, setIsFloating] = useState(false);

  const update = () => {
    if (!ref?.current) return;
    const container = ref.current.querySelector(
      "[flexy-container]"
    ) as HTMLElement;

    const fitHeightVw = round(
      (container.clientHeight / container.clientWidth) * 100,
      4
    );
    const deviceResolution = {
      widthPx: window.innerWidth,
      heightPx: window.innerHeight,
    };
    const currentHeightPx = deviceResolution.widthPx * (fitHeightVw / 100);
    const fitScale = deviceResolution.heightPx / currentHeightPx;

    setIsFloating(fitScale >= 1);
  };

  useEffect(() => {
    if (!ref?.current) return;

    const element = selector(`[data-name="${props.name}"]`);
    if (element) element.classList.add(uniqueClassName);

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref, selector]);

  return (
    <>
      {props.children}
      <style>
        {isFloating &&
          props.position === "bottom" &&
          `.${uniqueClassName} {
          position: fixed;
          bottom: 0;
          top: initial;
        }`}
      </style>
    </>
  );
};

export interface IDeletionProps {
  name: string;
}

export const Deletion = (props: IDeletionProps) => {
  const ref = useContainerContext();
  const { selector } = useFlexy(ref);

  useEffect(() => {
    if (!ref?.current) return;
    const element = selector(`[data-name="${props.name}"]`);
    if (element) element.remove();
  }, [ref, selector]);

  return <></>;
};

export interface IFullsizeProps {
  name: string;
  children?: ReactNode;
}

export const Fullsize = (props: IFullsizeProps) => {
  const ref = useContainerContext();
  const { selector } = useFlexy(ref);
  const [styles, setStyles] = useState(``);
  const uniqueClassName = useUniqueClassName();

  const update = () => {
    if (!ref?.current) return;

    const container = ref.current.querySelector(
      "[flexy-container]"
    ) as HTMLElement;

    const fitHeightVw = round(
      (container.clientHeight / container.clientWidth) * 100,
      4
    );

    const element = selector(`[data-name="${props.name}"]`);
    if (!element) return;

    const deviceResolution = {
      widthPx: window.innerWidth,
      heightPx: window.innerHeight,
    };
    const currentHeightPx = deviceResolution.widthPx * (fitHeightVw / 100);
    const currentWidthPx = deviceResolution.heightPx / (fitHeightVw / 100);
    const fitScale = deviceResolution.heightPx / currentHeightPx;

    if (element) {
      const updatedWidthPx = window.innerWidth * (1 / fitScale);
      if (fitScale < 1) {
        setStyles(`
        width: ${updatedWidthPx}px;
        margin-left: ${
          ((updatedWidthPx - currentWidthPx * (1 / fitScale)) / 2) * -1
        }px;
        left: initial;
        top: initial;
      `);
      } else {
        setStyles(`
        height: ${window.innerHeight}px;
        left: initial;
        top: initial;
      `);
      }
    }
  };

  useEffect(() => {
    if (!ref?.current) return;

    const element = selector(`[data-name="${props.name}"]`);
    if (!element) return;
    element.classList.add(uniqueClassName);

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref, selector]);

  return (
    <>
      {props.children}
      <style>
        {`.${uniqueClassName} {
            ${styles}
        }`}
      </style>
    </>
  );
};
