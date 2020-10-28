const { BotkitConversation } = require("botkit");

module.exports = function(controller) {
    let findRoute = new BotkitConversation('findRoute', controller);
    findRoute.say('You looks hungry?');
    findRoute.say('I am going to help you find some restaurant suits you, please wait ...');


    controller.addDialog(findRoute);
    controller.hears(new RegExp(/how .+ go .+/i), 'message', async (bot, message) => {
        await bot.beginDialog('findRoute');
    });
}