// ==== INPUT LAYOUTS ====
let language = "DE";  // Pick one of "EN, "DE"
    
let keyboardLayout = {
    ["EN"]: ["Q,W,E,R,T,Y,U,I,O,P",
             "A,S,D,F,G,H,J,K,L",
             "Enter,Z,X,C,V,B,N,M,Backspace"],
    ["DE"]: [ "Q,W,E,R,T,Y,U,I,O,P,Ä",
             "A,S,D,F,G,H,J,K,L,Ö,Ü",
             "Enter,Z,X,C,V,B,N,M,Backspace"]
}

let keyboardValidation = {
    ["EN"]: /^[a-za]$/i,
    ["DE"]: /^[a-zäöü]$/i
}

let wordLength = 5;
let maxGuesses = 6;

export default {
    language, keyboardLayout, keyboardValidation, wordLength, maxGuesses
}
