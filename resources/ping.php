<?php

$start_time = date('H:i:s').substr((string) fmod(microtime(true), 1), 1, 4);
$log = 'Job started at : '. $start_time . '<br>';

$log = $log . '&nbsp;&nbsp;&nbsp;&nbsp;' . ping("https://mifi.glitch.me");


function ping($urlTo) {
    $start_time = date('H:i:s').substr((string) fmod(microtime(true), 1), 1, 4);
    $agent = 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.0.3705; .NET CLR 1.1.4322)';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_VERBOSE, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, $agent);
    curl_setopt($ch, CURLOPT_URL, $urlTo);
    curl_setopt($ch, CURLOPT_TIMEOUT, 1000);
    $result = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if($statusCode >= 300) LOG_ERRORS($ch,$urlTo,$result);
    $respSize = curl_getinfo($ch, CURLINFO_SIZE_DOWNLOAD);
    $totalTime = curl_getinfo($ch, CURLINFO_TOTAL_TIME_T) / 1000;
    $ip = curl_getinfo($ch, CURLINFO_PRIMARY_IP);
    $current_date = date('[Y-m-d H:i:s] ');
    $end_time = date('H:i:s').substr((string) fmod(microtime(true), 1), 1, 4);
    return $urlTo.' : '.$current_date . ' : Response: ' . $statusCode . ' | Size: ' . $respSize . ' | Time: ' . $totalTime . 'ms | Task started at ' . $start_time . ' | Task end at ' . $end_time . ' | Ip: ' . $ip . '<br>';
}

function LOG_ERRORS($ch,$url,$result){
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $respSize = curl_getinfo($ch, CURLINFO_SIZE_DOWNLOAD);
    $totalTime = curl_getinfo($ch, CURLINFO_TOTAL_TIME_T) / 1000;
    $ip = curl_getinfo($ch, CURLINFO_PRIMARY_IP);
    $current_date = date('[Y-m-d H:i:s] ');
    $fename = 'ERRORPAGES/'.floor(microtime(true)).'.html';

    $elog = 'ERROR OCCURRED for : '. $url . '<br>';
    $elog = $elog.$current_date .' - Response: ' . $statusCode . ' | Size: ' . $respSize . ' | Time: ' . $totalTime.'ms | link: <a  href="'.$fename.'" target="_blank">open page</a> <br>' . PHP_EOL;
    $fpe = fopen('error.txt', 'a');
    $fpp = fopen($fename , 'a');
    fwrite($fpp , $result);
    fwrite($fpe, $elog);
    fclose($fpe);
    fclose($fpp);
}





$end_time = date('H:i:s').substr((string) fmod(microtime(true), 1), 1, 4);
$log = $log.'Job ended at : '. $end_time . PHP_EOL;
$fp = fopen('data.txt', 'a');
fwrite($fp, $log);
fclose($fp);

?>