// const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN })
const getParser = require('../parsers/getParser.js')

async function saveLeadToCrm (lead) {
  console.log('Saving lead to CRM.')
  console.log(JSON.stringify(lead))
  // await lib.airtable.query['@0.5.3'].insert({
  //   baseId: 'apphthDQhYt6FdneS',
  //   table: 'Leads',
  //   fieldsets: [
  //     {
  //       Name: lead.name,
  //       'Company Name': lead.companyName,
  //       Notes: lead.notes,
  //       Source: lead.source,
  //       Link: lead.link
  //     }
  //   ],
  //   typecast: false
  // })
}

async function saveLeadsToCrm (leads) {
  for (const lead of leads) {
    await saveLeadToCrm(lead)
  }
}

module.exports = async context => {
  console.log('') // Separate requests in the logs with a newline.
  const params = context.params

  const parse = await getParser(params)
  const leads = await parse(params)

  await saveLeadsToCrm(leads)

  return leads
}
