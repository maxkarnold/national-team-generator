const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

function hasNumber(myString) {
  return /\d/.test(myString);
}

let totalPages = [
    {
        url: "https://surnames.behindthename.com/submit/names/usage/thai",
        pages: 1
    }
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/african",
    //     pages: 4
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/albanian",
    //     pages: 2
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/arabic",
    //     pages: 4
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/portuguese",
    //     pages: 2
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/turkish",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/basque",
    //     pages: 2
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/galician",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/catalan",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/welsh",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/frisian",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/finnish",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/serbian",
    //     pages: 2
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/bosnian",
    //     pages: 2
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/slovak",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/slovene",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/belarusian",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/macedonian",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/montenegrin",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/estonian",
    //     pages: 8
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/lithuanian",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/russian",
    //     pages: 4
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/kyrgyz",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/ukrainian",
    //     pages: 2
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/georgian",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/armenian",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/uzbek",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/iranian",
    //     pages: 2
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/romanian",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/greek",
    //     pages: 2
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/korean",
    //     pages: 1
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/chinese",
    //     pages: 2
    // },
    // {
    //     url: "https://surnames.behindthename.com/submit/names/usage/filipino",
    //     pages: 3
    // }
];

async function fetchSubmittedNames() {
    
    let namesArr = [];
    let nameCount = 0;
    for (let j = 0; j < totalPages.length; j++) {
        let url = totalPages[j].url;
        // let url = "https://surnames.behindthename.com/names/usage/japanese";
        let pages = totalPages[j].pages;
        // let pages = 1;
        for (let i = 1; i <= pages; i++) {
            let res;
            if (i === 1) {
                res = await fetch(url);
            } else {
                res = await fetch(`${url}/${i}`);
            }

            const body = await res.text();
            const $ = cheerio.load(body);
            $('.browsename').each((i, title) => {
                let nameObj = {
                    name: '',
                    id: 0,
                    usages: []
                };
                const titleNode = $(title);
                nameObj.name = titleNode.children('.listname').text();
                if (hasNumber(nameObj.name)) {
                    let newArr = nameObj.name.split(" ");
                    nameObj.name = newArr[0];
                    // console.log(nameObj.name);
                }
                titleNode.children('.listusage').each((j, node) => {
                    $(node).children('a').each((k, txt) => {
                        nameObj.usages.push($(txt).text());
                    });
                });
                // console.log(nameObj.usages);
                nameObj.id = nameCount;
                nameCount++;
                console.log("Last Name:\n", nameObj);
                namesArr.push(nameObj);
            });
        }
    }

    

    let namesJson = JSON.stringify(namesArr);
    fs.writeFile("./functions/thai-last-names.json", namesJson, function (err, result) {
        if (err) console.log('error', err);
        // console.log("Added Name:", result);
    });
    

}

fetchSubmittedNames();

