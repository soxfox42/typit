<?php

    // IP anomizer (set last octet (IPv4) resp the last 80 bytes (IPv6) to zero
    $_SERVER['REMOTE_ADDR'] = preg_replace(['/\.\d*$/','/[\da-f]*:[\da-f]*$/'],['.0','0000:0000'], $_SERVER['REMOTE_ADDR']);

    $path = explode("/", __FILE__);
    $LOG_FOLDER = "/" . $path[1] . "/" . $path[2] . "/wordle-deutsch-logs/";

    // words generated with old (javascript mulberry32) algorithm
    // To be removed a while after we switched to server side words
    $oldRandomizerAlgorithm = [       
        "1647298800" => ["vzzre", 754], // Di., 15. März
        "1647385200" => ["jnntr", 1787], // Mi., 16. März
        "1647471600" => ["jbure", 1848], // Do., 17. März
        "1647558000" => ["znqvt", 1050], // Fr., 18. März
        "1647644400" => ["fpunh", 1471], // Sa., 19. März
        "1647730800" => ["enggr", 1365], // So., 20. März
        "1647817200" => ["aremr", 1182], // Mo., 21. März
        "1647903600" => ["tyvrq", 590], // Di., 22. März
        "1647990000" => ["csrvy", 1274], // Mi., 23. März
        "1648076400" => ["orrgr", 147], // Do., 24. März
        "1648162800" => ["gbora", 1681], // Fr., 25. März
        "1648249200" => ["xbqrk", 892], // Sa., 26. März
        "1648335600" => ["znpub", 1046], // So., 27. März
        "1648422000" => ["eäfba", 1362], // Mo., 28. März
        "1648508400" => ["xrvar", 837], // Di., 29. März
        "1648594800" => ["jhefg", 1867], // Mi., 30. März
        "1648681200" => ["evyyr", 1396], // Do., 31. März
        "1648767600" => ["xbzov", 897], // Fr., 1. Apr.
        "1648854000" => ["cöory", 1300], // Sa., 2. Apr.
        "1648940400" => ["fgvrt", 1574], // So., 3. Apr.
        "1649026800" => ["cebfg", 1319], // Mo., 4. Apr.
        "1649113200" => ["qüsgr", 349], // Di., 5. Apr.
        "1649199600" => ["uläar", 740], // Mi., 6. Apr.
        "1649286000" => ["sbehz", 513], // Do., 7. Apr.
        "1649372400" => ["üoevt", 1737], // Fr., 8. Apr.
        "1649458800" => ["cnevf", 1253], // Sa., 9. Apr.
        "1649545200" => ["orvqr", 148], // So., 10. Apr.
        "1649631600" => ["gnffr", 1634], // Mo., 11. Apr.
        "1649718000" => ["qöare", 323], // Di., 12. Apr.
        "1649804400" => ["yneir", 976], // Mi., 13. Apr.
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
