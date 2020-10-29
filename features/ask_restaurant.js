const { BotkitConversation } = require("botkit");

module.exports = function(controller) {
    let apiHost = 'localhost:3000';

    let callRestaurantApi = async(location) => {
        return await fetch(`http://${apiHost}/api/restaurant.json`)
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

    let findRestaurant = new BotkitConversation('findRestaurant', controller);
    findRestaurant.say('You looks hungry?');
    findRestaurant.ask('Before helping you find restaurant, may I get your GPS permission?', [
        {
            pattern: 'yes',
            type: 'string',
            handler: async(response_message, r, bot, message) => {
                let fake_location = 'hkust'
                r.setVar('location', fake_location);
                let found = await callRestaurantApi(r.vars.location);
                if (found) {
                    let suggestion = Object.keys(found.restaurants).reduce((value, i) => `${value} [**${i}**](${found.restaurants[i]})`, '');
                    r.setVar('suggestion', suggestion);
                    return await r.gotoThread('found');
                } else {
                    r.setVar('location_url', fake_location.replace(/ /g, "+"));
                    return await r.gotoThread('not_found');
                }
            }
        },
        {
            pattern: 'no',
            type: 'string',
            handler: async(response, r, bot, message) => {
                return await r.gotoThread('ask_location');
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

    findRestaurant.addQuestion('How about telling me where you are?', [
        {
            default: true,
            handler: async(response, r, bot, mesage) => {
                r.setVar('location', response);
                let found = await callRestaurantApi(response);
                if (found) {
                    let suggestion = Object.keys(found.restaurants).reduce((value, i) => `${value} [**${i}**](${found.restaurants[i]})`);
                    r.setVar('suggestion', suggestion);
                    return await r.gotoThread('found');
                } else {
                    r.setVar('location_url', response.replace(/ /g, "%20"));
                    return await r.gotoThread('not_found');
                }
            }
        }
    ], '', 'ask_location');

    findRestaurant.addMessage('I have found some restaurants, let check them out: <br/> {{vars.suggestion}}', 'found');

    findRestaurant.addMessage('Sorry, I cant find any restaurant next to you in my database, we can try finding it in <a href="https://www.openrice.com/en/hongkong/restaurants?where={{vars.location_url}}" target="_blank">OpenRice</a>? It is a webpage for finding restaurant in Hong Kong.', 'not_found')


    controller.addDialog(findRestaurant);
    controller.hears(["restaurant", "hungry", "breakfast", "lunch", "dinner", "brunct", "tea"],
        'message', async (bot, message) => {
            await bot.beginDialog('findRestaurant');
        });
}