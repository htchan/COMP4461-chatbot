const { BotkitConversation } = require("botkit")

module.exports = function(controller) {
    //TODO: implement the dialog for finding toilet
    let apiHost = 'localhost:3000';

    let callToiletApi = async(location) => {
        return await fetch(`http://${apiHost}/api/toilet.json`)
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

    let findToilet = new BotkitConversation('find_toilet', controller);
    findToilet.ask({
        text: 'I have to know where are you to help you find toilet, may I have your GPS permission?',
        quick_replies: [
            { title: 'Yes', payload: 'yes' },
            { title: 'No', payload: 'no' }
        ]
    },[
        {
            pattern: 'yes',
            type: 'string',
            handler: async(response_message, t, bot, message) => {
                let fake_location = 'hkust'
                t.setVar('location', fake_location);
                let toilet = await callToiletApi(t.vars.location);
                if (toilet) {
                    t.setVar('toilet', toilet);
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

    findToilet.addQuestion('How about telling me where you are?', [
        {
            default: true,
            handler: async(response, t, bot, mesage) => {
                t.setVar('location', response);
                let toilet = await callToiletApi(response);
                if (toilet) {
                    t.setVar('toilet', toilet);
                    return await t.gotoThread('found');
                } else {
                    t.setVar('location_url', response.replace(/ /g, "+"));
                    return await t.gotoThread('not_found');
                }
            }
        }
    ], '', 'ask_location');

    findToilet.addMessage('I have found the nearest toilet, the nearest toilet is {{vars.toilet.toilet}}, you can find it on <a href="{{vars.toilet.link}}" target="_blank">Google Map</a>', 'found');

    findToilet.addMessage('Sorry, I cant find any toilet near you in my database, maybe we can try <a href="https://www.google.com/maps/place/{{vars.location_url}}" target="_blank">Google Map</a>?', 'not_found')

    controller.addDialog(findToilet);

    controller.hears(['toilet'], 'message', async(bot, message) => {
        await bot.beginDialog('find_toilet');
    })

};