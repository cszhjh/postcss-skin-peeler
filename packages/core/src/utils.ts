import { resolve } from 'path'
import { Declaration, type ChildNode, type Rule } from 'postcss'
import { TransformOptions, type PluginOptions } from './types'

const isProduction = process.env.NODE_ENV === 'production'
const htmlBodyRegex = /^((?:body|html)(?:[.#[][\w-]+)*(?:\s+body(?:[.#[][\w-]+)*)?)(.*)$/
const backgroundImageRegex = /url\((['"]?)(?!https?:\/\/)([^'")]+)\1\)/

export const declarationKeys = ['background', 'background-image']

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

export function slash(path: string) {
  const isExtendedLengthPath = path.startsWith('\\\\?\\')

  if (isExtendedLengthPath) {
    return path
  }

  return path.replace(/\\/g, '/')
}

export function injectDevComment(value: string, mode: TransformOptions['mode'] | 'generate_rewrite'): string {
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

export function generateRule(rule: Rule, selector: string, path: string) {
  const skinDecl = new Declaration({
    prop: 'background-image',
    value: injectDevComment(`url("${path}")`, 'generate'),
  })

  const skinRule = rule.cloneAfter({
    selector,
    nodes: [skinDecl],
  })

  return skinRule
}

export function normalizeOptions(options: PluginOptions | PluginOptions[] | undefined): TransformOptions[] {
  const _opts: PluginOptions[] | undefined = options && isArray(options) ? options : [options!]

  return (
    _opts?.map(
      ({ mode = 'generate', imgSrc = './src/images', skinSrc = './src/skin', prefixSelector = '.skin-peeler' }) => ({
        mode,
        imgSrc: resolve(imgSrc),
        skinSrc: resolve(skinSrc),
        prefixSelector: normalizePrefixSelector(prefixSelector),
      }),
    ) ?? []
  )
}

export function normalizePath(path: string) {
  return slash(path)
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
