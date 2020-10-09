const cheerio = require('cheerio')

module.exports = function parseAngelListEmail (params) {
  const jobListings = parseEmail(params.bodyHtml)
  return jobListings.map(jobListingToCrmEntry)
}

function parseEmail (html) {
  const $ = cheerio.load(html)
  const jobListings = $('table')
    .toArray()
    .filter(element => {
      return isListingContainer($, element)
    })
    .map(element => {
      return parseListingContainer($, element)
    })

  return jobListings
}

function isListingContainer ($, element) {
  const startupLogoCount = countStartupLogos($, element)
  const separatorDotCount = countStringOccurrences($, element, '·')
  const unsubscribeCount = countStringOccurrences($, element, 'unsubscribe')
  return (
    startupLogoCount === 1 && separatorDotCount >= 1 && unsubscribeCount === 0
  )
}

function countStartupLogos ($, element) {
  const startupLogos = $(element).find('img[src*="photos.angel.co/startups"]')
  return startupLogos.length
}

function countStringOccurrences ($, element, string) {
  const text = $(element).text()

  const regex = new RegExp(string, 'gi')
  const matches = text.match(regex)

  if (!matches) return 0
  return matches.length
}

function parseListingContainer ($, jobListingContainer) {
  const companyName = parseCompanyName($, jobListingContainer)

  const { url, title } = parseUrlAndJobTitle(
    $,
    companyName,
    jobListingContainer
  )

  return {
    companyName,
    url,
    title
  }
}

function parseCompanyName ($, jobListingContainer) {
  const linksWithText = $(jobListingContainer)
    .find('a')
    .toArray()
    .filter(containsText($))

  const firstLinkWithText = linksWithText[0]
  const companyName = getText($, firstLinkWithText)

  return companyName
}

function containsText ($) {
  return function (element) {
    const text = $(element).text()
    return text.trim().length > 0
  }
}

function parseUrlAndJobTitle ($, companyName, jobListingContainer) {
  const jobTitleLink = $(jobListingContainer)
    .find('a')
    .toArray()
    .find(isJobTitleLink($, companyName))

  const $jobTitleLink = $(jobTitleLink)
  const jobTitle = getText($, jobTitleLink)

  return {
    url: $jobTitleLink.attr('href'),
    title: jobTitle
  }
}

function isJobTitleLink ($, companyName) {
  return function (link) {
    const text = getText($, link)
    return text.length > 0 && text !== companyName
  }
}

function jobListingToCrmEntry (jobListing) {
  return {
    name: jobListing.title,
    companyName: jobListing.companyName,
    source: ['AngelList'],
    link: jobListing.url
  }
}

function getText ($, element) {
  const text = $(element)
    .text()
    .trim()

  return collapseSpaces(text)
}

function collapseSpaces (string) {
  const twoOrMoreSpaces = /\s{2,}/gi
  return string.replace(twoOrMoreSpaces, ' ')
}
