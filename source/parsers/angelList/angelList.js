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
  const linkCount = countLinks($, element)
  // console.log('Checking if element is a listing container.')
  // console.log(`Found ${linkCount} links.`)
  const contractCount = countContracts($, element)
  // console.log(`Found ${contractCount} contracts.`)
  return linkCount === 3 && contractCount === 1
}

function countLinks ($, element) {
  return $(element).find('a').length
}

function countContracts ($, element) {
  const text = $(element).text()
  const matches = text.match(/contract/gi)

  if (!matches) return 0
  return matches.length
}

function parseListingContainer ($, element) {
  const companyName = parseCompanyName($, element)

  const { url, title } = parseUrlAndJobTitle($, companyName, element)

  return {
    companyName,
    url,
    title
  }
}

function parseCompanyName ($, jobListingElement) {
  const text = $(jobListingElement)
    .text()
    .trim()

  // https://regexr.com/5ahb82
  const regex = /^.*?(?= {2,})/
  const matches = text.match(regex)

  if (!matches) return null
  return matches[0].trim()
}

function isJobTitleLink ($, companyName) {
  return function (link) {
    const $link = $(link)
    const text = $link.text().trim()
    return text.length > 0 && text !== companyName
  }
}

function parseUrlAndJobTitle ($, companyName, element) {
  const jobTitleLink = $(element)
    .find('a')
    .toArray()
    .find(isJobTitleLink($, companyName))

  const $jobTitleLink = $(jobTitleLink)

  return {
    url: $jobTitleLink.attr('href'),
    title: $jobTitleLink.text()
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
