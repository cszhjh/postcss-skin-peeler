import { resolve } from 'path'
import { imageSizeFromFile } from 'image-size/fromFile'
import { Declaration, DeclarationProps, type ChildNode, type Rule } from 'postcss'
import { CoverSize, CoverSizeFunc, NormalizeOptions, type PluginOptions } from './types'

const isProduction = process.env.NODE_ENV === 'production'
const htmlBodyRegex = /^((?:body|html)(?:[.#[][\w-]+)*(?:\s+body(?:[.#[][\w-]+)*)?)(.*)$/
const backgroundImageRegex = /url\((['"]?)(?!https?:\/\/)([^'")]+)\1\)/

export const declarationKeys = ['background', 'background-image']

export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean'
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}

export function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val)
}

export function isRule(node: Declaration['parent']): node is Rule {
  return node !== undefined && node.type === 'rule'
}

export function isDeclaration(node: ChildNode): node is Declaration {
  return node.type === 'decl'
}

export function slash(path: string): string {
  return path.replaceAll('\\', '/')
}

export function injectDevComment(value: string, mode: NormalizeOptions['mode'] | 'generate_rewrite'): string {
  if (isProduction) {
    return value
  }
  return `/* __DEV_${mode.toUpperCase()}__ */ ${value}`
}

export function getBackgroundUrlValue(decl: Declaration): string {
  if (decl.type !== 'decl' || !declarationKeys.includes(decl.prop)) {
    return ''
  }
  return backgroundImageRegex.exec(decl.value)?.[2] ?? ''
}

export function replaceBackgroundUrlValue(source: string, path: string): string {
  return source.replace(backgroundImageRegex, `url("${path}")`)
}

export function generateRule(rule: Rule, selector: string, declarations: DeclarationProps[]) {
  const skinRule = rule.cloneAfter({
    selector,
    nodes: declarations.map((decl) => new Declaration(decl)),
  })

  return skinRule
}

export function getImageSize(filePath: string) {
  return imageSizeFromFile(filePath)
}

export function normalizeOptions(options: PluginOptions | PluginOptions[] | undefined): NormalizeOptions[] {
  const _opts: PluginOptions[] | undefined = options && isArray(options) ? options : [options!]

  return (
    _opts?.map(
      ({
        mode = 'generate',
        imgSrc = './src/images',
        skinSrc = './src/skin',
        coverSize = false,
        prefixSelector = '.skin-peeler',
      }) => ({
        mode,
        imgSrc: resolve(imgSrc),
        skinSrc: resolve(skinSrc),
        coverSize: normalizeCoverSize(coverSize),
        prefixSelector: normalizePrefixSelector(prefixSelector),
      }),
    ) ?? []
  )
}

export function normalizePath(path: string) {
  return slash(path)
}

export function normalizeCoverSize(coverSize: CoverSize) {
  const _coverSize = isFunction(coverSize) ? coverSize : () => coverSize

  return (info: Parameters<CoverSizeFunc>[0]) => {
    const { width, height } = info
    const value = _coverSize(info)

    return isBoolean(value)
      ? value && {
          width: `${width}px`,
          height: `${height}px`,
        }
      : value
  }
}

export function normalizePrefixSelector(prefixSelector: PluginOptions['prefixSelector']) {
  if (isFunction(prefixSelector)) {
    return prefixSelector
  }

  return (selector: string): string => {
    selector = selector.trim()
    const selectors = selector.split(',')

    if (selectors.length > 1) {
      return selectors.map((selector) => normalizePrefixSelector(prefixSelector)(selector)).join(',')
    }

    if (!htmlBodyRegex.test(selector)) {
      return `${prefixSelector} ${selector}`
    }

    return selector.replace(htmlBodyRegex, (_, prefix, rest) => `${prefix} ${prefixSelector}${rest}`)
  }
}
