import { Rule, type Plugin, type PluginCreator } from 'postcss'
import { transform } from './transform'
import { type PluginOptions } from './types'
import { declarationKeys, normalizeOptions } from './utils'

export const creator: PluginCreator<PluginOptions | PluginOptions[]> = (options): Plugin => {
  const ruleCache: Record<string, Map<string, Rule> | undefined> = {}

  return {
    postcssPlugin: 'postcss-skin-peeler',
    Declaration: {
      ...Object.fromEntries(
        declarationKeys.map((prop) => [
          prop,
          (decl) => {
            transform(decl, normalizeOptions(options), ruleCache)
          },
        ]),
      ),
    },
  }
}

creator.postcss = true

export default creator
