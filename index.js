const visit = require("unist-util-visit");

const recursiveVisit = node => {
  //Unfortunately for users of gatsby-external-link, it doesn't matter the order that
  //the markdown is processed, that plugin only works on links still embedded within Markdown
  //Because links in the footnotes would otherwise be transformed to text, I have to re-add
  //the "target" and "rel" attributes. If you wanted to make these values conditional based on configuration,
  //I would welcome a PR.
  if (node.type === "link") {
    return `<a href=${node.url} target="_blank" rel="noopener noreferrer" ${
      node.title ? `title=${node.title}` : ""
    }>${node.children[0].value}</a>`;
  }
  return (
    node.value ||
    (node.children && node.children.map(recursiveVisit).join("")) ||
    ""
  );
};

module.exports = (
  { markdownAST },
  {
    footnoteBackRefPreviousElementDisplay,
    footnoteBackRefDisplay,
    footnoteBackRefInnerText,
    footnoteBackRefInnerTextStartPosition,
    footnoteBackRefAnchorStyle
  }
) => {
  const footnoteBackrefs = [];

  visit(markdownAST, `footnoteDefinition`, backrefNode => {
    footnoteBackrefs.push(backrefNode);
  });

  for (var index = 0; index < footnoteBackrefs.length; index++) {
    const node = footnoteBackrefs[index];
    //the content of the footnote itself
    let innerText = recursiveVisit(node);

    const pTag = `
      <p ${
        footnoteBackRefPreviousElementDisplay
          ? `${
              footnoteBackRefPreviousElementDisplay
                ? `style=display:${footnoteBackRefPreviousElementDisplay};`
                : ``
            }`
          : ""
      }>
        ${innerText.trim()}  
      </p>
    `;

    const anchorTag = `
      <a href="#fnref-${
        node.identifier
      }" class="footnote-backref" style="display:${footnoteBackRefDisplay};${
      footnoteBackRefAnchorStyle ? footnoteBackRefAnchorStyle : ""
    }">
        ${footnoteBackRefInnerText ? footnoteBackRefInnerText : "↩"}
      </a>
    `;

    const listItem = `
      <li id="fn-${node.identifier}">
        ${
          footnoteBackRefInnerTextStartPosition &&
          footnoteBackRefInnerTextStartPosition === "front"
            ? anchorTag + pTag
            : pTag + anchorTag
        }
      </li>
    `;

    const openingTag = `
      <div class="footnotes">
        <hr/>
        <ol>
    `;
    const closingOl = `</ol></div>`;

    let html = index === 0 ? openingTag + listItem : listItem;
    html = index === footnoteBackrefs.length - 1 ? html + closingOl : html;

    node.type = "html";
    node.children = undefined;
    node.value = html;
  }

  return markdownAST;
};
