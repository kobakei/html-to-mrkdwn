module.exports = {
  slackLink: {
    filter: function (node, options) {
      return (
        options.linkStyle === 'slack' &&
        node.nodeName === 'A' &&
        node.getAttribute('href')
      )
    },

    replacement: function (content, node) {
      const href = node.getAttribute('href')
      return `<${href}|${content}>`
    }
  },

  // Slack doesn't support headings, so we'll just make them all bold
  heading: {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: content => `\n*${content}*\n`
  },

  taskListItems: {
    filter: function (node) {
      return node.type === 'checkbox' && node.parentNode.nodeName === 'LI'
    },

    replacement: function (content, node) {
      return node.checked ? '☑︎' : '☐'
    }
  },

  listItem: {
    filter: 'li',
    replacement: function (content, node, options) {
      content = content
        .replace(/^\n+/, '') // remove leading newlines
        .replace(/\n+$/, '\n') // replace trailing newlines with just a single one
        .replace(/\n/gm, '\n    ') // indent
      let prefix = options.bulletListMarker + ' '
      const parent = node.parentNode
      if (node.className.indexOf('task-list-item') >= 0) {
        prefix = ''
      } else if (parent.nodeName === 'OL') {
        const start = parent.getAttribute('start')
        const index = Array.prototype.indexOf.call(parent.children, node)
        prefix = (start ? Number(start) + index : index + 1) + '. '
      }
      return (
        prefix + content.trim() + (node.nextSibling && !/\n$/.test(content) ? '\n' : '')
      )
    }
  },

  // Slack doesn't support images, so just show the link
  images: {
    filter: 'img',
    replacement: function (content, node) {
      const parent = node.parentNode
      if (parent && parent.nodeName === 'A') {
        return node.alt || node.src
      } else if (node.alt) {
        return `<${node.src}|${node.alt}>`
      } else {
        return node.src
      }
    }
  },

  highlightedCodeBlock: {
    filter: function (node) {
      const firstChild = node.firstChild
      return (
        node.nodeName === 'DIV' &&
        /highlight-(?:text|source)-([a-z0-9]+)/.test(node.className) &&
        firstChild &&
        firstChild.nodeName === 'PRE'
      )
    },
    replacement: function (content, node, options) {
      return (
        '\n\n' + options.fence + '\n' +
        node.firstChild.textContent +
        '\n' + options.fence + '\n\n'
      )
    }
  },

  // インラインコードの前後に半角スペースを必ず入るようにする
  code: {
    filter: function (node) {
      return node.nodeName === 'CODE'
    },
    replacement: function (content) {
      return ' `' + content + '` '
    }
  },

  // シンタックスハイライトされたコードをmrkdwnに変換するときに、言語名が残ってしまう問題の対策
  codeBlock: {
    filter: function (node) {
      return node.nodeName === 'PRE' && node.firstChild && node.firstChild.nodeName === 'CODE'
    },
    replacement: function (content, node, options) {
      return '\n```\n' + node.firstChild.textContent + '```\n'
    }
  }
}
