const hastToHTML = require(`hast-util-to-html`);
const toHAST = require(`mdast-util-to-hast`);
const visit = require("unist-util-visit");

const recursivelyFormatMarkdown = (
  node,
  footnoteBackRefPreviousElementDisplay,
  footnoteBackRefInnerTextStartPosition
) => {
  //Unfortunately for users of gatsby-external-link, it doesn't matter the order that
  //the markdown is processed, that plugin only works on links still embedded within Markdown
  //Because links in the footnotes would otherwise be transformed to text, I have to re-add
  //the "target" and "rel" attributes. If you wanted to make these values conditional based on configuration,
  //I would welcome a PR.
  const hast = toHAST(node);

  if (node.type === "link") {
    return `<a href=${node.url} target="_blank" rel="noopener noreferrer" ${
      node.title ? `title=${node.title}` : ""
    }>${node.children[0].value}</a>`;
  } else if (hast) {
    if (hast.children && hast.children.length > 0) {
      hast.children = hast.children.slice(0, hast.children.length - 1);
    }

    //the base object returned by toHAST (for a footnote) will be a <p> tag
    //to change the style, we have to manipulate the return value
    const newHast = {
      type: `element`,
      tagName: `p`,
      properties: footnoteBackRefPreviousElementDisplay
        ? {
            class: "footnote-paragraph",
            style: `display:${footnoteBackRefPreviousElementDisplay}; ${
              footnoteBackRefInnerTextStartPosition === "front"
                ? "margin-left: 5px;"
                : ""
            }`
          }
        : {},
      children: hast.children
    };

    return hastToHTML(newHast, {
      allowDangerousHTML: true
    });
  }

  return (
    node.value ||
    (node.children &&
      node.children
        .map(child =>
          recursivelyFormatMarkdown(
            child,
            footnoteBackRefPreviousElementDisplay,
            footnoteBackRefInnerTextStartPosition
          )
        )
        .join("")) ||
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
    footnoteBackRefAnchorStyle,
    useFootnoteMarkerText = false,
    footnotesGoBelowOptions = {
      itemFootnotesGoBelow: "heading",
      itemValue: "Further Reading",
      moveFootnotes: true
    }
  }
) => {
  const footnoteBackrefs = [];
  let priorNode = { empty: true };
  if (footnotesGoBelowOptions.moveFootnotes) {
    visit(markdownAST, footnotesGoBelowOptions.itemFootnotesGoBelow, node => {
      if (node.children[0].value === footnotesGoBelowOptions.itemValue) {
        priorNode = node;
      }
    });
  }

  visit(markdownAST, `footnoteDefinition`, backrefNode => {
    if (useFootnoteMarkerText) {
      backrefNode.id = backrefNode.label;
    }

    footnoteBackrefs.push(backrefNode);
  });

  for (var index = 0; index < footnoteBackrefs.length; index++) {
    const node = footnoteBackrefs[index];
    //the content of the footnote itself
    let innerText = recursivelyFormatMarkdown(
      node,
      footnoteBackRefPreviousElementDisplay,
      footnoteBackRefInnerTextStartPosition
    );

    const pTag = innerText;

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
    <li class="footnote-list-item" id="fn-${node.identifier}" ${
      useFootnoteMarkerText ? `style="display:inline"` : ""
    }>
          ${
            useFootnoteMarkerText
              ? `<span class="footnote-marker-text" style="display: inline">${node.label}.</span>`
              : ""
          }
        ${
          footnoteBackRefInnerTextStartPosition &&
          footnoteBackRefInnerTextStartPosition === "front"
            ? anchorTag + pTag
            : pTag + anchorTag
        }
      </li>
      ${
        useFootnoteMarkerText && index < footnoteBackrefs.length - 1
          ? `<br/> <br/>`
          : ""
      }
    `;

    const openingTag = `
      <div class="footnotes">
        <hr/>
        <ol ${useFootnoteMarkerText ? `style="list-style: none;"` : ``}>
    `;
    const closingOl = `</ol></div>`;

    let html = index === 0 ? openingTag + listItem : listItem;
    html = index === footnoteBackrefs.length - 1 ? html + closingOl : html;

    if (!priorNode.empty) {
      console.log(priorNode);
      // priorNode.children[2] = html; TODO: yikes
      node.value = "";
    } else {
      node.value = html;
    }

    node.type = "html";
    node.children = undefined;
  }

  return markdownAST;
};
