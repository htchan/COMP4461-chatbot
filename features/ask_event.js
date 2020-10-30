const { BotkitConversation } = require("botkit");

module.exports = function(controller) {
    let timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let apiHost = 'localhost:3000';

    let callEventApi = async(type=null) => {
        return await fetch(`http://${apiHost}/api/event.json`)
        .then( response => response.json() )
        .then( data => {
            if (type) {
                return data.filter( item => item.type === type ).filter( item => item.available );
            } else {
                return data.filter( item => item.available );
            }
        });
    }

    let askEvent = new BotkitConversation('ask_event', controller);

    askEvent.say('Hey, are you looking for some interest activities?');
    askEvent.ask(
        {
            text: 'Do You have any preference on the type of activities?', 
            quick_replies: [
                { title: 'Hiking', payload: 'hiking' },
                { title: 'Shopping', patload: 'shopping' },
                { title: 'Visit museum', payload: 'Visit museum' },
                { title: 'No preference', payload: 'No preference' }
            ]
        },[
        {
            pattern: "shopping",
            type: "string",
            handler: async(response, ask, bot, message) => {
                ask.setVar('prefer', 'shopping')
                let events = await callEventApi('shopping');
                let i = Math.floor(Math.random()*events.length);
                let event = events[i];
                await bot.reply(message, `You may be interested in ${event.title}`)
                await bot.reply(message, event.desc);
                await bot.reply(message, `Here is the event details:<br/>Title: ${event.title}<br/>time: ${event.time}<br/>Location: ${event.location}<br/>Link: <a href="${event.url}" target="_blank">${event.url}</a>`)
            }
        },
        {
            pattern: "hiking",
            type: "string",
            handler: async(response, ask, bot, message) => {
                ask.setVar('prefer', 'hiking')
                let events = await callEventApi('hiking');
                let i = Math.floor(Math.random()*events.length);
                let event = events[i];
                await bot.reply(message, `You may be interested in ${event.title}`)
                await bot.reply(message, event.desc);
                await bot.reply(message, `Here is the event details:<br/>Title: ${event.title}<br/>time: ${event.time}<br/>Location: ${event.location}<br/>Link: <a href="${event.url}" target="_blank">${event.url}</a>`)
            }
        },
        {
            pattern: "hike",
            type: "string",
            handler: async(response, ask, bot, message) => {
                ask.setVar('prefer', 'hiking')
                let events = await callEventApi('hiking');
                let i = Math.floor(Math.random()*events.length);
                let event = events[i];
                await bot.reply(message, `You may be interested in ${event.title}`)
                await bot.reply(message, event.desc);
                await bot.reply(message, `Here is the event details:<br/>Title: ${event.title}<br/>time: ${event.time}<br/>Location: ${event.location}<br/>Link: <a href="${event.url}" target="_blank">${event.url}</a>`)
            }
        },
        {
            pattern: "museum",
            type: "string",
            handler: async(response, ask, bot, message) => {
                ask.setVar('prefer', 'museum')
                let events = await callEventApi('museum');
                let i = Math.floor(Math.random()*events.length);
                let event = events[i];
                await bot.reply(message, `You may be interested in ${event.title}`)
                await bot.reply(message, event.desc);
                await bot.reply(message, `Here is the event details:<br/>Title: ${event.title}<br/>time: ${event.time}<br/>Location: ${event.location}<br/>Link: <a href="${event.url}" target="_blank">${event.url}</a>`)
            }
        },
        {
            pattern: "no",
            type: "string",
            handler: async(response, ask, bot, message) => {
                ask.setVar('prefer', null)
                let events = await callEventApi();
                let i = Math.floor(Math.random()*events.length);
                let event = events[i];
                await bot.reply(message, `You may be interested in ${event.title}`)
                await bot.reply(message, event.desc);
                await bot.reply(message, `Here is the event details:<br/>Title: ${event.title}<br/>time: ${event.time}<br/>Location: ${event.location}<br/>Link: <a href="${event.url}" target="_blank">${event.url}</a>`)
            }
        },
        {
            default: true,
            handler: async(response, ask, bot, message) => {
                await bot.reply(message, 'Sorry, there is only <strong>museum</strong>, <strong>hiking</strong> and <strong>shopping</strong> in my knowledge or you can tell me you have <strong>no</strong> preference on it');
                return await ask.repeat();
            }
        }
    ]);
    // let user ask for 'dont like', 'other'other suggestion, follow the last perference, default is quit conversion
    askEvent.ask({
        text: 'Do you like this event?',
        quick_replies: [
            { title: 'Yes, I like it', payload: 'Yes, I like it'},
            { title: 'No, do you have other suggestion?', payload: 'No, do you have other suggestion?'},
            { title: 'I don\'t want to tell you', payload: 'I don\'t to tell you' }
        ]
    }, [
        {
            pattern: 'yes',
            type: 'string',
            handler: async(response, ask, bot, message) => {
                await bot.reply(message, `I am so happy to help you.`);
            }
        },
        {
            pattern: 'other',
            type: 'string',
            handler: async(response, ask, bot, message) => {
                let events = await callEventApi('museum');
                let i = Math.floor(Math.random()*events.length);
                let event = events[i];
                await bot.reply(message, `You may be interested in ${event.title}`)
                await bot.reply(message, event.desc);
                await bot.reply(message, `Here is the event details:<br/>Title: ${event.title}<br/>time: ${event.time}<br/>Location: ${event.location}<br/>Link: <a href="${event.url}" target="_blank">${event.url}</a>`)
            }
        },
        {
            default: true,
            handler: async(response, ask, bot, message) => {
                await bot.reply(message, 'Ummmm, have a nice day.')
            }
        }
    ]);


    controller.addDialog(askEvent);

    //TODO: ask user what type of event they want

    controller.hears(["event", 'activities', 'activity'],
        'message', async (bot, message) => {
            /*
            await bot.reply(message, 'Hey, are you looking for some interesting events?');
            await timeout(200);
            let events = await callEventApi();
            let i = Math.floor(Math.random()*events.length);
            let event = events[i];
            await bot.reply(message, `You may be interested in ${event.title}`)
            await bot.reply(message, event.desc);
            await bot.reply(message, `Here is the event details:<br/>Title: ${event.title}<br/>time: ${event.time}<br/>Location: ${event.location}<br/>Link: <a href="${event.url}" target="_blank">${event.url}</a>`)
            */
           await bot.beginDialog('ask_event');
        });
}