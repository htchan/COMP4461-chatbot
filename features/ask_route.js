const { BotkitConversation } = require("botkit");
let apiHost = 'localhost:3000'

module.exports = function(controller) {
    let findRoute = new BotkitConversation('findRoute', controller);
    findRoute.say('Let me assist you in finding route?');
    findRoute.ask('First you have to tell me the starting point', [{
        default: true,
        handler: async(_, _1, _2, _3) => {}
    }], {key: 'from'});
    findRoute.ask('And, where you want to go?', [{
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
    }], {key: 'to'});

    findRoute.addMessage('Oh, I have find several paths from {{vars.from}} to {{vars.to}}, let me show you\n{{vars.method}}', 'found')

    findRoute.addMessage('I am sorry, I cannot find the route from {{vars.from}} to {{vars.to}}, but maybe we can try it on <a href="https://www.google.com/maps/dir/{{vars.from_url}}/{{vars.to_url}}" target="_blank">Google Map</a>?', 'not_found')


    controller.addDialog(findRoute);
    controller.hears([new RegExp(/how .+ go .+/i),"route"], 'message', async (bot, message) => {
        await bot.beginDialog('findRoute');
    });
}