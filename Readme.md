# Gatsby Remark Footnotes Plugin

## gatsby-remark-footnotes

[![npm](https://img.shields.io/npm/v/gatsby-remark-footnotes/latest.svg?style=flat-square)](https://www.npmjs.com/package/gatsby-remark-footnotes)

This is a Gatsby Remark plugin that aims to customize the text and style of footnotes in case you want to adhere to the Wikipedia style, `^`, front of the footnote-type link.

## Installation

With npm:

`npm install --save gatsby-remark-footnotes`

or with yarn, if that's more your style:

`yarn add gatsby-remark-footnotes`

## Example config

```javascript
// In gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-footnotes`,
          options: {
            footnoteBackRefPreviousElementDisplay: "inline",
            footnoteBackRefDisplay: "inline",
            footnoteBackRefInnerText: "^", // Defaults to: "↩"
            //use if you want the Wikipedia style ^ link without an underline beneath it
            footnoteBackRefAnchorStyle: `text-decoration: none;`,
            //use "front" for Wikipedia style ^ links
            footnoteBackRefInnerTextStartPosition: "front"
          }
        }
      ]
    }
  }
];
```

## Plugin Options: in-depth

`footnoteBackRefPreviousElementDisplay`: the "previous" element is _always_ a `<p>` tag. Change the CSS display property of it with this prop. Can be omitted if you prefer to not change the display property from the `block` default, or you have a stylesheet overriding the default already.

`footnoteBackRefDisplay`: the footnote "back ref" refers to the `<a>` tag that can be clicked on to bring a user back to the footnote they originated from. Set both this and `footnoteBackRefPreviousElementDisplay` to `inline` to have them appear side-by-side. Can be omitted, same as above.

`footnoteBackRefInnerText`: defaults to `↩`. You can use whatever you'd like. Go nuts, replace it with a 👋!

`footnoteBackRefAnchorStyle`: As in the example above, if you use `^` you'll want to override the `text-decoration` property (and potentially other ones, like color, if that's your thing) to conform to the Wikipedia style. Can be omitted.

`footnoteBackRefInnerTextStartPosition`: `front` for Wikipedia style, otherwise can be omitted.

## Considerations

This plugin removes nodes from the AST Markdown tree that `gatsby-transformer-remark` uses to otherwise massage your markdown.
This means that _other_ functionality you might rely on from other Gatsby plugins also working on your markdown will probably not work as expected. E.G. you use `gatsby-external-link` - it's not going to pick up on anchor tags present in your footnotes. This plugin automatically adds `target="_blank" rel="noopener noreferrer` properties to your anchor tags.

Contributions are welcome!
