const { BotkitConversation } = require("botkit");

module.exports = function(controller) {
    let findRestaurant = new BotkitConversation('findRestaurant', controller);
    findRestaurant.say('You looks hungry?');
    findRestaurant.say('I am going to help you find some restaurant suits you, please wait ...');


    controller.addDialog(findRestaurant);
    controller.hears(["restaurant", "hungry", "breakfast", "lunch", "dinner", "brunct", "tea"],
        'message', async (bot, message) => {
            await bot.beginDialog('findRestaurant');
        });
}