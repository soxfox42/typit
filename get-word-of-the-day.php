<?php

    // IP anomizer (set last octet (IPv4) resp the last 80 bytes (IPv6) to zero
    $_SERVER['REMOTE_ADDR'] = preg_replace(['/\.\d*$/','/[\da-f]*:[\da-f]*$/'],['.0','0000:0000'], $_SERVER['REMOTE_ADDR']);

    $path = explode("/", __FILE__);
    $LOG_FOLDER = "/" . $path[1] . "/" . $path[2] . "/wordle-deutsch-logs/";

    if (isset($_GET['timestamp'])) {
        if (!is_dir($LOG_FOLDER)) {
            mkdir($LOG_FOLDER);
        }

        $words = json_decode(file_get_contents("target-words.json"), true)["data"];

        // temporarily use wordes generated with old (javascript mulberry32) algorithm
        // To be removed a while after we switched to server side words
        srand($_GET['timestamp']);
        $rand = mt_rand() / mt_getrandmax();

        $index = floor($rand * count($words));
        $target = str_rot13($words[$index]);

        echo("{ \"word\": \"$target\", \"index\": $index }");
        flush();

        // Get Geo-Location based on IP
        $ch = curl_init('http://ip-api.com/json/' . $_SERVER['REMOTE_ADDR'] . "?fields=33603849");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);
        $result = json_decode($response, true);
        $country = $result['country'];
        $region = $result['regionName'];
        $timezone = $result['offset'] / 3600;

        $log  = date("[Y-m-d, H:i:s] ") . $_GET['timestamp'] . ", " .  "$target, " . $_SERVER['REMOTE_ADDR'] . ", " . "$timezone, $country, $region, " . $_SERVER['HTTP_USER_AGENT'] . PHP_EOL;
        file_put_contents($LOG_FOLDER . "/" . date("Y-m-d") . '.log', $log, FILE_APPEND);

    }
    else {
        echo("{ \"error\": \"Missing parameter 'timestamp'!\"}");
    }

?>
