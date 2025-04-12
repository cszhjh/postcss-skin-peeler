export type PluginOptions = {
  imgSrc?: string
  skinSrc?: string
  prefixSelector?: string | ((selector: string) => string)
  mode?: ModeType
}

export type ModeType = 'generate' | 'replace'

export type TransformOptions = Required<
  Omit<PluginOptions, 'prefixSelector'> & {
    prefixSelector?: Extract<PluginOptions['prefixSelector'], (selector: string) => string>
  }
>
