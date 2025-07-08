import { Rule, type Plugin, type PluginCreator } from 'postcss'
import { transform } from './transform'
import { type PluginOptions } from './types'
import { declarationKeys, normalizeOptions } from './utils'

export const creator: PluginCreator<PluginOptions | PluginOptions[]> = (options): Plugin => {
  const ruleCache: Record<string, Map<string, Rule> | undefined> = {}
  const imageSizeCache: Map<string, { width: number; height: number }> = new Map()

  return {
    postcssPlugin: 'postcss-skin-peeler',
    Declaration: {
      ...Object.fromEntries(
        declarationKeys.map((prop) => [
          prop,
          async (decl) => {
            await transform({
              decl,
              options: normalizeOptions(options),
              ruleCache,
              imageSizeCache,
              rawOptions: options,
            })
          },
        ]),
      ),
    },
  }
}

creator.postcss = true

export default creator
