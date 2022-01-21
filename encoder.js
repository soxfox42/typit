// ==== IMPORTS ====
import config from './config.js';

// ==== WORD HIDING ====
export function encode(word) {
    const encodingString = config.encodingString[config.language];
    const radix = encodingString.length;
    const offset = Math.floor(Math.random() * (radix - 1) + 1);
    const step = Math.floor(Math.random() * (radix - 1) + 1);
    let result = "";
    for (const [i, char] of word.split("").entries()) {
        let index = encodingString.indexOf(char);
        index += offset + i * step;
        index %= radix;
        result += encodingString[index];
    }
    result += encodingString[offset];
    result += encodingString[step];
    return result;
}

export function decode(code) {
    const encodingString = config.encodingString[config.language]; 
    const radix = encodingString.length;
    const offset = encodingString.indexOf(code.slice(-2, -1));
    const step = encodingString.indexOf(code.slice(-1));
    code = code.slice(0, -2);
    let result = "";
    for (const [i, char] of code.split("").entries()) {
        let index = encodingString.indexOf(char);
        index -= offset + i * step;
        index = ((index % radix) + radix) % radix;
        result += encodingString[index];
    }
    return result;
}
