// ==== Input Layouts ====
let language = "EN";  // Pick one of "EN, "DE" 
    
let keyboard_layout = {
    ["EN"]: ["Q,W,E,R,T,Y,U,I,O,P",
             "A,S,D,F,G,H,J,K,L",
             "Enter,Z,X,C,V,B,N,M,Backspace"],
    ["DE"]: [ "Q,W,E,R,T,Y,U,I,O,P,Ä",
             "A,S,D,F,G,H,J,K,L,Ö,Ü",
             "Enter,Z,X,C,V,B,N,M,Backspace"]
}

let keyboard_validation = {
    ["EN"]: /^[a-za]$/i,
    ["DE"]: /^[a-zaäöü]$/i
}

export default {
    language, keyboard_layout, keyboard_validation
}
