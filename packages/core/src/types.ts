import type { Declaration, Rule } from 'postcss'

export interface PluginOptions {
  mode?: ModeType
  imgSrc?: string
  skinSrc?: string
  coverSize?: CoverSize
  prefixSelector?: string | ((selector: string) => string)
}

export interface TransformOptions {
  decl: Declaration
  options: NormalizeOptions[]
  ruleCache: Record<string, Map<string, Rule> | undefined>
  imageSizeCache: Map<string, { width: number; height: number }>
  rawOptions?: PluginOptions | PluginOptions[]
}

export interface ImageSize {
  width: string
  height: string
}

export type ModeType = 'generate' | 'replace'

export type CoverSize = boolean | CoverSizeFunc

export type CoverSizeFunc<T extends boolean = boolean> = (info: {
  filePath: string
  width: number
  height: number
}) => ImageSize | T

export type NormalizeOptions<T extends PluginOptions = PluginOptions> = Required<
  Omit<T, 'coverSize' | 'prefixSelector'> & {
    coverSize?: CoverSizeFunc<false>
    prefixSelector?: Exclude<T['prefixSelector'], string>
  }
>
