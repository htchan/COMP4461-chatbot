module.exports = function(controller) {
    let timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    // ask place for sunset or taking ig photo
    let apiHost = 'localhost:3000';

    let callSuggestionApi = async(time) => {
    let apiHost = 'localhost:3000';
        return await fetch(`http://${apiHost}/api/special_event.json`)
        .then( response => response.json() )
        .then( data => data[time] );
    }

    controller.hears([(message) => message.text.search(/recommandation/i) >= 0 && message.text.search(/fun/i) >= 0, 'boring'], 'message', async(bot, message) => {
        let h = new Date().getHours();
        if (h < 6) { h = 'midnight'; }
        else if (h < 12) { h = 'morning'; }
        else if (h < 17) { h = 'afternoon'; }
        else if (h < 20) { h = 'evening'; }
        else { h = 'night'; }
        let timeRange = ['midnight', 'morning', 'afternoon', 'evening', 'night'];
        timeRange = timeRange.map( item => {
                                    let i = message.text.search(new RegExp(item, "i"));
                                    return i >= 0 ? {num: i, item: item} : '';
                                })
                                .filter( item => item != '')
                                .reduce( (value, item) => {
                                    if (value.num == -1) { return item; }
                                    if (value.num > item.num) { return item; }
                                    return value;
                                }, {num:-1, item:''});
        console.log(timeRange);
        if (timeRange.num >= 0) { h = timeRange.item; }
        let found = await callSuggestionApi(h);
        let i = Math.floor(Math.random() * found.length);
        let event = found[i];
        await bot.reply(message, event.name);
        await timeout(400);
        await bot.reply(message, event.desc);
        await timeout(200);
        await bot.reply(message, `It is at ${event.location}`);
        await timeout(1000);
        await bot.reply(message, `This is a picture people took there`);
        await bot.reply(message, `<img class="msg_img" src="${event.sample}"/><br/>Is it beautiful?`);
    });
}