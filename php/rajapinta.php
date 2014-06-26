<?php
	header('Access-Control-Allow-Origin: *');
	include_once "pdo.php";

	$cmd = $_REQUEST['cmd'];
	$id = $_REQUEST['id'];
	$paikka = $_REQUEST['paikka'];
	$latitude = $_REQUEST['latitude'];
	$longitude = $_REQUEST['longitude'];
	$value = $_REQUEST['value'];
	$tunniste = $_REQUEST['tunniste'];

	$db;

	//echo json_encode( $_REQUEST );

	if( isset($cmd) )
		$db = new DBTalker();

	if( $cmd == "addPaikka" && isset($paikka))
		$db->AddPlace($paikka);

	else if( $cmd == "getPaikat")
		$db->GetPlaces();

	else if( $cmd == "addSpot" && isset($id) && isset($latitude) && isset($longitude))
		$db->AddSpot( $id, $latitude, $longitude );

	else if( $cmd =="getSpots" && isset($id))
		$db->GetSpots($id);

	else if( $cmd == "addSpotValue" && isset($id) && isset($value))
		$db->AddSpotValue($id, $value);

	else if( $cmd == "getSpotValue" && isset( $id ))
		$db->GetSpotValue($id);
	else if( $cmd == "resetPaikka" && isset( $id ))
		$db->ResetSpot($id);
	else if( $cmd == "savePage" && isset($value ) && isset( $tunniste ) )
		$db->SavePage( $id, $value, $tunniste );
	else if( $cmd == "getPages" )
		$db->GetPages();
	else if( $cmd == "getPage" && isset( $id ) )
		$db->GetPage($id);
	else if( $cmd == "getPageLinked" && isset( $id ) )
		$db->GetPageLinked( $id );
	else if( $cmd == "linkPages" && isset( $id ) && isset( $value ) )
		$db->LinkPages( $id, $value );
	else if( $cmd == "addReitti" && isset( $id ) && isset( $value ) )
		$db->AddReitti( $id, $value );
	else if( $cmd == "getReitti" && isset( $id ) )
		$db->GetReitti( $id ) ;
	else if( $cmd == "offline" )
		$db->Offline();
	else if( $cmd =="haeTiilit")
		$db->GetTiles();
	
		
		
		
	else if( isset( $_REQUEST['Kuva'] ) )
	{
		echo json_encode( $_REQUEST )."<hr>";
		$allowedExts = array("gif", "jpeg", "jpg", "png");
		$temp = explode(".", $_FILES["file"]["name"]);
		$extension = end($temp);
		if (!file_exists("upload/")) {
					mkdir("upload/");
		}
		$baseUrl = "upload/$id/";
		if ((($_FILES["file"]["type"] == "image/gif")
		|| ($_FILES["file"]["type"] == "image/jpeg")
		|| ($_FILES["file"]["type"] == "image/jpg")
		|| ($_FILES["file"]["type"] == "image/pjpeg")
		|| ($_FILES["file"]["type"] == "image/x-png")
		|| ($_FILES["file"]["type"] == "image/png"))
		&& ($_FILES["file"]["size"] < 2000000)
		&& in_array($extension, $allowedExts)) {
		  if ($_FILES["file"]["error"] > 0) {
			echo "Return Code: " . $_FILES["file"]["error"] . "<br>";
		  } else {
			echo "Upload: " . $_FILES["file"]["name"] . "<br>";
			echo "Type: " . $_FILES["file"]["type"] . "<br>";
			echo "Size: " . ($_FILES["file"]["size"] / 1024) . " kB<br>";
			echo "Temp file: " . $_FILES["file"]["tmp_name"] . "<br>";
			if (file_exists($baseUrl . $_FILES["file"]["name"])) {
			  echo $_FILES["file"]["name"] . " already exists. ";
			} else {
			  move_uploaded_file($_FILES["file"]["tmp_name"],
			   $baseUrl . $_FILES["file"]["name"]);
			  echo "Stored in: " . $baseUrl . $_FILES["file"]["name"];
			}
		  }
		} else {
		  echo "Invalid file";
		}
	}