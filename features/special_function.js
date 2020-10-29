module.exports = function(controller) {
    // ask place for sunset or taking ig photo

    controller.hears([(message) => message.text.search(/recommandation/i) >= 0 && message.text.search(/fun/i) >= 0, 'boring'], 'message', async(bot, message) => {

    });
}