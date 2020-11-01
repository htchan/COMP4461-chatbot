const { BotkitConversation } = require("botkit");
let apiHost = 'localhost:3000'

module.exports = function(controller) {
    let findRoute = new BotkitConversation('findRoute', controller);
    findRoute.say('Let me assist you in finding route?');
    findRoute.ask({
        text: 'Before helping you find the route, may I get your GPS permission?',
        quick_replies: [
            { title: 'Yes', payload: 'yes' },
            { title: 'No', payload: 'no' }
        ]
    }, [
        {
            pattern: 'yes',
            type: 'string',
            handler: async(response_message, r, bot, message) => {
                let fake_location = 'hkust'
                r.setVar('from', fake_location);
                return await r.gotoThread('ask_to');
            }
        },
        {
            pattern: 'no',
            type: 'string',
            handler: async(response, r, bot, message) => {
                return await r.gotoThread('ask_from');
            }
        },
        {
            defaule: true,
            handler: async(response, r, bot, message) => {
                await bot.reply(message, 'Sorry, I dont understand what you means, you can simply reply me <strong>yes</strong> or <strong>no</strong>');
                return await r.repeat();
            }
        }
    ]);

    findRoute.addQuestion('How about telling me where is your starting point?', [
        {
            default: true,
            handler: async(response, r, bot, mesage) => {
                r.setVar('from', response);
                return r.gotoThread('ask_to');
            }
        }
    ], '', 'ask_from');

    findRoute.addQuestion('And, where you want to go?', [{
        default: true,
        handler: async(response_text, r, bot, full_message) => {
            return await fetch(`http://${apiHost}/api/route.json`)
            .then( response => response.json())
            .then( async(items) => {
                let found = null;
                for (let i in items) {
                    if ((items[i].from.some( location_str => r.vars.from.search(new RegExp(location_str, "i")) >= 0))
                        && (items[i].to.some( location_str => response_text.search(new RegExp(location_str, "i")) >= 0))) {
                            found = items[i];
                            break;
                        }
                }
                if (found) {
                    let method = Object.keys(found.methods).reduce((value, i) => `${value} [**${i}**](${found.methods[i]})`, '');
                    r.setVar('method', method)
                    return await r.gotoThread('found');
                } else {
                    r.setVar('from_url', r.vars.from.replace(/ /g, '+'));
                    r.setVar('to_url', r.vars.to.replace(/ /g, '+'));
                    return await r.gotoThread('not_found');
                }
            })
        }
    }], '', 'ask_to');

    findRoute.addMessage('Oh, I have find several paths from {{vars.from}} to {{vars.to}}, let me show you:<br/>{{vars.method}}', 'found')

    findRoute.addMessage('I am sorry, I cannot find the route from {{vars.from}} to {{vars.to}}, but maybe we can try it on <a href="https://www.google.com/maps/dir/{{vars.from_url}}/{{vars.to_url}}" target="_blank">Google Map</a>?', 'not_found')


    controller.addDialog(findRoute);
    controller.hears([new RegExp(/how .+ go .+/i),"route", "travel"], 'message', async (bot, message) => {
        await bot.beginDialog('findRoute');
    });
}