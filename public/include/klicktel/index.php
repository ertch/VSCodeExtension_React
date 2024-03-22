<?php
	include("includes/adrserver.php");
	include("includes/functions.php");

	header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
	header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
	header("Cache-Control: no-store, no-cache, must-revalidate");
	header("Cache-Control: post-check=0, pre-check=0", false);
	header("Pragma: no-cache");




	$plz=$_REQUEST["plz"];


	$streets=array();
	$orte=array();


	$ads	=	new Address_Server( 0, 'streets2' );

	if($ads->Open()) {


		$ads->SetFields('city,street');
		$ads->Set('zip_code',$plz,'');
		/*$ads->SetParams('City','fuzzy');
		$ads->SetParams('Zip_Code','EXACT');
		$ads->SetParams('STREET','UNIQUE');
		$ads->SetParams('STREET','complete');*/


		$cnt	=	$ads->Execute();

		if( $cnt>0 ) {

			$res	=	$ads->GetResultList("Street");

			while( list( $num, $row ) = each( $res ) ) {

				$row['STREET']=replaceSpecialChars($row['STREET']);
				$row['CITY']=replaceSpecialChars($row['CITY']);

				if(!in_array($row['STREET'],$streets)) $streets[$row['STREET']]=$row['STREET'];
				if(!in_array($row['CITY'],$orte)) $orte[$row['CITY']]=$row['CITY'];

			}
		}

	}


	$returnArray=array(
					"cities" => filterArray($orte),
					"countCities" => count($orte),
					"streets" => filterArray($streets),
					"countStreets" => count($streets)
					);


	echo(json_encode($returnArray));
?>