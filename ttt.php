<?php
	foreach($_POST as $key=>$value ) ${$key}=$value;
	foreach($_GET as $key=>$value ) ${$key}=$value;
	function GenPostQuery($path, $serv, $data)
	{
		$result = "POST " . $path . " HTTP/1.1\r\n";
		$result .= "Host: ". $serv . "\r\n";
		$result .= "Connection: Close\r\n";
		$result .= "Referer: " . $serv . "\r\n";
		$result .= "Content-Length: " . strlen($data). "\r\n\r\n";
		$result .= $data;
		return $result;
	}

	$path = "/";
	$serv = "127.0.0.1";
	//$data = "{ \"action\": \"register\", \"username\": \"user10\",\"password\": \"325glh\"}";
	$data = str_replace("\\\"", "\"" ,$data);
	
	$query = GenPostQuery($path, $serv, $data);
	
	$fp = fsockopen($serv, 8080);
	if (!$fp)
		die("Can't open socket.");

	fputs($fp, $query);
	$resp = "";
	while (!feof($fp)) 
		$resp .= fgets ($fp,128);
	$pos = strpos($resp, "{");
	$resp = substr($resp, $pos);
	echo $resp;
?>