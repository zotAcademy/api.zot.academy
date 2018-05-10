const env = process.env.NODE_ENV || 'development'
const twttr = {
  txt: require('twitter-text')
}

twttr.txt.extractEntitiesWithIndices = function (text, options) {
  var entities = twttr.txt.extractUrlsWithIndices(text, options)
                  .concat(twttr.txt.extractMentionsOrListsWithIndices(text))
                  .concat(twttr.txt.extractHashtagsWithIndices(text, {checkUrlOverlap: false}))

  if (entities.length === 0) {
    return []
  }

  twttr.txt.removeOverlappingEntities(entities)
  return entities
}

const urlBase = env === 'development' ? 'http://localhost:8080' : 'https://zotacademy.github.io'

module.exports = function (text) {
  return twttr.txt.autoLink(text, {
    htmlEscapeNonEntities: true,
    usernameIncludeSymbol: true,
    suppressLists: true,
    suppressDataScreenName: true,
    usernameClass: 'username',
    usernameUrlBase: urlBase + '/',
    hashtagClass: 'hashtag',
    hashtagUrlBase: urlBase + '/search?q=%23',
    cashtagClass: 'cashtag',
    cashtagUrlBase: urlBase + '/search?q=%24'
  })
}
