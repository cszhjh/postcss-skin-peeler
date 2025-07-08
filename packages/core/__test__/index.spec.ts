import { dirname, relative, resolve } from 'node:path'
import postcss from 'postcss'
import { describe, expect, it } from 'vitest'
import plugin from '../src/main'
import type { PluginOptions } from '../src/types'

const FROM = resolve('__test__/style/index.css')
const IMG_SRC = '__test__/images/origin'
const GENERATE_SKIN_IMG = '__test__/images/generate'
const REPLACE_SKIN_IMG = '__test__/images/replace'
const ORIGIN_IMG_ONE = resolve(IMG_SRC, './one.jpg')
const ORIGIN_IMG_TWO = resolve(IMG_SRC, './two.jpg')
const ORIGIN_IMG_ONE_RELATIVE = relative(dirname(FROM), ORIGIN_IMG_ONE)
const ORIGIN_IMG_TWO_RELATIVE = relative(dirname(FROM), ORIGIN_IMG_TWO)

const PLUGIN_OPTIONS: PluginOptions[] = [
  {
    mode: 'generate',
    imgSrc: IMG_SRC,
    skinSrc: GENERATE_SKIN_IMG,
    prefixSelector: '.skin',
    coverSize: true,
  },
  {
    mode: 'replace',
    imgSrc: IMG_SRC,
    skinSrc: REPLACE_SKIN_IMG,
    coverSize: true,
  },
]

async function run(css: string, options: PluginOptions | PluginOptions[] = PLUGIN_OPTIONS) {
  const { css: output } = await postcss([plugin(options)]).process(css, { from: FROM })
  return output
}

describe('test url quotation mark', () => {
  it('test url without quotes', async () => {
    const input = `
      .non-quotation {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input)
    expect(output).toMatchSnapshot()
  })

  it('test url with single quotes', async () => {
    const input = `
      .single-quote {
        background: url('${ORIGIN_IMG_ONE_RELATIVE}') no-repeat;
      }
    `
    const output = await run(input)
    expect(output).toMatchSnapshot()
  })

  it('test url with double quotes', async () => {
    const input = `
      .double-quote {
        background: url("${ORIGIN_IMG_ONE_RELATIVE}") no-repeat;
      }
    `
    const output = await run(input)
    expect(output).toMatchSnapshot()
  })
})

describe('test url with protocol', () => {
  it('test url with http', async () => {
    const input = `
      .http {
        background: url(http://varletjs.org/varlet_icon.png) no-repeat;
      }
    `
    const output = await run(input)
    expect(output).toBe(input)
  })

  it('test url with https', async () => {
    const input = `
      .http {
        background: url(https://varletjs.org/varlet_icon.png) no-repeat;
      }
    `
    const output = await run(input)
    expect(output).toBe(input)
  })
})

describe('test background stack', () => {
  it('test background is stacked in the single rule', async () => {
    const input = `
      .rule-single-stacked {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
        background-image: url(${ORIGIN_IMG_TWO_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input)
    expect(output).toMatchSnapshot()
  })

  it('test background is stacked in the multiple rule', async () => {
    const input = `
      .rule-multiple-stacked {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }

      .rule-multiple-stacked {
        background: url(${ORIGIN_IMG_TWO_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input)
    expect(output).toMatchSnapshot()
  })
})

describe('test html and body combination', () => {
  it('test html as prefix selector', async () => {
    const input = `
      html .html-prefix {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input)
    expect(output).toMatchSnapshot()
  })

  it('test body as prefix selector', async () => {
    const input = `
      body .body-prefix {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input)
    expect(output).toMatchSnapshot()
  })

  it('test html body as prefix selector', async () => {
    const input = `
      html body .html-body-prefix {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input)
    expect(output).toMatchSnapshot()
  })

  it('test html follow selector as prefix selector', async () => {
    const input = `
      html.follow .html-prefix {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input)
    expect(output).toMatchSnapshot()
  })

  it('test body follow selector as prefix selector', async () => {
    const input = `
      body.follow .body-prefix {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input)
    expect(output).toMatchSnapshot()
  })
})

describe('test rule in @media', () => {
  const input = `
    @media screen and (min-width: 1024px) {
      .media {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    }
  `
  it('test rule in @media', async () => {
    const output = await run(input)
    expect(output).toMatchSnapshot()
  })
})

describe('test cover size', () => {
  it('test default unit cover size', async () => {
    const input = `
      .wrapper {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input)
    expect(output).toMatchSnapshot()
  })

  it('test custom unit cover size', async () => {
    const input = `
      .wrapper {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const coverSize = ({ width, height }: { width: number; height: number }) => {
      return { width: `${width / 100}rem`, height: `${height / 100}rem` }
    }

    const output = await run(input, [
      {
        mode: 'generate',
        imgSrc: IMG_SRC,
        skinSrc: GENERATE_SKIN_IMG,
        prefixSelector: '.skin',
        coverSize,
      },
      {
        mode: 'replace',
        imgSrc: IMG_SRC,
        skinSrc: REPLACE_SKIN_IMG,
        coverSize,
      },
    ])
    expect(output).toMatchSnapshot()
  })
})
