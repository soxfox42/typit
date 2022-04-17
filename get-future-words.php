<?php

    $words = json_decode(file_get_contents("target-words.json"), true)["data"];

    $day = date("d");
    $month = date("m");
    $year = date("y");
    
    
    $timestamp = mktime(0, 0, 0, $month, $day, $year); // Today

    echo("$timestamp, $month, $day, $year<br><br>\n");
    
    for ($i = 0; $i < 31; $i++) {
        
        srand($timestamp + $i * 24*3600);
        $rand = mt_rand() / mt_getrandmax();

        $index = floor($rand * count($words));
    //     $target = str_rot13($words[$index]);
        $target = ($words[$index]);

        echo("{ \"word\": \"$target\", \"index\": $index }<br>\n");
        flush();
    }
?>
