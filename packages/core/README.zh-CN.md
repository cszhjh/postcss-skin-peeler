# postcss-skin-peeler

**中文** | [English](./README.md)

一个PostCSS插件，自动生成前缀主题样式以进行动态皮肤切换。它扫描CSS中的背景图像URL，将其与皮肤目录中的相应图像进行匹配，并生成前缀CSS规则，允许通过JavaScript无缝切换主题。

## 安装

```bash
# yarn
yarn add postcss-skin-peeler -D

# npm
npm install postcss-skin-peeler -D

# pnpm
pnpm add postcss-skin-peeler -D
```

## 使用

请参阅[PostCSS文档](https://github.com/postcss/postcss#usage)以获取您环境的示例。

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

## 选项

| 选项             | 类型     | 默认值                      | 描述                                                                 |
| ---------------- | -------- | --------------------------- | -------------------------------------------------------------------- |
| imgSrc           | `string` | `resolve(__dirname, './src/images')` | 图片目录的路径。                                                     |
| skinSrc          | `string` | `resolve(__dirname, './src/skin')`    | 皮肤图片所在的目录。                                                 |
| prefixSelector   | `string | ((selector: string) => string)` | `.skin-peeler` | 生成的CSS规则的前缀。                                             |

## 示例

```css
/* input */
.main {
  background-image: url('./images/bg.jpg');
}

/* output */
.main {
  background-image: url('./images/bg.jpg');
}

.skin-peeler.main {
  background-image: url('./skin/bg.jpg');
}
```
