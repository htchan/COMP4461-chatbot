/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = function(controller) {
    /*
    // use a function to match a condition in the message
    controller.hears(async (message) => message.text && message.text.toLowerCase() === 'foo', ['message'], async (bot, message) => {
        await bot.reply(message, 'I heard "foo" via a function test');
    });

    // use a regular expression to match the text of the message
    controller.hears(new RegExp(/^\d+$/), ['message','direct_message'], async function(bot, message) {
        await bot.reply(message,{ text: 'I heard a number using a regular expression.' });
    });

    // match any one of set of mixed patterns like a string, a regular expression
    controller.hears(['allcaps', new RegExp(/^[A-Z\s]+$/)], ['message','direct_message'], async function(bot, message) {
        await bot.reply(message,{ text: 'I HEARD ALL CAPS!' });
    });
    */
    // give a quick guide to user
    let timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let match = (message, str) => message.text.toLowerCase() === str;

    controller.interrupts((message) => message.text.toLowerCase() === 'help', 'message', async(bot, message) => {
        await bot.cancelAllDialogs();
        await bot.reply(message, {
            text: "The following are the things I can help you",
            quick_replies: [
                {
                    title: "Find restaurant",
                    payload: "Can you suggest some restaurants to me?"
                },
                {
                    title: "Go somewhere",
                    payload: "Please help me find a route"
                },
                {
                    title: "Find toilet",
                    payload: "Do you know where is the toilet?"
                },
                {
                    title: "Activity suggestion",
                    payload: "Do you have any activities suggestion?"
                },
                {
                    title: "Translat local phase",
                    payload: "Can you help me translate a phase?"
                }
            ]
        });
    });

    controller.interrupts(message=>['bye', 'good bye', 'see you'].some( item=>match(message, item) ), 'message', async(bot, message) => {
        await bot.reply(message, 'See you👋👋👋');
        await bot.reply(message, `<img src="/images/bye.gif"/></p>`);
        await timeout(1000);
        await bot.reply(message, '... I cannot close the tab myself, can you help me?')
    });
}