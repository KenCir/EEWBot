<?php

$baseURL = "http://www3.nhk.or.jp/sokuho/jishin/";
$rawReportXML = mb_convert_encoding(file_get_contents("{$baseURL}data/JishinReport.xml"), "UTF-8", "SJIS");
// 文字エンコード変えるために必要
$reportXML = explode("\n", $rawReportXML, 2);
$xmlData = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8" ?>' . $reportXML[1]);
$rawLatestQuakeInfo = mb_convert_encoding(file_get_contents($xmlData->record[0]->item[0]["url"]), "UTF-8", "SJIS");
$rawLatestQuakeInfo = mb_convert_encoding(file_get_contents("{$baseURL}data/JSA0220408220500_20220408220844.xml"), "UTF-8", "SJIS");
$latestQuakeInfoData = explode("\n", $rawLatestQuakeInfo, 2);
$latestQuakeInfo = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8" ?>' . $latestQuakeInfoData[1]);
$relatives = [];
var_dump($xmlData->record[0]->item[0]);
foreach ($latestQuakeInfo->Earthquake->Relative->children() as $relative) {
    $relatives[(string)$relative["Intensity"]] = array(
        "intensity" => (string)$relative["Intensity"],
        "points" => array(),
    );

    foreach ($relative->children() as $point) {
        $relatives[(string)$relative["Intensity"]]["points"][] = (string)$point["Name"];
    }
}

$quakeInfo = array(
    "id" => (string)$latestQuakeInfo->Earthquake["Id"],
    "time" => (string)$latestQuakeInfo->Earthquake["Time"],
    "epicenter" => (string)$latestQuakeInfo->Earthquake["Epicenter"],
    "depth" => (string)$latestQuakeInfo->Earthquake["Depth"],
    "magnitude" => (string)$latestQuakeInfo->Earthquake["Magnitude"],
    "intensity" => (string)$latestQuakeInfo->Earthquake["Intensity"],
    "latitudey" => (string)$latestQuakeInfo->Earthquake["Latitude"],
    "longitude" => (string)$latestQuakeInfo->Earthquake["Longitude"],
    "detail" => $baseURL . (string)$latestQuakeInfo->Earthquake->Detail,
    "local" => $baseURL . (string)$latestQuakeInfo->Earthquake->Local,
    "global" => $baseURL . (string)$latestQuakeInfo->Earthquake->Global,
    "relatives" => $relatives
);

$curl = curl_init("http://localhost:3000/quakeinfo");
curl_setopt($curl, CURLOPT_POST, TRUE);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($quakeInfo));
curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
$result = curl_exec($curl);
curl_close($curl);
