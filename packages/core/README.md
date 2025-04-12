# postcss-skin-peeler

**English** | [中文](./README.zh-CN.md)

A PostCSS plugin that automatically generates prefixed theme styles for dynamic skin switching. It scans background-image URLs in CSS, matches them with corresponding images in a skin directory, and generates prefixed CSS rules, allowing seamless theme switching via JavaScript.

## Installation

```bash
# yarn
yarn add postcss-skin-peeler -D

# npm
npm install postcss-skin-peeler -D

# pnpm
pnpm add postcss-skin-peeler -D
```

## Usage

See the [PostCSS documentation](https://github.com/postcss/postcss#usage) for examples for your environment.

```js
const path = require('path')

module.exports = {
  "plugins": {
    "postcss-skin-peeler": {
      "imgSrc": path.resolve(__dirname, "./src/images"),
      "skinSrc": path.resolve(__dirname, "./src/skin"),
      "prefixSelector": ".skin-peeler"
    }
  }
}
```

## Options

| Option         | Type                                       | Default                              | Description                                                                                                    |
|----------------|--------------------------------------------|--------------------------------------|----------------------------------------------------------------------------------------------------------------|
| imgSrc         | `string`                                   | `resolve(__dirname, './src/images')` | The path to the image directory.                                                                               |
| skinDir        | `string`                                   | `resolve(__dirname, './src/skin')`   | The directory where skin images are located.                                                                   |
| prefixSelector | `string \| ((selector: string) => string)` | `.skin-peeler`                       | The prefix to be added to the generated CSS rules.                                                             |
| mode           | `string`                                   | `generate`                           | Control the behavior pattern of plugins when processing background images, Can be set to `generate` `replace`. |

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
