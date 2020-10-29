let section = document.getElementsByTagName('section')[0];
let input = document.getElementById('messenger_input');
section.onclick = ()=> input.focus();

let help_button = document.getElementById('help');
help_button.onclick = () => Botkit.send('help');

function helpOnClick() {
    Botkit.send('help');
}