const { BotkitConversation } = require("botkit")

module.exports = function(controller) {
    //TODO: implement the dialog for finding toliet
    let apiHost = 'localhost:3000';

    let callTolietApi = async(location) => {
        return await fetch(`http://${apiHost}/api/toliet.json`)
        .then( response => response.json() )
        .then( async(items) => {
            let found = null;
            for (let i in items) {
                if (items[i].location.some( location_str => location.search(new RegExp(location_str, "i")) >= 0)) {
                    found = items[i];
                    break;
                }
            }
            return found;
        })
    }

    let findToliet = new BotkitConversation('find_toliet', controller);
    findToliet.ask('I have to know where are you to help you find toliet, may i get your permission on GPS?',[
        {
            pattern: 'yes',
            type: 'string',
            handler: async(response_message, t, bot, message) => {
                let fake_location = 'hkust'
                t.setVar('location', fake_location);
                let toliet = await callTolietApi(t.vars.location);
                if (toliet) {
                    t.setVar('toliet', toliet.toliet);
                    return await t.gotoThread('found');
                } else {
                    t.setVar('location_url', fake_location.replace(/ /g, "+"));
                    return await t.gotoThread('not_found');
                }
            }
        },
        {
            pattern: 'no',
            type: 'string',
            handler: async(response, t, bot, message) => {
                return await t.gotoThread('ask_location');
            }
        },
        {
            defaule: true,
            handler: async(response, t, bot, message) => {
                await bot.reply(message, 'Sorry, I dont understand what you means, you can simply reply me <strong>yes</strong> or <strong>no</strong>');
                return await t.repeat();
            }
        }
    ]);

    findToliet.addQuestion('How about telling me where you are?', [
        {
            default: true,
            handler: async(response, t, bot, mesage) => {
                t.setVar('location', response);
                let toliet = await callTolietApi(response);
                if (toliet) {
                    t.setVar('toliet', toliet.toliet);
                    return await t.gotoThread('found');
                } else {
                    t.setVar('location_url', response.replace(/ /g, "+"));
                    return await t.gotoThread('not_found');
                }
            }
        }
    ], '', 'ask_location');

    findToliet.addMessage('I have found the nearest toliet, the nearest toliet is {{vars.toliet}}, hope it can help you', 'found');

    findToliet.addMessage('Sorry, I cant find any toliet near you in my database, maybe we can try <a href="https://www.google.com/maps/place/{{vars.location_url}}" target="_blank">Google Map</a>?', 'not_found')

    controller.addDialog(findToliet);

    controller.hears(['toliet'], 'message', async(bot, message) => {
        await bot.beginDialog('find_toliet');
    })

};