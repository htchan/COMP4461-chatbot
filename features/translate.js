const { BotkitConversation } = require("botkit")

module.exports = function(controller) {
    let timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let apiHost = 'localhost:3000'

    let callTranslateApi = async(word) => {
        return await fetch(`http://${apiHost}/api/translate.json`)
        .then( response => response.json() )
        .then( async(items) => {
            let found = null;
            for (let i in items) {
                if (items[i].matches.every( match_str => word.search(new RegExp(match_str, "i")) >= 0)) {
                    found = items[i];
                    break;
                }
            }
            return found;
        })
    }

    let translate = new BotkitConversation('translate', controller);
    translate.ask('What phase you want to translate?', [
        {
            default: true,
            handler: async(response_text, t, bot, full_message) => {
                t.setVar('translate_text', response_text);
                let found = await callTranslateApi(response_text);
                if (found) {
                    t.setVar('translateItem', found);
                    return await t.gotoThread('found');
                } else {
                    return await t.gotoThread('not_found')
                }
            }
        }
    ]);

    
    translate.addMessage('The <strong>{{vars.translate_text}}</strong> actually means <strong>{{vars.translateItem.meaning}}</strong>', 'found')
    translate.addQuestion('There is a story for this phase, do you want to know', [
        {
            pattern:'yes',
            type:'string', 
            handler: async(_, t, _1, _2) => await t.gotoThread('story_time')
        },
        {
            pattern: 'no',
            type: 'string',
            handler: async(_, t, _1, _2) => await t.gotoThread('no_story_time')
        },
        {
            default: true,
            handler: async(_, t, _1, _2) => await t.gotoThread('give_up_story_time')
        }
    ], '', 'found');

    translate.addMessage('Let\'s start the story', 'story_time');
    translate.addMessage('{{vars.translateItem.story}}', 'story_time');

    translate.addMessage('ok, feel free to text me if you need other help😉', 'no_story_time');

    translate.addMessage('umm, maybe put it later', 'give_up_story_time');

    translate.addMessage('Sorry, I have not heard about the <strong>{{vars.translate_text}}</strong> before', 'not_found');
    translate.addMessage('But we can search it together !!!', 'not_found');
    translate.addMessage('<a href="https://hkdic.my-helper.com/">This</a> is a website cotains many phase being used in HK, but it is in chinese, we may need Google translate assist.', 'not_found')

    controller.addDialog(translate);

    controller.hears(['translate'], 'message', async (bot, message) => {
        await bot.beginDialog('translate');
    })

    controller.hears([new RegExp("may i know what is .+\\??", "i"),
    new RegExp("can you explain what is .+\\??", "i"),
    new RegExp("what does .+ mean\\??", "i"),
    new RegExp(".+ is what\\??", "i"),
    new RegExp("what is .+\\??", "i")], 'message', async(bot, message) => {
        let word = message.text.replace(/(may I know what is |can you explain what is |what does | mean| is what|what is |\?)/, '');
        let found = await callTranslateApi(word);
        if (found) {
            await bot.reply(message, `The <strong>${word}</strong> actually means <strong>${found.meaning}</strong>`);
        } else {
            await bot.reply(message, `sorry i dont really understand what you means 😓`)
            await bot.reply(message, `but I have search it on google, hope it can help you 😁`)
            await timeout(500);
            let url = `https://www.google.com/search?q=${word}`
            await bot.reply(message, `👉 <a href="${url}" target="_blank">${word}</a> 👈`)
        }
    })
    /*
    may I know what is jetso?
    can you explain what is jetso?
    what does jetso mean?
    jetso is what?
    what is jetso?
    */
}