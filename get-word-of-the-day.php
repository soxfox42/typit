<?php

    // IP anomizer (set last octet (IPv4) resp the last 80 bytes (IPv6) to zero
    $_SERVER['REMOTE_ADDR'] = preg_replace(['/\.\d*$/','/[\da-f]*:[\da-f]*$/'],['.0','0000:0000'], $_SERVER['REMOTE_ADDR']);

    $path = explode("/", __FILE__);
    $LOG_FOLDER = "/" . $path[1] . "/" . $path[2] . "/wordle-deutsch-logs/";

    // words generated with old (javascript mulberry32) algorithm
    // To be removed a while after we switched to server side words
    $oldRandomizerAlgorithm = [
        "1645743600" => ["mjnat", 1915], // Fr., 25. Feb.
        "1645830000" => ["jnpuf", 1791], // Sa., 26. Feb.
        "1645916400" => ["mhasg", 1909], // So., 27. Feb.
        "1646002800" => ["xbqrk", 892], // Mo., 28. Feb.
        "1646089200" => ["ebyyr", 1413], // Di., 1. März
        "1646175600" => ["fraxr", 1496], // Mi., 2. März
        "1646262000" => ["xenax", 921], // Do., 3. März
        "1646348400" => ["fvehc", 1512], // Fr., 4. März
        "1646434800" => ["qngra", 282], // Sa., 5. März
        "1646521200" => ["ivgny", 1778], // So., 6. März
        "1646607600" => ["snygr", 446], // Mo., 7. März
        "1646694000" => ["nagha", 73], // Di., 8. März
        "1646780400" => ["ebfra", 1416], // Mi., 9. März
        "1646866800" => ["sbefg", 512], // Do., 10. März
        "1646953200" => ["xyrvr", 865], // Fr., 11. März
        "1647039600" => ["fghsr", 1595], // Sa., 12. März
        "1647126000" => ["pursf", 253], // So., 13. März
        "1647212400" => ["nqrya", 14], // Mo., 14. März
        "1647298800" => ["vzzre", 754], // Di., 15. März
        "1647385200" => ["jnntr", 1789], // Mi., 16. März
        "1647471600" => ["jbure", 1850], // Do., 17. März
    ];


    if (isset($_GET['timestamp'])) {
        if (!is_dir($LOG_FOLDER)) {
            mkdir($LOG_FOLDER);
        }

        $words = json_decode(file_get_contents("target-words.json"), true)["data"];

        // temporarily use wordes generated with old (javascript mulberry32) algorithm
        // To be removed a while after we switched to server side words
        if (array_key_exists($_GET['timestamp'], $oldRandomizerAlgorithm)) {
            $target = $oldRandomizerAlgorithm[$_GET['timestamp']][0];
            $index = $oldRandomizerAlgorithm[$_GET['timestamp']][1];
        }
        else {
            srand($_GET['timestamp']);
            $rand = mt_rand() / mt_getrandmax();

            $index = floor($rand * count($words));
            $target = str_rot13($words[$index]);
        }

        echo("{ \"word\": \"$target\", \"index\": $index }");
        flush();

        // Get Geo-Location based on IP
        $ch = curl_init('http://ip-api.com/json/' . $_SERVER['REMOTE_ADDR']);
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
