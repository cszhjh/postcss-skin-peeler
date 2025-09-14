# postcss-skin-peeler

**English** | [中文](./README.zh-CN.md)

A PostCSS plugin that automatically generates prefixed theme styles for dynamic skin switching. It scans background-image URLs in CSS, matches them with corresponding images in a skin directory, and generates prefixed CSS rules, allowing seamless theme switching via JavaScript.

## Installation

```bash
# npm
npm install postcss-skin-peeler -D

# pnpm
pnpm add postcss-skin-peeler -D

# yarn
yarn add postcss-skin-peeler -D
```

## Usage

See the [PostCSS documentation](https://github.com/postcss/postcss#usage) for examples for your environment.

```js
const path = require('path')

module.exports = {
  "plugins": {
    "postcss-skin-peeler": {
      "mode": "generate",
      "imgSrc": path.resolve(__dirname, "./src/images"),
      "skinSrc": path.resolve(__dirname, "./src/skin"),
      "prefixSelector": ".skin-peeler",
      "coverSize": ({ width, height }) => ({ width: width / 100, height: height / 100 })
    }
  }
}
```

When configuring multiple skins, you can pass an array:

```js
const path = require('path')

module.exports = {
  "plugins": {
    "postcss-skin-peeler": [
      {
        "mode": "generate",
        "imgSrc": path.resolve(__dirname, "./src/images"),
        "skinSrc": path.resolve(__dirname, "./src/skin-generate"),
        "prefixSelector": ".skin-generator"
      },
      {
        "mode": "replace",
        "imgSrc": path.resolve(__dirname, "./src/images"),
        "skinSrc": path.resolve(__dirname, "./src/skin-replace"),
      }
    ]
  }
}
```

## Options

| Option         | Type                                                                                                               | Default                              | Description                                                                                                                                     |
|----------------|--------------------------------------------------------------------------------------------------------------------|--------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| imgSrc         | `string`                                                                                                           | `resolve(__dirname, './src/images')` | The path to the image directory.                                                                                                                |
| skinDir        | `string`                                                                                                           | `resolve(__dirname, './src/skin')`   | The directory where skin images are located.                                                                                                    |
| prefixSelector | `string \| ((selector: string) => string)`                                                                         | `.skin-peeler`                       | The prefix to be added to the generated CSS rules.                                                                                              |
| mode           | `string`                                                                                                           | `generate`                           | Control the behavior pattern of plugins when processing background images, Can be set to `generate` `replace`.                                  |
| coverSize      | `boolean \| ({ filePath: string, width: number, height: number }) => boolean \| { width: number, height: number }` | `false`                              | Cover `width \ height \ and background-size` size — useful when converting `px` to `rem`. Returning `false` disables conversion for that image. |

## Example

### Mode

```css
/* input */
.main {
  background-image: url('./images/bg.jpg');
}

/* generate mode output */
.main {
  background-image: url('./images/bg.jpg');
}

.skin-peeler .main {
  background-image: url('./skin/bg.jpg');
}

/* replace mode output */
.main {
  background-image: url('./skin/bg.jpg');
}
```
