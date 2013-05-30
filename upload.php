<?php

	$id = time();
	$filename = "users/img".$id.".png";

	$success = file_put_contents(
	    $filename,
	    base64_decode( str_replace('data:image/png;base64,', '', $_REQUEST['imgBase64']) )
    );

	print ($success? "ok" : "error") . " " . $filename;
?>