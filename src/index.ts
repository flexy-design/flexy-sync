export {}

import axios from 'axios'
import chalk from 'chalk'
import path from 'path'
import { nanoid } from 'nanoid'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { getSVGCache, setSVGCache } from './utils/cache'
import * as FigmaAPI from 'figma-api'
import { convertSVGToUniqueId } from './utils/svg'
import fetch from 'isomorphic-unfetch'

void (async () => {
  const flexyConfigPath = path.resolve(process.cwd(), 'flexy.config.json')
  const flexySecretPath = path.resolve(process.cwd(), 'flexy.secret.json')

  if (!existsSync(flexyConfigPath)) {
    console.log(chalk.red(`Flexy config file not found at ${flexyConfigPath}`))
    return
  }
  if (!existsSync(flexySecretPath)) {
    console.log(chalk.red(`Flexy secret file not found at ${flexySecretPath}`))
    return
  }

  const flexyConfig = require(flexyConfigPath)
  const { personalAccessToken, betaTesterToken } = require(flexySecretPath)

  const publicFolderPath = path.resolve(process.cwd(), flexyConfig.publicPath)
  try {
    mkdirSync(publicFolderPath, { recursive: true })
  } catch (e) {}

  console.log(
    chalk.blueBright(`    ________    _______  ____  __
   / ____/ /   / ____/ |/ /\\ \/  \/
  / /_  / /   / __/  |   /  \\  /
 / __/ / /___/ /___ /   |   / /
/_/   /_____/_____//_/|_|  /_/`)
  )

  const moduleJsonPath = path.resolve(__dirname, '../package.json')
  const packageJson = JSON.parse(String(readFileSync(moduleJsonPath)))

  console.log(
    chalk.blueBright(`\nWelcome to Flexy CLI! (${packageJson.version})`)
  )

  for (const componentName of Object.keys(flexyConfig.components)) {
    console.log(
      chalk.blueBright(
        `\n[Flexy] [${componentName}.tsx] Synchronization in progress...`
      )
    )
    const [fileIdAlias, pageName, frameName] =
      flexyConfig.components[componentName]

    const fileId = flexyConfig.figmaUrls[fileIdAlias].replace(
      /^https:\/\/www\.figma\.com\/file\/(.*)\/(.*)$/,
      '$1'
    )

    try {
      // Request the transformed html and file urls
      const { data, status } = await axios.post<
        Record<string, any> & {
          message: string
          time: number
          success: boolean
        }
      >('https://api.flexy.design/v1/sync', {
        personalAccessToken,
        fileId,
        pageName,
        frameName,
        inlineSvg: flexyConfig.inlineSvg,
        workUuid: nanoid(),
        target: flexyConfig.target ?? 'react',
        betaTesterKey: betaTesterToken ?? 'public'
      })

      if (data.success)
        console.log(
          chalk.blueBright(
            `[Flexy] [${componentName}.tsx] Transpile finished in ${Math.floor(
              data.time
            )}ms.`
          )
        )

      if (!data.success) {
        console.log(
          chalk.redBright(
            `[Flexy] [${componentName}.tsx] Error: ${data.message}`
          )
        )
        continue
      }

      if (flexyConfig.inlineSvg !== true) {
        const svgs = Object.entries(data.files).filter(([key]) =>
          key.endsWith('.svg')
        ) as any
        // Purify the svg
        let convertedSVGCount = 0
        for (const [filePath, value] of svgs) {
          convertedSVGCount += 1
          const svgFilePath = path.resolve(publicFolderPath, filePath)
          const svgId = value.content
          // if (existsSync(svgFilePath)) continue

          const cache = await getSVGCache({
            fileId,
            nodeId: svgId
          })

          try {
            if (cache === null) {
              const api = new FigmaAPI.Api({
                personalAccessToken
              })
              const response = await api.getImage(fileId, {
                format: 'svg',
                ids: svgId,
                scale: 1
              })

              const svgUrl = response.images[svgId]
              if (!svgUrl) throw new Error('No svg url')

              let svgHTML = await fetch(svgUrl).then((res: any) => res.text())
              if (!svgHTML) throw new Error('No svg response')

              svgHTML = convertSVGToUniqueId(svgHTML)
              writeFileSync(svgFilePath, svgHTML)

              console.log(
                chalk.blueBright(
                  `[Flexy] [${componentName}.tsx] Converted SVG of ${filePath}... (${convertedSVGCount}/${svgs.length})`
                )
              )
              // doesn't need to wait
              setSVGCache({
                fileId,
                nodeId: svgId,
                code: svgHTML
              })
            } else {
              if (typeof cache === 'string' && cache.length === 0) {
                console.log(
                  chalk.yellowBright(
                    `[Flexy] [${componentName}.tsx] Cannot convert hidden SVG elements of ${filePath}... (${convertedSVGCount}/${svgs.length})`
                  )
                )
              } else {
                if (typeof cache === 'string') {
                  console.log(
                    chalk.blueBright(
                      `[Flexy] [${componentName}.tsx] Converted SVG of ${filePath}... (${convertedSVGCount}/${svgs.length})`
                    )
                  )
                  writeFileSync(svgFilePath, cache)
                }
              }
            }
          } catch (e) {
            // doesn't need to wait
            setSVGCache({
              fileId,
              nodeId: svgId,
              code: ''
            })
            console.log(
              chalk.yellowBright(
                `[Flexy] [${componentName}.tsx] Cannot convert hidden SVG elements of ${filePath}... (${convertedSVGCount}/${svgs.length})`
              )
            )
          }
        }
      }

      let convertedImageCount = 0
      const images = Object.entries(data.files).filter(
        ([key, file]) => !key.endsWith('.svg') && (file as any).isBinary
      )
      for (const [filePath, value] of images) {
        convertedImageCount += 1
        console.log(
          chalk.blueBright(
            `[Flexy] [${componentName}.tsx] Convert Image of ${filePath}... (${convertedImageCount}/${images.length})`
          )
        )
        const url = (value as any).content
        const imagePath = path.resolve(publicFolderPath, filePath)
        if (existsSync(imagePath)) continue

        try {
          await axios({
            method: 'get',
            url,
            responseType: 'arraybuffer'
          })
            .then((response) => {
              writeFileSync(imagePath, response.data)
            })
            .catch((e) => {
              console.log(
                chalk.yellowBright(
                  `[Flexy] [${componentName}.tsx] Warning: Failed Image Download of ${filePath}... (${convertedImageCount}/${images.length})`
                )
              )
            })
        } catch (e) {
          console.log(
            chalk.yellowBright(
              `[Flexy] [${componentName}.tsx] Warning: Failed Image Download of ${filePath}... (${convertedImageCount}/${images.length})`
            )
          )
        }
      }

      const uiComponentFolderPath = flexyConfig.rawComponentPath
        ? path.resolve(process.cwd(), flexyConfig.rawComponentPath)
        : path.resolve(process.cwd(), 'components', 'flexy')

      const uxComponentFolderPath = flexyConfig.componentsPath
        ? path.resolve(process.cwd(), flexyConfig.componentsPath)
        : path.resolve(process.cwd(), 'components')

      try {
        mkdirSync(uiComponentFolderPath, { recursive: true })
      } catch (e) {}

      try {
        mkdirSync(uxComponentFolderPath, { recursive: true })
      } catch (e) {}

      const uiComponentPath = path.resolve(
        uiComponentFolderPath,
        `${componentName}.tsx`
      )
      writeFileSync(uiComponentPath, data?.files?.['index.tsx']?.content)

      const uxComponentPath = path.resolve(
        uxComponentFolderPath,
        `${componentName}UX.tsx`
      )

      const relativeComponentPath = path.relative(
        uxComponentFolderPath,
        uiComponentFolderPath
      )

      if (!existsSync(uxComponentPath))
        writeFileSync(
          uxComponentPath,
          `import * as Flexy from "@flexy-design/react";
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
`
        )

      console.log(
        chalk.greenBright(
          `[Flexy] [${componentName}.tsx] Sync is completed. ${uxComponentPath}`
        )
      )
    } catch (e) {
      console.error(e)
    }
  }
})()
