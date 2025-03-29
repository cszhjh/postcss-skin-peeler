const path = require('path')

module.exports = {
  "plugins": {
    "postcss-skin-peeler": {
      "imgSrc": path.resolve(__dirname, "./src/images"),
      "skinSrc": path.resolve(__dirname, "./skin"),
      "prefixSelector": ".skin"
    }
  }
}
