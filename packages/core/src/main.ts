import { existsSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { Declaration, type Helpers, type Plugin, type PluginCreator, type Rule } from 'postcss'
import { type PluginOptions, type TransformOptions } from './types'
import {
  declarationKeys,
  generateRule,
  getBackgroundUrlValue,
  isRule,
  normalizePrefixSelector,
  replaceBackgroundUrlValue,
} from './utils'

function transform(
  decl: Declaration,
  _: Helpers,
  options: TransformOptions,
  ruleCache: Record<string, Map<string, Rule> | undefined>,
) {
  const rule = decl.parent

  if (!isRule(rule) || !rule.source?.input.file) {
    return
  }

  const { source, selector } = rule
  const { mode, imgSrc, skinSrc, prefixSelector } = options
  const styleFilePath = source.input.file!

  const styleDirname = dirname(styleFilePath)
  const originalUrl = getBackgroundUrlValue(decl)
  const originalFilePath = resolve(styleDirname, originalUrl)
  const suffixPath = relative(imgSrc, originalFilePath)
  const skinFilePath = join(skinSrc, suffixPath)
  const skinRelativeFilePath = relative(styleDirname, skinFilePath)

  if (!originalUrl || !originalFilePath.startsWith(imgSrc) || !existsSync(skinFilePath)) {
    return
  }

  const skinSelector = prefixSelector(selector)
  const cacheSkinRule = ruleCache[styleFilePath]?.get(skinSelector)

  if (cacheSkinRule || mode === 'replace') {
    const innerRule = cacheSkinRule ?? rule

    innerRule.walkDecls(/^background/, (decl) => {
      decl.value = replaceBackgroundUrlValue(decl.value, skinRelativeFilePath)
    })

    return innerRule
  }

  const skinRule = generateRule(rule, skinSelector, skinRelativeFilePath)
  ;(ruleCache[styleFilePath] ??= new Map()).set(skinSelector, skinRule)
  return skinRule
}

export const creator: PluginCreator<PluginOptions> = ({
  mode = 'generate',
  imgSrc = './src/images',
  skinSrc = './src/skin',
  prefixSelector = '.skin-peeler',
} = {}): Plugin => {
  const options = {
    mode,
    imgSrc: resolve(imgSrc),
    skinSrc: resolve(skinSrc),
    prefixSelector: normalizePrefixSelector(prefixSelector),
  }
  const ruleCache: Record<string, Map<string, Rule> | undefined> = {}

  return {
    postcssPlugin: 'postcss-skin-peeler',
    Declaration: {
      ...Object.fromEntries(
        declarationKeys.map((prop) => [
          prop,
          (decl, helper) => {
            transform(decl, helper, options, ruleCache)
          },
        ]),
      ),
    },
  }
}

creator.postcss = true

export default creator
