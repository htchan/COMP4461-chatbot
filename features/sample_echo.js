/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var messageHistory = {};

module.exports = function(controller) {
    /*
    controller.hears('sample','message,direct_message', async(bot, message) => {
        await bot.reply(message, 'I heard a sample message.');
    });
    */
    // handle the unknown unput...
    let timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    controller.on('message,direct_message', async(bot, message) => {
        // if this is not the first time i hear some words and i dont understand, suggest my "basic function" (help)
        let n = (Object.keys(messageHistory).indexOf(message.text) >= 0) ? messageHistory[message.text] : 0;
        if (n === 0) {
            messageHistory[message.text] = 1
            // try to help user to google search it !
            await bot.reply(message, `sorry i dont really understand what you means 😓`)
            await bot.reply(message, `but I have search it on google, hope it can help you 😁`)
            await timeout(500);
            let url = `https://www.google.com/search?q=${message.text}`
            await bot.reply(message, `👉 <a href="${url}" target="_blank">${message.text}</a> 👈`)
        } else {
            messageHistory[message.text] += 1;
            messageHistory[message.text] %= 2
            await bot.reply(message, `i am sorry that i really don\'t understand what the <strong>${message.text}</strong> means 😢`);
            await timeout(200);
            await bot.reply(message, {
                text: 'Maybe you can try to ask me about these things 😙',
                quick_replies: [
                    {
                        title: "Find restaurant",
                        payload: "restaurant"
                    },
                    {
                        title: "Go somewhere",
                        payload: "go"
                    },
                    {
                        title: "Find toliet",
                        payload: "toliet"
                    },
                    {
                        title: "Activity suggestion",
                        payload: "activity"
                    },
                    {
                        title: "Translat local phase",
                        payload: "translate"
                    }
                ]
            });
        } 
        //await bot.reply(message, `Echo: ${ message.text }`);
    });

    //TODO: saying hi.
    controller.hears( (message) => message.text.toLowerCase() === "hi", 'message', async(bot, message) => {
        bot.reply(message, 'Hello, I am Sai Mai Zaai, your Hong Kong Travel Advisor');
        await timeout(300)
        bot.reply(message, 'You can use English to talk with me');
        await timeout(300);
        bot.reply(message, 'You can type <button onclick="helpOnClick">help</button> to see what I can do');
    })
}
