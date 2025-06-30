export type PluginOptions = {
  mode?: ModeType
  imgSrc?: string
  skinSrc?: string
  prefixSelector?: string | ((selector: string) => string)
}

export type ModeType = 'generate' | 'replace'

export type TransformOptions = Required<
  Omit<PluginOptions, 'prefixSelector'> & {
    prefixSelector?: Extract<PluginOptions['prefixSelector'], (selector: string) => string>
  }
>
