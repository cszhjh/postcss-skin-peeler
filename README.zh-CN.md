# postcss-skin-peeler

**中文** | [English](./README.md)

一个PostCSS插件，自动生成前缀主题样式以进行动态皮肤切换。它扫描CSS中的背景图像URL，将其与皮肤目录中的相应图像进行匹配，并生成前缀CSS规则，允许通过JavaScript无缝切换主题。

## 安装

```bash
# npm
npm install postcss-skin-peeler -D

# pnpm
pnpm add postcss-skin-peeler -D

# yarn
yarn add postcss-skin-peeler -D
```

## 使用

请参阅[PostCSS文档](https://github.com/postcss/postcss#usage)以获取您环境的示例。

```js
const path = require('path')

module.exports = {
  "plugins": {
    "postcss-skin-peeler": {
      "mode": "generate",
      "imgSrc": path.resolve(__dirname, "./src/images"),
      "skinSrc": path.resolve(__dirname, "./src/skin"),
      "prefixSelector": ".skin-peeler",
      "coverSize": ({ width, height }) => ({ width: `${width / 100}rem`, height: `${height / 100}rem` })
    }
  }
}
```

配置多套皮肤时，可以传入一个数组：

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

## 选项

| 选项           | 类型                                                                                                               | 默认值                               | 描述                                                                                                              |
|----------------|--------------------------------------------------------------------------------------------------------------------|--------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| imgSrc         | `string`                                                                                                           | `resolve(__dirname, './src/images')` | 图片目录的路径。                                                                                                   |
| skinSrc        | `string`                                                                                                           | `resolve(__dirname, './src/skin')`   | 皮肤图片所在的目录。                                                                                               |
| prefixSelector | `string \| ((selector: string) => string)`                                                                         | `.skin-peeler`                       | 生成的CSS规则的前缀。                                                                                              |
| mode           | `string`                                                                                                           | `generate`                           | 控制插件在处理background-image时的行为模式，可选值为 `generate` `replace`。                                         |
| coverSize      | `boolean \| ({ filePath: string, width: number, height: number }) => boolean \| { width: number, height: number }` | `false`                              | 覆盖 `width \ height \ background-size` 的尺寸 - 在将 `px` 转换为 `rem` 时很有用。返回 `false` 将禁用该图像的转换。 |

## 示例

### 模式

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
