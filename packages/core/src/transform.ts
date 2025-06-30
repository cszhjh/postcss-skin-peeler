import { existsSync } from 'fs'
import { dirname, join, relative, resolve } from 'path'
import { Declaration, Rule } from 'postcss'
import { TransformOptions } from './types'
import { generateRule, getBackgroundUrlValue, injectDevComment, isRule, replaceBackgroundUrlValue } from './utils'

export function transform(
  decl: Declaration,
  options: TransformOptions[],
  ruleCache: Record<string, Map<string, Rule> | undefined>,
) {
  const rule = decl.parent
  const originalUrl = getBackgroundUrlValue(decl)

  if (!originalUrl || !isRule(rule) || !rule.source?.input.file) {
    return
  }

  const { source, selector } = rule
  const styleFilePath = source.input.file!
  const styleDirname = dirname(styleFilePath)
  const originalFilePath = resolve(styleDirname, originalUrl)

  for (const option of options ?? []) {
    const { mode, imgSrc, skinSrc, prefixSelector } = option
    const suffixPath = relative(imgSrc, originalFilePath)
    const skinFilePath = join(skinSrc, suffixPath)
    const skinRelativeFilePath = relative(styleDirname, skinFilePath)

    if (!originalFilePath.startsWith(imgSrc) || !existsSync(skinFilePath)) {
      continue
    }

    if (mode === 'replace') {
      rule.walkDecls(/^background/, (decl) => {
        decl.value = injectDevComment(replaceBackgroundUrlValue(decl.value, skinRelativeFilePath), mode)
      })
      continue
    }

    const skinSelector = prefixSelector(selector)
    const cacheSkinRule = ruleCache[styleFilePath]?.get(skinSelector)
    if (cacheSkinRule) {
      cacheSkinRule.walkDecls(/^background/, (decl) => {
        decl.value = injectDevComment(replaceBackgroundUrlValue(decl.value, skinRelativeFilePath), 'generate_rewrite')
      })

      continue
    }

    const skinRule = generateRule(rule, skinSelector, skinRelativeFilePath)
    ;(ruleCache[styleFilePath] ??= new Map()).set(skinSelector, skinRule)
  }
}
