import { existsSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { Declaration, type Helpers, type Plugin, type PluginCreator, type Rule } from 'postcss'
import { type PluginOptions, type TransformOptions } from './types'
import { declarationKeys, getBackgroundUrlValue, isRule, normalizePrefixSelector } from './utils'

function transform(
  decl: Declaration,
  _: Helpers,
  options: TransformOptions,
  ruleCache: Record<string, Map<string, Rule> | undefined>,
) {
  const rule = decl.parent

  if (!isRule(rule)) {
    return
  }

  const { source, selector } = rule
  const { imgSrc, skinSrc, prefixSelector } = options
  const styleFilePath = source?.input.file

  if (!styleFilePath) {
    return
  }

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

  if (cacheSkinRule) {
    cacheSkinRule.walkDecls('background-image', (decl) => {
      decl.value = `url("${skinRelativeFilePath}")`
    })
    return cacheSkinRule
  }

  const skinDecl = new Declaration({
    prop: 'background-image',
    value: `url("${skinRelativeFilePath}")`,
  })

  const skinRule = rule.cloneAfter({
    selector: skinSelector,
    nodes: [skinDecl],
  })
  ;(ruleCache[styleFilePath] ??= new Map()).set(skinSelector, skinRule)
  return skinRule
}

export const creator: PluginCreator<PluginOptions> = ({
  imgSrc = './src/images',
  skinSrc = './src/skin',
  prefixSelector = '.skin-peeler',
} = {}): Plugin => {
  const options = {
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
