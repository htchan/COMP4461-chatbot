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
    controller.interrupts((message) => message.text.toLowerCase() === 'help', 'message', async(bot, message) => {
        await bot.reply(message, {
            text: "The following are the things I can help you",
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
    });

    controller.interrupts('quit', 'message', async(bot, message) => {
        await bot.reply(message, 'See you👋👋👋');
        await bot.reply(message, `<img src="/images/bye.gif"/></p>
        <script type='text/javascript'>
        console.log('hello')
        </script><p>
        `)
    })
}