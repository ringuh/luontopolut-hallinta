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
		else if( $cmd == "editRata" && isset($id) && isset(	$value )  )
			$db->EditRata($id, $value, $_REQUEST['osoite'], $_REQUEST["desc"], $_REQUEST["desc_eng"] );
		else if( $cmd == "getRadat" ) // haetaan kaikki radat
			$db->GetRadat($id);
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
		else if( $cmd == "tallennaReitti" && isset( $id ))
			$db->SavePath($id, $value);
		else if( $cmd == "haeReitti" )
			$db->GetPath($id);
		else if( $cmd == "tallennaMerkit" && isset( $id ) && isset( $value ))
			$db->SaveTargets($id, $value);
		else if( $cmd == "haeMerkit" )
			$db->GetTargets($id);
		else if( $cmd == "haeClient" )
			$db->GetClient();
		else if( $cmd == "getTagit" )
			$db->GetTags($id);
		else if( $cmd == "tallennaTagi")
			$db->AddTags($id, $value);
		else if( $cmd == "poistaTagi" && isset($id))
			$db->DeleteTag($id);
		else if( $cmd == "offline" )
			$db->GetOffline();	







		else
			echo "else ".json_encode($_REQUEST);



	}
	catch( Exception $e )
	{
		echo "Error catch: ".$e->getMessage();
	}

