<?php


	function filterArray($arr) {

		krsort($arr);

		$returnArray=array();

		foreach($arr as $key => $item) {
			$returnArray[utf8_encode($key)]=utf8_encode($item);
		}

		return ($returnArray);
	}


	function replaceSpecialChars($s) {

		$s=str_replace("'","",$s);
		$s=str_replace("\"","",$s);

		return $s;
	}


?>
