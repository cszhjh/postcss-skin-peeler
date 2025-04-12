import { dirname, relative, resolve } from 'node:path'
import mockFs from 'mock-fs'
import postcss from 'postcss'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import plugin from '../src/main'
import type { PluginOptions } from '../src/types'

const FROM = resolve('./style/index.css')
const IMG_SRC = './images'
const SKIN_IMG = './skin'
const ORIGIN_IMG_ONE = resolve(IMG_SRC, './one.png')
const ORIGIN_IMG_TWO = resolve(IMG_SRC, './two.png')
const SKIN_IMG_ONE = resolve(SKIN_IMG, './one.png')
const SKIN_IMG_TWO = resolve(SKIN_IMG, './two.png')
const ORIGIN_IMG_ONE_RELATIVE = relative(dirname(FROM), ORIGIN_IMG_ONE)
const ORIGIN_IMG_TWO_RELATIVE = relative(dirname(FROM), ORIGIN_IMG_TWO)

const PLUGIN_OPTIONS: PluginOptions = {
  imgSrc: IMG_SRC,
  skinSrc: SKIN_IMG,
  prefixSelector: '.skin',
}

async function run(css: string, options?: PluginOptions) {
  const { css: output } = await postcss([plugin(options)]).process(css, { from: FROM })
  return output
}

beforeAll(() => {
  mockFs({
    [ORIGIN_IMG_ONE]: Buffer.from([8, 6, 7, 5, 3, 0, 9]),
    [ORIGIN_IMG_TWO]: Buffer.from([9, 6, 7, 5, 3, 0, 9]),
    [SKIN_IMG_ONE]: Buffer.from([9, 7, 8, 6, 4, 1, 10]),
    [SKIN_IMG_TWO]: Buffer.from([10, 7, 8, 6, 4, 1, 10]),
  })
})

afterAll(() => {
  mockFs.restore()
})

describe.each([['generate' as const], ['replace' as const]])('mode = %s: test url quotation mark', (mode) => {
  const options: PluginOptions = {
    ...PLUGIN_OPTIONS,
    mode,
  }

  it('test url without quotes', async () => {
    const input = `
      .non-quotation {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input, options)
    expect(output).toMatchSnapshot()
  })

  it('test url with single quotes', async () => {
    const input = `
      .single-quote {
        background: url('${ORIGIN_IMG_ONE_RELATIVE}') no-repeat;
      }
    `
    const output = await run(input, options)
    expect(output).toMatchSnapshot()
  })

  it('test url with double quotes', async () => {
    const input = `
      .double-quote {
        background: url("${ORIGIN_IMG_ONE_RELATIVE}") no-repeat;
      }
    `
    const output = await run(input, options)
    expect(output).toMatchSnapshot()
  })
})

describe.each([['generate' as const], ['replace' as const]])('mode = %s: test url with protocol', (mode) => {
  const options: PluginOptions = {
    ...PLUGIN_OPTIONS,
    mode,
  }

  it('test url with http', async () => {
    const input = `
      .http {
        background: url(http://varletjs.org/varlet_icon.png) no-repeat;
      }
    `
    const output = await run(input, options)
    expect(output).toBe(input)
  })

  it('test url with https', async () => {
    const input = `
      .http {
        background: url(https://varletjs.org/varlet_icon.png) no-repeat;
      }
    `
    const output = await run(input, options)
    expect(output).toBe(input)
  })
})

describe.each([['generate' as const], ['replace' as const]])('mode = %s: test background stack', (mode) => {
  const options: PluginOptions = {
    ...PLUGIN_OPTIONS,
    mode,
  }

  it('test background is stacked in the single rule', async () => {
    const input = `
      .rule-single-stacked {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
        background-image: url(${ORIGIN_IMG_TWO_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input, options)
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
    const output = await run(input, options)
    expect(output).toMatchSnapshot()
  })
})

describe.each([['generate' as const], ['replace' as const]])('mode = %s: test html and body combination', (mode) => {
  const options: PluginOptions = {
    ...PLUGIN_OPTIONS,
    mode,
  }

  it('test html as prefix selector', async () => {
    const input = `
      html .html-prefix {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input, options)
    expect(output).toMatchSnapshot()
  })

  it('test body as prefix selector', async () => {
    const input = `
      body .body-prefix {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input, options)
    expect(output).toMatchSnapshot()
  })

  it('test html body as prefix selector', async () => {
    const input = `
      html body .html-body-prefix {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input, options)
    expect(output).toMatchSnapshot()
  })

  it('test html follow selector as prefix selector', async () => {
    const input = `
      html.follow .html-prefix {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input, options)
    expect(output).toMatchSnapshot()
  })

  it('test body follow selector as prefix selector', async () => {
    const input = `
      body.follow .body-prefix {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    `
    const output = await run(input, options)
    expect(output).toMatchSnapshot()
  })
})

describe.each([['generate' as const], ['replace' as const]])('mode = %s: test rule in @media', (mode) => {
  const options: PluginOptions = {
    ...PLUGIN_OPTIONS,
    mode,
  }

  const input = `
    @media screen and (min-width: 1024px) {
      .media {
        background: url(${ORIGIN_IMG_ONE_RELATIVE}) no-repeat;
      }
    }
  `
  it('test rule in @media', async () => {
    const output = await run(input, options)
    expect(output).toMatchSnapshot()
  })
})
