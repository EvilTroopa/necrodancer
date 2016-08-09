<?php

function cleanData($mData){
	if(is_array($mData)){
		foreach($mData as &$mSubData){
			$mSubData = cleanData($mSubData);
		}
	}else if(is_scalar($mData)){
		$mData = trim($mData);
	}else{
		return null;
	}
	return $mData;
}


$_POST = cleanData($_POST);

var_dump($_POST);

if(!isset($_POST['beatData']) || !isset($_POST['trackName'])){
	die('Wrong parameters');
}

if(!is_string($_POST['beatData']) || !is_string($_POST['trackName'])){
	die('Wrong parameter types');
}

if(preg_match('/^([0-9]+(\.[0-9]+)?;?)+$/', $_POST['beatData']) === 0){
	die('Wrong beat data format');
}

if(preg_match('/\.(mp3|ogg)$/i', $_POST['trackName']) === 0){
	die('Wrong track name format');
}

$aBeats = explode(';', $_POST['beatData']);
$sFileName = substr($_POST['trackName'], 0, -3) . 'txt';

header('Content-disposition: attachment; filename="' . $sFileName . '"');
header('Content-type: text/plain');
foreach($aBeats as $fBeat){
	echo round($fBeat, 4) . "\n";
}
exit();