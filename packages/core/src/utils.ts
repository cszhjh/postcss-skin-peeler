import { Declaration, type ChildNode, type Rule } from 'postcss'
import slash from 'slash'
import { type PluginOptions } from './types'

const htmlBodyRegex = /^((?:body|html)(?:[.#[][\w-]+)*(?:\s+body(?:[.#[][\w-]+)*)?)(.*)$/
const backgroundImageRegex = /url\((['"]?)(?!https?:\/\/)([^'")]+)\1\)/

export const declarationKeys = ['background', 'background-image']

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}

export function isRule(node: Declaration['parent']): node is Rule {
  return node !== undefined && node.type === 'rule'
}

export function isDeclaration(node: ChildNode): node is Declaration {
  return node.type === 'decl'
}

export function normalizePath(path: string) {
  return slash(path)
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
    value: `url("${path}")`,
  })

  const skinRule = rule.cloneAfter({
    selector,
    nodes: [skinDecl],
  })

  return skinRule
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
