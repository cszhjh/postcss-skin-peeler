import { existsSync } from 'fs'
import { dirname, join, relative, resolve } from 'path'
import { Declaration, DeclarationProps, Rule } from 'postcss'
import { ImageSize, TransformOptions } from './types'
import {
  generateRule,
  getBackgroundUrlValue,
  getImageSize,
  injectDevComment,
  isArray,
  isRule,
  replaceBackgroundUrlValue,
} from './utils'

export async function transform({ decl, options, ruleCache, imageSizeCache, rawOptions }: TransformOptions) {
  const rule = decl.parent
  const originalUrl = getBackgroundUrlValue(decl)

  if (!originalUrl || !isRule(rule) || !rule.source?.input.file) {
    return
  }

  const { source, selector } = rule
  const styleFilePath = source.input.file!
  const styleDirname = dirname(styleFilePath)
  const originalFilePath = resolve(styleDirname, originalUrl)

  for (let i = 0; i < options.length; i++) {
    const { mode, imgSrc, skinSrc, coverSize, prefixSelector } = options[i]
    const isReplace = mode === 'replace'
    const suffixPath = relative(imgSrc, originalFilePath)
    const skinFilePath = join(skinSrc, suffixPath)
    const skinRelativeFilePath = relative(styleDirname, skinFilePath)

    if (!originalFilePath.startsWith(imgSrc) || !existsSync(skinFilePath)) {
      continue
    }

    const rawOption = isArray(rawOptions) ? rawOptions[i] : rawOptions

    if (rawOption?.coverSize && !imageSizeCache.has(skinFilePath)) {
      const { width, height } = await getImageSize(skinFilePath)
      imageSizeCache.set(skinFilePath, { width, height })
    }

    const skinSelector = prefixSelector(selector)
    const cacheSkinRule = ruleCache[styleFilePath]?.get(skinSelector)
    const imageSize = imageSizeCache.get(skinFilePath)!
    const size = coverSize({ filePath: skinFilePath, ...imageSize })

    if (isReplace || cacheSkinRule) {
      replace({
        rule: isReplace ? rule : cacheSkinRule!,
        path: skinRelativeFilePath,
        size,
        modeString: isReplace ? 'replace' : 'generate_rewrite',
      })
    } else {
      generate({
        rule,
        from: styleFilePath,
        selector: skinSelector,
        size,
        path: skinRelativeFilePath,
        ruleCache,
      })
    }
  }
}

function replace({
  rule,
  path,
  size,
  modeString,
}: {
  rule: Rule
  path: string
  size: false | ImageSize
  modeString: Parameters<typeof injectDevComment>[1]
}) {
  const { width, height } = size || {}
  let hasWidth = false
  let hasHeight = false
  let hasBgSize = false

  rule.walkDecls(/^(background|width|height)/, (decl) => {
    if (['width', 'height'].includes(decl.prop)) {
      const _size = size && size[decl.prop as keyof typeof size]
      if (_size) {
        decl.value = injectDevComment(_size, modeString)
      }

      hasWidth = hasWidth || decl.prop === 'width'
      hasHeight = hasHeight || decl.prop === 'height'
      return
    }

    if (decl.prop === 'background-size' && width && height) {
      decl.value = injectDevComment(`${width} ${height}`, modeString)
      hasBgSize = true
      return
    }

    decl.value = injectDevComment(replaceBackgroundUrlValue(decl.value, path), modeString)
  })

  if (size) {
    const decls = [
      !hasWidth && width ? new Declaration({ prop: 'width', value: injectDevComment(width, modeString) }) : null,
      !hasHeight && height ? new Declaration({ prop: 'height', value: injectDevComment(height, modeString) }) : null,
      !hasBgSize && width && height
        ? new Declaration({ prop: 'background-size', value: injectDevComment(`${width} ${height}`, modeString) })
        : null,
    ].filter(Boolean) as Declaration[]

    rule.append(decls)
  }
}

function generate({
  rule,
  from,
  selector,
  size,
  path,
  ruleCache,
}: {
  rule: Rule
  from: string
  selector: string
  size: false | ImageSize
  path: string
  ruleCache: Record<string, Map<string, Rule> | undefined>
}) {
  const { width, height } = size || {}

  const skinRule = generateRule(
    rule,
    selector,
    (
      [
        {
          prop: 'background-image',
          value: injectDevComment(replaceBackgroundUrlValue('url(./)', path), 'generate'),
        },
        width ? { prop: 'width', value: injectDevComment(width, 'generate') } : null,
        height ? { prop: 'height', value: injectDevComment(height, 'generate') } : null,
        width && height ? { prop: 'background-size', value: injectDevComment(`${width} ${height}`, 'generate') } : null,
      ] as DeclarationProps[]
    ).filter(Boolean),
  )

  ;(ruleCache[from] ??= new Map()).set(selector, skinRule)
}
