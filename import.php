<!DOCTYPE html>
<html lang="de">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="cache-control" content="max-age=86400">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <meta name="description" content="Errate ein Wort in 6 Versuchen. Jeden Tag ein neues R&auml;tsel. Mit Umlauten (&auml;&ouml;&uuml;) und kostenlos.">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="style.css?cacheid=2023-08-08">
    <link rel="stylesheet" href="" id="colorblind-style">

    <link rel="manifest" href="/manifest.json">

    <meta property="og:url" content="https://wordle-deutsch.ch">
    <meta property="og:type" content="Wordle auf Deutsch mit Umlauten (&auml;&ouml;&uuml;)">
    <meta property="og:title" content="Wordle auf Deutsch mit Umlauten (&auml;&ouml;&uuml;)">
<!--     <meta property="og:description" content="Errate ein Wort in 6 Versuchen. Jeden Tag ein neues R&auml;tsel. Mit Umlauten (&auml;&ouml;&uuml;) und kostenlos."> -->
    <meta property="og:description" content="Errate ein deutsches Wort in 6 Versuchen">
    <meta property="og:image" content="https://wordle-deutsch.ch/logo_small.png">
    <html prefix="og: https://ogp.me/ns#">

    <meta name="twitter:card" content="summary_large_image">
    <meta property="twitter:domain" content="wordle-deutsch.ch">

    <link rel="manifest" href="manifest.json" />
    <link href="logo-tiny.png" rel="icon shortcut" />
    <link href="logo.png" rel="apple-touch-icon" />

    <link rel="stylesheet" href="//code.jquery.com/ui/1.13.1/themes/base/jquery-ui.css">

    <meta name="google-site-verification" content="Dcbf7f83KTs3jWQDAnYApXdS-WoUvXiRBvX1yy5IrSM" />
    <meta name="google-site-verification" content="do6EF9xdaKqcNocyxmRtWJHNpj3Ht1tFuOOEktJGu4Q" />

    <title>WORDLE auf Deutsch mit Umlauten (&auml;&ouml;&uuml;)</title>
</head>

<body style="margin: 10px">
    <header style="display: block">
        <h1><b><span style="font-size: 120%; color: #6abe00;">W</span>OR<span style="color: #fbce31;">DL</span>E</b> auf Deutsch mit Umlauten (&auml;&ouml;&uuml;)</h1>
    </header>


    <p><strong>Super, deine Einstellungen und Statistik wurden transferiert.<br>
    Bitte spiele von nun an nur noch hier auf <a href=https://wordle.ruinelli.ch target=_self>wordle.ruinelli.ch</a>!</strong></p>



</body>

</html>



<script type="text/javascript">

    var data = "<?php echo($_GET["lc"]) ?>";

    data = atob(data);
    
    console.log("Importing local storage from URL...")
    console.log(data)
    
    var data = JSON.parse(JSON.parse(data));
                
    // Write to local storage
    Object.keys(data).forEach(function (k) {
        localStorage.setItem(k, data[k]);
    });

</script> 
