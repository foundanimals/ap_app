<?php
	// retrieve data from API set from $_POST['data_url']
	$url = $_POST['data_url'];
 
	if (empty($url)) {
	    echo 'Please provide a URL';
	} else {
		// init
		$ch = curl_init();
	 
		// set options
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HEADER, false);
	 
		// execute
		$output = curl_exec($ch);
	 
		if ($output === FALSE) {
			echo "cURL Error: " . curl_error($ch);
		} else {
			echo $output;
		}
	 
	 	// close instance
		curl_close($ch);
	}
?>