const axios = require('axios')
const cheerio = require('cheerio')
const _ = require('lodash')
const Promise = require("bluebird")
const URI = require('urijs')
const { url_regex } = require('../constants/regex')
const { joinUrl, normalizeUrl } = require('../helpers/util')


const requestData = (urls, base_url) => {
    response_data = []
    return Promise.map(urls, function (url) {
        return axios.get(url, { timeout: 7000 })
            .then(response => {
                if (url.includes(base_url)) {
                    obj = { html: response.data, parent_url: url }
                    response_data.push(obj)
                }
                console.log(response.config.url, response.status)
            })
            .catch(err => {
                if (err.config && err.response && err.response.status)
                    console.log(err.config.url, err.response.status)
                else {
                    console.log(err.code)
                    console.log(err.message)
                }

            })
    }, { concurrency: 10 })
        .then(() => { return response_data })
}


const processUrl = async (url) => {
    let Total = 0

    try {
        url = normalizeUrl(url)
       
        let html_responses = await requestData([url], url)

        const visited_urls = new Set()
        visited_urls.add(url)
        Total += 1

        while (true) {
            const curr_links = []
            for (const html_response of html_responses) {
                const $ = cheerio.load(html_response.html);
                const links = $('a');

                $(links).each(function (i, link) {

                    let href_url = $(link).attr('href')
                    if (href_url && (href_url.match(url_regex) || href_url[0] == '/') && !href_url.includes('#')) {
                        const theUrl = new URI(href_url)
                        if (theUrl.is("relative")) {
                            href_url = joinUrl(href_url, html_response.parent_url)
                        }
                        href_url = normalizeUrl(href_url)
                        if (!visited_urls.has(href_url)) {
                            visited_urls.add(href_url)
                            curr_links.push(href_url)
                        }
                    }
                })
            }

            Total += curr_links.length
            if (_.isEmpty(curr_links)) {
                console.log("Total scanned URLs:", Total)
                break
            }
            html_responses = await requestData(curr_links, url)
        }
    }

    catch (err) {
        console.log(err)
    } finally {
        console.log("Total scanned URLs:", Total)
    }
}


module.exports = {
    processUrl
}

