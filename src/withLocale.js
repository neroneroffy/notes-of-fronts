import React, { PropTypes } from 'react'

var re = /{{\s*\w+\s*}}/g

function tReplace(text = '', repVar = {}) {
  return text.replace(re, (match) => {
    const newText = repVar[match.slice(2, -2).trim()]
    return newText !== undefined ? newText : match
  })
}

export default (DecoratedComponent, locale) => {
  const NewComponent = (props, context) => {
    const t = (key, repVar) => {
      const { antLocale } = context
      let localeSymbol
      if (antLocale && antLocale.locale) {
        localeSymbol = antLocale && antLocale.locale
      } else if (antLocale && !antLocale.locale) {
        if (Object.keys(antLocale).length === 0) {
          localeSymbol = 'zh-cn'
        } else {
          localeSymbol = 'en'
        }
      }
      const keyArr = key.split('.')
      let text = ''
      const selectKey = obj => {
        keyArr.forEach(v => {
          if (typeof obj[v] === 'object') {
            selectKey(obj[v])
          } else if (typeof obj[v] === 'string') {
            text = repVar ? tReplace(obj[v], repVar) : obj[v]
          }
        })
      }

      if (localeSymbol && localeSymbol === 'en') {
        selectKey(locale.en)
      } else {
        selectKey(locale.zh_CN)
      }
      return text
    }
    return <DecoratedComponent t={t} {...props}/>
  }
  NewComponent.contextTypes = {
    antLocale: PropTypes.object,
  }
  return NewComponent
}
