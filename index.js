// Add the import for Cheerio
const cheerio = require("cheerio"); 

const axios = require("axios")

const baseURL = "https://quotes.toscrape.com"

async function main() { 
    const paginationURLs = ["/"]
    const visitedURLs = []
    
    const authorURLs = new Set()
    const tagURLs = new Set()

    await crawlQuotes(paginationURLs, visitedURLs, authorURLs, tagURLs)

    console.log(authorURLs)
    console.log(paginationURLs)
    console.log(tagURLs)

    let authors = await scrapeAuthors(authorURLs)

    console.log(authors)
} 

const crawlQuotes = async (paginationURLs, visitedURLs, authorURLs, tagURLs) => {

    let currentURLIndex = 0
    
    while (visitedURLs.length !== paginationURLs.length) {

        const pageHTML = await axios.get(baseURL + paginationURLs[currentURLIndex])

        const $ = cheerio.load(pageHTML.data)

        visitedURLs.push(paginationURLs[currentURLIndex])

        $(".quote a").each((index, element) => {
            const URL = $(element).attr("href")
    
            if (URL.startsWith("/tag")){
                if (URL.endsWith("/page/1/"))
                    tagURLs.add(URL.split("/page/1/")[0])
                else
                    tagURLs.add(URL)
            } else if (URL.startsWith("/author"))
                authorURLs.add(URL)
    
        })
    
        $(".tag-item a").each((index, element) => {
            const URL = $(element).attr("href")
    
            if (URL.startsWith("/tag")) {
                if (URL.endsWith("/page/1/"))
                    tagURLs.add(URL.split("/page/1/")[0])
                else
                    tagURLs.add(URL)
            } else if (URL.startsWith("/author"))
                authorURLs.add(URL)
        })
    
        $(".pager > .next a").each((index, element) => {
            const URL = $(element).attr("href")
    
            if (URL.startsWith("/page"))
                paginationURLs.push(URL)
        })

        currentURLIndex += 1
    }
}

const scrapeAuthors = async (authorURLs) => {
    const authors = []
    for (let url of authorURLs) {
        const pageHTML = await axios.get(baseURL + url)

        const $ = cheerio.load(pageHTML.data)

        const author = {
            name: $("h3.author-title").text(),
            dateOfBirth: $("span.author-born-date").text(),
            locationofBirth: $("span.author-born-location").text(),
            description: $("div.author-description").text()
        }

        authors.push(author)

    } 

    return authors
}
 
main()