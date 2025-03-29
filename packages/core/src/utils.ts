import type { ChildNode, Rule, Declaration } from 'postcss'
import type { PluginOptions } from './types'

const htmlBodyRegex = /^(body|html(\s+body)?)\b/;
const backgroundImageRegex = /url\((['"]?)(?!https?:\/\/)([^'"\)]+)\1\)/;

export const declarationKeys = ['background', 'background-image']

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}

export function isRule(node: Declaration['parent']): node is Rule {
  return node !== undefined && node.type === 'rule';
}

export function isDeclaration(node: ChildNode): node is Declaration {
  return node.type === 'decl'
}

export function getBackgroundUrlValue(decl: Declaration): string {
  if (decl.type !== 'decl' || !declarationKeys.includes(decl.prop)) {
    return ''
  }
  return backgroundImageRegex.exec(decl.value)?.[2] ?? ''
}

export function normalizePrefixSelector(prefixSelector: PluginOptions['prefixSelector']) {
  if (isFunction(prefixSelector)) {
    return prefixSelector;
  }

  return (selector: string): string => {
    if (!htmlBodyRegex.test(selector)) {
      return `${prefixSelector} ${selector}`
    }

    return selector.replace(htmlBodyRegex, (match) => `${match} ${prefixSelector}`)
  };
};
