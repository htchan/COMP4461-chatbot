const { BotkitConversation } = require("botkit");

module.exports = function(controller) {
    let timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let apiHost = 'localhost:3000';

    let callEventApi = async() => {
        return await fetch(`http://${apiHost}/api/event.json`)
        .then( response => response.json() )
        .then( data => data.filter( item => item.available ) )
    }

    //TODO: ask user what type of event they want

    controller.hears(["event", 'activities', 'activity'],
        'message', async (bot, message) => {
            await bot.reply(message, 'Hey, are you looking for some interesting events?');
            await timeout(200);
            let events = await callEventApi();
            let event = events[Math.floor(Math.random(events.length))];
            await bot.reply(message, `You may be interested in ${event.title}`)
            await bot.reply(message, event.desc);
            await bot.reply(message, `Here is the event details:<br/>Title: ${event.title}<br/>time: ${event.time}<br/>Location: ${event.location}<br/>Link: <a href="${event.url}" target="_blank">${event.url}</a>`)
        });
}