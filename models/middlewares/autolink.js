const env = process.env.NODE_ENV || 'development'
const twttr = {
  txt: require('twitter-text')
}
const urlBase = env === 'development' ? 'http://localhost:8080' : 'https://zot.academy'

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
