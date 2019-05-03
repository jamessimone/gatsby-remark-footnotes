# Gatsby Remark Footnotes Plugin

## gatsby-remark-footnotes

[![npm](https://img.shields.io/npm/v/gatsby-remark-footnotes/latest.svg?style=flat-square)](https://www.npmjs.com/package/gatsby-remark-footnotes)

This is a Gatsby Remark plugin that aims to customize the text and style of footnotes in case you want to adhere to more of a Wikipedia style, "^" front of the footnote-type link.

## Installation

With npm

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

## Considerations

This plugin removes nodes from the AST Markdown tree that `gatsby-transformer-remark` uses to otherwise massage your markdown.
This means that _other_ functionality you might rely on from other Gatsby plugins also working on your markdown will probably not work as expected. E.G. you use `gatsby-external-link` - it's not going to pick up on anchor tags present in your footnotes. This plugin automatically adds `target="_blank" rel="noopener noreferrer` properties to your anchor tags.

Contributions are welcome!
