#!/bin/bash

process_words() {
    iconv -f iso8859-1 -t utf-8 $@ | sort | uniq | grep -E '^[a-z]{5}$' | sed -e 'y/àäéèêîïñóôû/aaeeeiinoou/' -e 's/\(.*\)/        "\1",/g'
}

cat >../words.js <<EOF
export default {
    targets: [
$(process_words scowl/final/{english,american,british}-words.{10,20,35,40})
    ],
    other: [
$(process_words scowl/final/{english,american,british}-words.{50,55,60,70,80})
    ],
};
EOF
