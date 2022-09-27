import {
  createContext,
  useRef,
  useEffect,
  useState,
  useContext,
  DetailedHTMLProps,
  HTMLAttributes
} from 'react'

import type { ReactNode, RefObject } from 'react'
import {
  useAdjustInlineSvgSize,
  useAdjustTextSize,
  useAutoBackground,
  useFitRatioByHeight,
  useUniqueClassName
} from '../utils/useFlexy'
// @ts-ignore
import autoAnimate from '@formkit/auto-animate'
import { CommonProvider } from './CommonContext'

type RefType = HTMLDivElement | null
type ProviderType = RefObject<HTMLElement> | null

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }
}

interface IContextProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: ReactNode
  fit?: 'width' | 'height'
  adjustTextSize?: boolean
  adjustInlineSvgSize?: boolean
  backgroundColor?: 'auto' | string
  borderColor?: string
  animate?: boolean
  overflow?: 'auto' | 'hidden' | 'scroll' | 'visible' | 'initial'
}

const ContainerContext = createContext<ProviderType>(null)

const ContainerProvider = (props: IContextProps) => {
  const {
    children,
    className,
    fit,
    adjustTextSize,
    adjustInlineSvgSize,
    style,
    backgroundColor,
    borderColor,
    animate,
    overflow,
    ...containerProps
  } = props
  const ref = useRef<RefType>(null)
  const [providerValue, setProviderValue] = useState<ProviderType>(null)
  const [fitScale, setFitScale] = useState(null as string | null)
  const [fitBackgroundColor, setFitBackgroundColor] = useState(
    null as string | null
  )

  const uniqueClassName = useUniqueClassName()
  console.log('fitScale', fitScale, uniqueClassName)

  useEffect(() => {
    if (ref) setProviderValue(ref)
  }, [ref])

  useAdjustTextSize(ref, adjustTextSize)
  useAdjustInlineSvgSize(ref, adjustInlineSvgSize)
  useFitRatioByHeight({
    ref,
    fit,
    setFitScale
  })

  useAutoBackground({
    ref,
    setFitBackgroundColor
  })
  useEffect(() => {
    if (animate !== false && ref.current && typeof window !== 'undefined') {
      const container = ref.current.querySelector(
        '[flexy-container]'
      ) as HTMLElement

      container &&
        autoAnimate(container, {
          disrespectUserMotionPreference: window.matchMedia(
            '(prefers-reduced-motion: reduce)'
          ).matches,
          duration: 500
        })
    }
  }, [ref, animate])

  return (
    <>
      <ContainerContext.Provider value={providerValue}>
        <div
          ref={ref}
          {...containerProps}
          className={`${className ? `${className} ` : ''}${uniqueClassName}`}
          style={{
            ...style
          }}
        >
          <CommonProvider value={{ ref }}>{children}</CommonProvider>
        </div>
      </ContainerContext.Provider>

      <style jsx global={true}>
        {`
          ${(typeof backgroundColor === 'string' &&
            fitBackgroundColor !== null &&
            `
            body {
              background-color: ${
                backgroundColor === 'auto'
                  ? fitBackgroundColor
                  : backgroundColor
              };
            }
          `) ??
          ``}
          ${(overflow &&
            `[flexy-container] {
            overflow: ${overflow};
          }`) ??
          ``}
          ${(fitScale !== null &&
            `.${uniqueClassName} {
            transform: scale(${fitScale});
          }`) ??
          ``}
          ${(borderColor &&
            `.${uniqueClassName} > [flexy-container] {
            border-left: 1px solid ${borderColor};
            border-right: 1px solid ${borderColor};
          }`) ??
          ``}
          [flexy-list],
          [flexy-container] {
            user-select: none;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          [flexy-list]::-webkit-scrollbar,
          [flexy-container]::-webkit-scrollbar {
            display: none;
            width: 0;
          }
          [flexy-list]::-webkit-scrollbar-button,
          [flexy-container]::-webkit-scrollbar-button {
            display: none;
          }
        `}
      </style>
    </>
  )
}

const useContainerContext = () => {
  const containerContext = useContext(ContainerContext)
  return containerContext
}

export { ContainerContext, ContainerProvider, useContainerContext }
