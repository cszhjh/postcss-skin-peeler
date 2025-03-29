
import { type PluginCreator, type Plugin, type Rule, Declaration } from 'postcss';
import { type PluginOptions, type TransformOptions } from './types';

import { existsSync } from 'node:fs'
import { dirname, resolve, relative, join } from 'node:path';
import { declarationKeys, isRule, normalizePrefixSelector, getBackgroundUrlValue } from './utils'

const ruleCache = new Map<string, Rule>();

async function transform(decl: Declaration, options: TransformOptions) {
  const rule = decl.parent;

  if (!isRule(rule)) {
    return;
  }

  const { source, selector } = rule;
  const { imgSrc, skinSrc, prefixSelector } = options;
  const styleFilePath = source?.input.file;

  if (!styleFilePath) {
    return;
  }

  const styleDirname = dirname(styleFilePath);
  const originalUrl = getBackgroundUrlValue(decl)
  const originalFilePath = resolve(styleDirname, originalUrl);
  const suffixPath = relative(imgSrc, originalFilePath)
  const skinFilePath = join(skinSrc, suffixPath)
  const skinRelativeFilePath = relative(styleDirname, skinFilePath)

  if (!originalUrl || !originalFilePath.startsWith(imgSrc) || !existsSync(skinFilePath)) {
    return;
  }

  const skinSelector = prefixSelector(selector)
  const cacheSkinRule = ruleCache.get(skinSelector)


  if (cacheSkinRule) {
    cacheSkinRule.walkDecls('background-image', (decl) => {
      decl.value = `url("${skinRelativeFilePath}")`
    })
    return cacheSkinRule
  }

  const skinDecl = new Declaration({
    prop: 'background-image',
    value: `url("${skinRelativeFilePath}")`,
  });

  const skinRule =  rule.cloneAfter({
    selector: skinSelector,
    nodes: [skinDecl]
  })

  ruleCache.set(skinSelector, skinRule)
  return skinRule;
}

export const creator: PluginCreator<PluginOptions> = ({
  imgSrc = resolve(__dirname, './src/images'),
  skinSrc = resolve(__dirname, './src/skin'),
  prefixSelector = '.skin-peeler',
}: PluginOptions = {}): Plugin => {
  const options = {
    imgSrc,
    skinSrc,
    prefixSelector: normalizePrefixSelector(prefixSelector)
  }

  return {
    postcssPlugin: 'postcss-skin-peeler',
    Declaration: {
      ...Object.fromEntries(
        declarationKeys.map((prop) => [prop, async (decl) => { await transform(decl, options) }])
      )
    },
  }
};

creator.postcss = true;

export default creator;
