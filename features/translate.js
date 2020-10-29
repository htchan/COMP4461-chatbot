const { BotkitConversation } = require("botkit")

module.exports = function(controller) {
    let apiHost = 'localhost:3000'

    let translate = new BotkitConversation('translate', controller);
    translate.ask('What phase you want to translate?', [
        {
            default: true,
            handler: async(response_text, t, bot, full_message) => {
                t.setVar('translate_text', response_text);
                return await fetch(`http://${apiHost}/api/translate.json`)
                .then( response => response.json() )
                .then( async(items) => {
                    let found = null;
                    for (let i in items) {
                        if (items[i].matches.every( match_str => response_text.search(new RegExp(match_str, "i")) >= 0)) {
                            found = items[i];
                            t.setVar('translateItem', items[i]);
                            break;
                        }
                    }
                    if (found) {
                        return await t.gotoThread('found');
                    } else {
                        return await t.gotoThread('not_found')
                    }
                })
            }
        }
    ]);

    
    translate.addMessage('The {{vars.translate_text}} actually means {{vars.translateItem.meaning}}', 'found')
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
    translate.addMessage('<a href="https://hkdic.my-helper.com/">This</a> is a website cotains many phase being used in HK, but it is n chinese, we may need Google translate assist.', 'not_found')

    controller.addDialog(translate);

    controller.hears(['translate'], 'message', async (bot, message) => {
        await bot.beginDialog('translate');
    })
}