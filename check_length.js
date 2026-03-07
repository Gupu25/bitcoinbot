import { wordlist as english } from '@scure/bip39/wordlists/english.js';
console.log('Wordlist length:', english.length);
if (english.length !== 2048) {
    console.log('Last element:', JSON.stringify(english[english.length - 1]));
    console.log('First element:', JSON.stringify(english[0]));
}
