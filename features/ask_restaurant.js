const { BotkitConversation } = require("botkit");

module.exports = function(controller) {
    let apiHost = 'localhost:3000';

    let callRestaurantApi = async(location, type=null) => {
        return await fetch(`http://${apiHost}/api/restaurant.json`)
        .then( response => response.json() )
        .then( async(items) => {
            let found = null;
            for (let i in items) {
                if (items[i].location.some( location_str => location.search(new RegExp(location_str, "i")) >= 0)) {
                    found = items[i].restaurants;
                    if (type) {
                        found = found.map( item => item.type == type);
                    }
                    break;
                }
            }
            return found;
        })
    }

    let findRestaurant = new BotkitConversation('findRestaurant', controller);
    findRestaurant.say('You look hungry?');
    findRestaurant.ask({
        text: 'Before helping you find restaurant, may I get your GPS permission?',
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
                r.setVar('location', fake_location);
                let found = await callRestaurantApi(r.vars.location);
                r.setVar('location_url', fake_location.replace(/ /g, "+"));
                if (found) {
                    r.setVar('suggestion', found);
                    return await r.gotoThread('preference');
                } else {
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
                r.setVar('location_url', response.replace(/ /g, "%20"));
                if (found) {
                    r.setVar('suggestion', found);
                    return await r.gotoThread('preference');
                } else {
                    return await r.gotoThread('not_found_location');
                }
            }
        }
    ], '', 'ask_location');

    findRestaurant.addQuestion({
        text: 'I have search some restaurant for you, do you have any preference on the food?',
        quick_replies: [
            { title: 'Local Food', payload:'I like to have some local food' },
            { title: 'Chinese Food', payload:'I like to have some Chinese food' },
            { title: 'Korean Food', payload:'I like to have some Korean food' },
            { title: 'American Food', payload:'I like to have some American food' },
            { title: 'Japanese Food', payload:'I like to have some Japanese food' },
            { title: 'other type', payload:'I like to have other types' },
            { title: 'No preference', payload:'I have no preference on it' },
        ]
    },[
        {
            pattern: 'local',
            type: 'string',
            handler: async(response, r, bot, message) => {
                let found = r.vars.suggestion.filter( item => item.type === 'local');
                if (found.length > 0) {
                    let suggestion = found.reduce((value, item) => `${value} [**${item.name}**](${item.url})`, '');
                    r.setVar('suggestion', suggestion);
                    return await r.gotoThread('found');
                } else {
                    r.setVar('type', response);
                    return await r.gotoThread('not_found_type');
                }

            }
        },
        {
            pattern: 'america',
            type: 'string',
            handler: async(response, r, bot, message) => {
                let found = r.vars.suggestion.filter( item => item.type === 'american');
                if (found.length > 0) {
                    let suggestion = found.reduce((value, item) => `${value} [**${item.name}**](${item.url})`, '');
                    r.setVar('suggestion', suggestion);
                    return await r.gotoThread('found');
                } else {
                    r.setVar('type', response);
                    return await r.gotoThread('not_found_type');
                }

            }
        },
        {
            pattern: 'chinese',
            type: 'string',
            handler: async(response, r, bot, message) => {
                let found = r.vars.suggestion.filter( item => item.type === 'chinese');
                if (found.length > 0) {
                    let suggestion = found.reduce((value, item) => `${value} [**${item.name}**](${item.url})`, '');
                    r.setVar('suggestion', suggestion);
                    return await r.gotoThread('found');
                } else {
                    r.setVar('type', response);
                    return await r.gotoThread('not_found_type');
                }

            }
        },
        {
            pattern: 'korean',
            type: 'string',
            handler: async(response, r, bot, message) => {
                let found = r.vars.suggestion.filter( item => item.type === 'korean');
                if (found.length > 0) {
                    let suggestion = found.reduce((value, item) => `${value} [**${item.name}**](${item.url})`, '');
                    r.setVar('suggestion', suggestion);
                    return await r.gotoThread('found');
                } else {
                    r.setVar('type', response);
                    return await r.gotoThread('not_found_type');
                }

            }
        },
        {
            pattern: 'japanese',
            type: 'string',
            handler: async(response, r, bot, message) => {
                let found = r.vars.suggestion.filter( item => item.type === 'japanese');
                console.log(found)
                if (found.length > 0) {
                    let suggestion = found.reduce((value, item) => `${value} [**${item.name}**](${item.url})`, '');
                    r.setVar('suggestion', suggestion);
                    return await r.gotoThread('found');
                } else {
                    r.setVar('type', response);
                    return await r.gotoThread('not_found_type');
                }

            }
        },
        {
            pattern: 'other',
            type: 'string',
            handler: async(response, r, bot, message) => {
                let found = r.vars.suggestion.filter( item => item.type === 'other');
                if (found.length > 0) {
                    let suggestion = found.reduce((value, item) => `${value} [**${item.name}**](${item.url})`, '');
                    r.setVar('suggestion', suggestion);
                    return await r.gotoThread('found');
                } else {
                    r.setVar('type', response);
                    return await r.gotoThread('not_found_type');
                }

            }
        },
        {
            pattern: 'no preference',
            type: 'string',
            handler: async(response, r, bot, message) => {
                let found = r.vars.suggestion;
                if (found) {
                    let suggestion = found.reduce((value, item) => `${value} [**${item.name}**](${item.url})`, '');
                    r.setVar('suggestion', suggestion);
                    return await r.gotoThread('found');
                } else {
                    r.setVar('type', response);
                    return await r.gotoThread('not_found_type');
                }

            }
        },
        {
            default: true,
            handler: async(response, r, bot, message) => {
                r.setVar('type', response);
                return await r.gotoThread('not_found_type');
            }
        }
    ], '', 'preference');

    findRestaurant.addMessage('I have searched some restaurants😛, let check them out: <br/> {{vars.suggestion}}', 'found');

    findRestaurant.addMessage('Sorry, I cant find any restaurant next to you in my database, we can try finding it in <a href="https://www.openrice.com/en/hongkong/restaurants?where={{vars.location_url}}" target="_blank">OpenRice</a>? It is a webpage for finding restaurant in Hong Kong.', 'not_found_location')

    findRestaurant.addMessage('Sorry, I cant find any restaurant match your preference in my database, maybe we can check it in <a href="https://www.openrice.com/en/hongkong/restaurants?where={{vars.location_url}}&what={{vars.type}}" target="_blank">OpenRice</a>?', 'not_found_type')

    findRestaurant.addMessage('Ask me another question', 'not_found_location');
    findRestaurant.addMessage('Ask me another question', 'not_found_type');


    controller.addDialog(findRestaurant);
    controller.hears(["restaurant", "hungry", "breakfast", "lunch", "dinner", "brunch", "tea", 'eat', 'food'],
        'message', async (bot, message) => {
            await bot.beginDialog('findRestaurant');
        });
}