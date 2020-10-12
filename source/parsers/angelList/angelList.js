const cheerio = require('cheerio')

module.exports = function parseAngelListEmail (params) {
  const jobListings = parseEmail(params.bodyHtml)
  return jobListings.map(jobListingToCrmEntry)
}

function parseEmail (html) {
  const $ = cheerio.load(html)
  const jobListings = $('table')
    .toArray()
    .filter(isListingContainer($))
    .map(getJobListingsFromContainer($)) // This returns an array, so we'll flatten it next.
    .flat()

  return jobListings
}

function isListingContainer ($, element) {
  return function (element) {
    const startupLogoCount = countStartupLogos($, element)
    const separatorDotCount = countStringOccurrences($, element, '·')
    const unsubscribeCount = countStringOccurrences($, element, 'unsubscribe')
    return (
      startupLogoCount === 1 && separatorDotCount >= 1 && unsubscribeCount === 0
    )
  }
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

function getJobListingsFromContainer ($) {
  return function (jobListingContainer) {
    const companyName = parseCompanyName($, jobListingContainer)

    return getJobTitleLinks($, companyName, jobListingContainer).map(
      jobTitleLinkToJobListing(companyName)
    )
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

function jobTitleLinkToJobListing (companyName) {
  return function (jobTitleLink) {
    return {
      companyName,
      url: jobTitleLink.url,
      title: jobTitleLink.title
    }
  }
}

function containsText ($) {
  return function (element) {
    const text = $(element).text()
    return text.trim().length > 0
  }
}

function getJobTitleLinks ($, companyName, jobListingContainer) {
  return $(jobListingContainer)
    .find('a')
    .toArray()
    .filter(isJobTitleLink($, companyName))
    .map(parseJobTitleLink($))
}

function isJobTitleLink ($, companyName) {
  return function (link) {
    const text = getText($, link)
    return text.length > 0 && text !== companyName
  }
}

function parseJobTitleLink ($) {
  return function (jobTitleLink) {
    const $jobTitleLink = $(jobTitleLink)
    const jobTitle = getText($, jobTitleLink)
    return {
      url: $jobTitleLink.attr('href'),
      title: jobTitle
    }
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
