<?php
	header('Access-Control-Allow-Origin: *');
	include_once "pdo.php";

	$cmd = $_REQUEST['cmd'];
	$id = $_REQUEST['id'];
	$value = $_REQUEST['value'];
	

	$db;

	//echo json_encode( $_REQUEST );

	
	
	try{
		if( isset($cmd) || isset( $_REQUEST['tiedosto'])) // alustetaan PDO
			$db = new DBTalker();
		
		if( $cmd == "addRata" && isset($id)) // lisää radan
			$db->AddRata($id);
		// editoidaan rataa. nimeä ja osoitetta. 
		else if( $cmd == "editRata" && isset($id) && isset(	$value ) && isset( $_REQUEST['osoite'] ) )
			$db->EditRata($id, $value, $_REQUEST['osoite'] );
		else if( $cmd == "getRadat" ) // haetaan kaikki radat
			$db->GetRadat();
		else if( $cmd == "getPages" ) // haetaan kaikki sivut
			$db->GetSivut();
		else if( $cmd == "removePage" && isset($id) ) // poistetaan sivu
			$db->DeleteSivu( $id );
		else if( $cmd == "savePage" && isset( $value ) )
			$db->SaveSivu( $id, $value, $_REQUEST["eng"], $_REQUEST["tunniste"] );
		else if( isset( $_REQUEST['tiedosto'] ) )
			$db->SaveFile( $id );
		else if( $cmd == "getTiedostot" && isset( $id ))
			$db->GetFiles( $id );
		else if( $cmd == "poistaTiedosto" && isset( $id ) && isset( $value ) )
			$db->DeleteFile( $id, $value );
		else if( $cmd == "poistaTiedosto" && isset( $id ) )
			$db->DeleteFile( $id, null );
			
			
			
			
			
			
		else
			echo "else $cmd";

	
	
	}
	catch( Exception $e )
	{
		echo "Error catch: ".$e->getMessage();
	}

	
		
		
	/*	
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
	*/