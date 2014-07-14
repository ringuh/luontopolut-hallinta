<?php
	class DBTalker
	{
		private $db;
		private $dbhost_ = "mydb.tamk.fi";
		private $dbname_ = "dbe2avaaka1";
		private $dbuser_ = "e2avaaka";
		private $dbpass_ = "f96f3LJD";
		private $rata_ 	 = "tlp_rata";
		private $kohde_  = "tlp_kohde";
		private $tagi_	 = "tlp_rata_tagit";
		private $reitti_ = "tlp_reitti";
		private $sivu_ 	 = "tlp_sivu";


		function __construct() {
			$this->db = new PDO('mysql:host='.$this->dbhost_.';dbname='.$this->dbname_.';charset=utf8', $this->dbuser_, $this->dbpass_);
			$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		}
		function Julkaistu()
		{
			$in = "(";
				for( $i = 0; $i < count($_REQUEST['julkaistut']); ++$i )
				{
					if( $i == 0 )
						$in .= $_REQUEST['julkaisut'];
					else
						$in .= ','.$_REQUEST['julkaisut'];
				}
			$in .= ')';

			return $in;
		}

		function GetClient()
		{
			$ret = array();	// haetaan kaikki julkaisuvalmiit radat
			$str = "select * from $this->rata_";
			$sth = $this->db->prepare($str);
			$sth->execute();
			$tmp = $sth->fetchAll(PDO::FETCH_COLUMN);
			$sth->execute();
			$ret["radat"] = $sth->fetchAll(PDO::FETCH_CLASS);
			$ret["merkit"] = array();
			$ret["reitit"] = array();
			$ret["tagit"] = array();
			$ret["sivut"] = array();

			//echo json_encode( $tmp );


			foreach( $tmp as $rata )
			{

				$id = $rata["id"];

				// merkit
				$str = "select * from $this->kohde_ where tlp_rata_id = :id";
				$sth = $this->db->prepare($str);
				$sth->bindParam(":id", $id, PDO::PARAM_INT );
				$sth->execute();
				$ret["merkit"][$id] = $sth->fetchAll(PDO::FETCH_CLASS);	


				// reitit
				$str = "select * from $this->reitti_ where tlp_rata_id = :id";
				$sth = $this->db->prepare($str);
				$sth->bindParam(":id", $id, PDO::PARAM_INT );
				$sth->execute();
				$ret["reitit"][$id] = $sth->fetchAll(PDO::FETCH_CLASS);	

				// TAGIT
				$str = "select * from $this->tagi_ WHERE tlp_rata_id = :id";
				$sth = $this->db->prepare($str);
				$sth->bindParam(":id", $id, PDO::PARAM_INT );
				$sth->execute();
				$ret["tagit"][$id] = $sth->fetchAll(PDO::FETCH_CLASS);



			}
			// SIVUT
			$str = "select * from $this->sivu_";
			$sth = $this->db->prepare($str);
			$sth->execute();
			$ret["sivut"] = $sth->fetchAll(PDO::FETCH_CLASS);

			echo json_encode($ret);
		}

		function AddRata( $id )
		{
			$str = "select * from $this->rata_ where nimi = :nimi";

			$sth = $this->db->prepare($str);
			$sth->bindParam(':nimi', $id, PDO::PARAM_STR, 45);
			$sth->execute();
			if( $sth->rowCount() != 0)
				throw new Exception( "paikka $place oli jo olemassa" );


			$str = "INSERT INTO $this->rata_ ( nimi ) values ( :nimi )";
			$sth = $this->db->prepare($str);
			$sth->bindParam(':nimi', $id, PDO::PARAM_STR, 45);
			$sth->execute();

			if( $sth->rowCount() == 1)
				echo "success - added $place";
		}

		function EditRata( $id, $value, $osoite, $desc, $desc_eng)
		{
			if( $value == -1 ) // jos value -1 poistetaan annettu $id
			{	// muista poistaa KAIKKI viittaukset
			/*
				drop table tlp_kohde;
				drop table tlp_sivu;
				drop table tlp_reitti;
				drop table tlp_rata_tagit;
				drop table tlp_rata;
			
			*/
				// poistetaan rataan liittyvät viitteet
				$this->DeleteKohde( null, $id );
				$this->DeletePath( $id );
				$this->DeleteTagit( $id );
				$this->DeleteRata( $id );


			}
			else
			{
				$str = "UPDATE `tlp_rata` "
						."SET "
						."`nimi` = :nimi,"
						."`osoite` = :osoite,"
						."`kuvaus` = :kuvaus,"
						."`kuvaus_eng` = :desc "
						."WHERE `id` = :id";

				$sth = $this->db->prepare($str);
				$sth->bindParam(":id", $id, PDO::PARAM_INT);
				$sth->bindParam(":nimi", $value, PDO::PARAM_STR);
				$sth->bindParam(":osoite", $osoite, PDO::PARAM_STR);
				$sth->bindParam(":kuvaus", $desc, PDO::PARAM_STR);
				$sth->bindParam(":desc", $desc_eng, PDO::PARAM_STR);
				echo $str;
				echo "xxxx: $id, $value, $osoite, $desc, $desc_eng |||";
				$sth->execute();

				echo "edit success";
			}
		}

		function GetRadat($id) // haetaan lista radoista
		{
			$str = "";
			if( $id == null) // haetaan KAIKKI radat for hallinta
			{
				$str = "select * from $this->rata_";
				$sth = $this->db->prepare($str);
			}

			else
			{
				$str = "select * from $this->rata_ WHERE id = :id";
				$sth = $this->db->prepare($str);
				$sth->bindParam(":id", $id, PDO::PARAM_INT);
			}


			$sth->execute();
			echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS) );			
		}

		function GetSivut() // haetaan lista radoista
		{

			$str = "select * from $this->sivu_";
			$sth = $this->db->prepare($str);
			$sth->execute();
			echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS) );			
		}

		function SaveSivu( $id, $value, $eng, $tunniste )
		{

			$saveID = -1;

			if( $id == -1 )
			{
				$str = "INSERT INTO $this->sivu_ ( nimi ) values ( :tunniste )";
				$sth = $this->db->prepare($str);

				$sth->bindParam(':tunniste', $tunniste, PDO::PARAM_STR );
				$sth->execute();

				if( $sth->rowCount() == 1)
					echo $saveID = $this->db->lastInsertId();
				else
					throw new Exception("Sivun tallennus epäonnistui");
			}
			else
			{
				$str = "UPDATE $this->sivu_ SET nimi=:tunniste WHERE id=:id";

				$sth = $this->db->prepare($str);
				$sth->bindParam(':id', $id, PDO::PARAM_INT );
				$sth->bindParam(':tunniste', $tunniste, PDO::PARAM_STR );
				$sth->execute();
				$saveID = $id;

				echo $id;
			}

			if( $saveID > -1 ) // mikäli rivi onnistuttiin lisäämään, tallennetaan tiedostot
			{
				if (!file_exists("upload"))
					mkdir("upload");

				if (!file_exists("upload/$saveID"))
					mkdir("upload/$saveID");

				file_put_contents( "upload/$saveID/index.html", $value );
				file_put_contents( "upload/$saveID/index_eng.html", $eng );

			}
		}

		function SavePath($id, $value)
		{
			file_put_contents("loki.txt", count($value)."\n\n" );
			file_put_contents("loki.txt", json_encode(end($value))."\n\n", FILE_APPEND );
			$indx = intval($_REQUEST['index']);
			$max = intval($_REQUEST["maxindex"]);
			if( $indx == 0 || !isset($_REQUEST['index']) )
				$this->DeletePath($id);

			if($value == null)
				return;

			$str = "INSERT INTO $this->reitti_ ( tlp_rata_id, latitude, longitude, altitude, distance ) values ";

			for( $i = 0; $i < count($value); ++$i )
			{
				if( $value[$i]["lng"] == null)
					continue;
				if( $i == 0)
					$str .= "( :id$i, :lat$i, :lng$i, :alt$i, :dist$i )";
				else
					$str .= ",( :id$i, :lat$i, :lng$i, :alt$i, :dist$i )";
			}

			$sth = $this->db->prepare($str);



			for( $i = 0; $i < count($value); ++$i )
			{
				if( $value[$i]["lng"] == null)
					continue;
				$sth->bindParam(":id$i", $id, PDO::PARAM_INT );
				$sth->bindParam(":lat$i", $value[$i]["lat"], PDO::PARAM_STR );
				$sth->bindParam(":lng$i", $value[$i]["lng"], PDO::PARAM_STR );
				$sth->bindParam(":alt$i", $value[$i]["altitude"], PDO::PARAM_STR );
				$sth->bindParam(":dist$i", $value[$i]["distance"], PDO::PARAM_STR );
			}	
			if( $indx < $max)
				echo "plxsend:".$indx+1;
			else
				echo "done";
			file_put_contents("loki.txt", count($str)."\n\n", FILE_APPEND );
			$sth->execute();

		}

		function GetPath( $id )
		{
			if( $id == null)
			{
				$str = "select * from $this->reitti_";
				$sth = $this->db->prepare($str);
				$sth->execute();
				echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS) );	
			}
			else
			{
				$str = "select * from $this->reitti_ where tlp_rata_id = :id";
				$sth = $this->db->prepare($str);
				$sth->bindParam(":id", $id, PDO::PARAM_INT );
				$sth->execute();
				echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS) );	
			}
		}

		function SaveTargets($id, $value)
		{

			$existing = array();
			foreach( $value as $x ) // poistetaan ne tämän radan kohteet, joita ei ole enää olemassa
				array_push($existing, $x["id"] );

			$this->DeleteKohde($existing, $id);
			//echo json_encode($existing);



			foreach($value as $kohde)
			{
				$str = "";
				$sth;
				if( $kohde["id"] == -1)
				{
					$str = "INSERT INTO `tlp_kohde`"							
							."(`tlp_rata_id`,"
							."`tlp_sivu_id`,"
							."`nimi`,"
							."`latitude`,"
							."`longitude`,"
							."`clickable`,"
							."`halytysraja`,"
							."`icon`,"
							."`color`,"
							."`size`)"
							."VALUES"
							."("
							.":rataID,"
							.":sivuID,"
							.":nimi,"
							.":lat,"
							.":lng,"
							.":click,"
							.":alarm,"
							.":icon,"
							.":color,"
							.":size)";





					$sth = $this->db->prepare($str);

				}
				else
				{

					$str = "UPDATE `tlp_kohde`"
							."SET"
							."`tlp_rata_id` = :rataID,"
							."`tlp_sivu_id` = :sivuID,"
							."`nimi` = :nimi,"
							."`latitude` = :lat,"
							."`longitude` = :lng,"
							."`clickable` = :click,"
							."`halytysraja` = :alarm,"
							."`icon` = :icon,"
							."`color` = :color,"
							."`size` = :size "
							."WHERE `id` = :id";

					$sth = $this->db->prepare($str);
					$sth->bindParam(":id", $kohde["id"], PDO::PARAM_INT );
				}


				$sth->bindParam(":rataID", $id, PDO::PARAM_INT );
				$sth->bindParam(":sivuID", $kohde["sivuID"], PDO::PARAM_INT );
				$sth->bindParam(":nimi", $kohde["nimi"], PDO::PARAM_STR );
				$sth->bindParam(":lat", $kohde["location"]["lat"], PDO::PARAM_STR );
				$sth->bindParam(":lng", $kohde["location"]["lng"], PDO::PARAM_STR );
				$sth->bindParam(":click", $kohde["clickable"], PDO::PARAM_STR );
				$sth->bindParam(":alarm", $kohde["halytysraja"], PDO::PARAM_INT );
				$sth->bindParam(":icon", $kohde["icon"], PDO::PARAM_STR );
				$sth->bindParam(":color", $kohde["color"], PDO::PARAM_STR );
				$sth->bindParam(":size", $kohde["size"], PDO::PARAM_STR );


				$sth->execute();

				echo $sth->rowCount();
			}

			$this->OfflineMerkit($value);
			return;




		}

		function GetTargets( $id )
		{

			if( $id == null)
			{
				$str = "select * from $this->kohde_";
				$sth = $this->db->prepare($str);
				$sth->execute();
				echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS) );	
			}
			else
			{
				$str = "select * from $this->kohde_ where tlp_rata_id = :id";
				$sth = $this->db->prepare($str);
				$sth->bindParam(":id", $id, PDO::PARAM_INT );
				$sth->execute();
				echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS) );	
			}
		}


		function DeleteKohde( $arr, $rataid )
		{

			$str = "";
			if( $arr == null ) // poistetaan KAIKKI rataIDn mukaan
			{
				$str = "delete from $this->kohde_ where tlp_rata_id = :id";
				$sth = $this->db->prepare($str);
				$sth->bindParam(':id', $rataid, PDO::PARAM_INT);
			}
			else // poistetaan vain yksi yksittäinen merkki
			{
				$del = "( ";
				for($i = 0; $i < count($arr); ++$i)
				{
					if( $i == 0)
						$del .= $arr[$i];
					else
						$del .= ",".$arr[$i];
				}
				$del .= " )";


				$str = "delete from $this->kohde_ where tlp_rata_id = :id AND id NOT IN $del";
				$sth = $this->db->prepare($str);
				$sth->bindParam(':id', $rataid, PDO::PARAM_INT);

			}
			$sth->execute();

			if( $sth->rowCount() > 0)
				echo "success - removed kohteet of $id";

		}

		function DeletePath( $id )
		{
			$str = "delete from $this->reitti_ where tlp_rata_id = :nimi";
			$sth = $this->db->prepare($str);
			$sth->bindParam(':nimi', $id, PDO::PARAM_INT);
			$sth->execute();

			echo  $sth->rowCount(). " ".$str . $id;
			if( $sth->rowCount() > 0)
				return true;
			else
				return false;
		}

		function DeleteTagit( $id )
		{
			$str = "delete from $this->tagi_ where tlp_rata_id = :nimi";
			$sth = $this->db->prepare($str);
			$sth->bindParam(':nimi', $rataid, PDO::PARAM_INT);
			$sth->execute();

			if( $sth->rowCount() > 0)
				echo "success - removed tagit of $id";

		}

		function DeleteSivu( $id )
		{
			$str = "delete from $this->sivu_ where id = :nimi";
			$sth = $this->db->prepare($str);
			$sth->bindParam(':nimi', $id, PDO::PARAM_INT);
			$sth->execute();

			if( $sth->rowCount() > 0)
				echo "success - removed sivu of $id";

		}

		function DeleteRata( $id )
		{
			$str = "delete from $this->rata_ where id = :nimi";
			$sth = $this->db->prepare($str);
			$sth->bindParam(':nimi', $id, PDO::PARAM_INT);
			$sth->execute();

			if( $sth->rowCount() > 0)
				echo "success - removed rata of $id";

		}

		function GetTags($id)
		{
			$str;

			if( $id == null)
			{
				$str = "select * from $this->tagi_";
				$sth = $this->db->prepare($str);

			}
			else
			{
				$str = "select * from $this->tagi_ where tlp_rata_id = :id";
				$sth = $this->db->prepare($str);
				$sth->bindParam(":id", $id, PDO::PARAM_INT );

			}

			$sth->execute();
			echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS) );	
		}

		function AddTags($id, $value)
		{
			$str = "insert into $this->tagi_(tlp_rata_id, tagi) VALUES (:id, :arvo )";
			$sth = $this->db->prepare($str);
			$sth->bindParam(":id", $id, PDO::PARAM_INT );
			$sth->bindParam(":arvo", $value, PDO::PARAM_STR );
			$sth->execute();


		}

		function DeleteTag($id)
		{
			$str = "delete from $this->tagi_ where id = :id";
			$sth = $this->db->prepare($str);
			$sth->bindParam(':id', $id, PDO::PARAM_INT);
			$sth->execute();
		}

		function GetFiles( $id )
		{

			if( $id == -1 )
			{
				echo json_encode( array() );
				return $id;
			}
			else
			{
				$dir = "upload/$id";
				$files = array_diff(scandir($dir), array('.','..','Thumbs.db', 'index.html', 'index_eng.html'));

				echo json_encode($files);
			}
		}

		function DeleteFile( $id, $value )
		{

			if( $value == null )
			{
				echo "nullissa $id, $value";
				$dir = 'upload' . DIRECTORY_SEPARATOR . $id;
				$it = new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS);
				$files = new RecursiveIteratorIterator($it,
							 RecursiveIteratorIterator::CHILD_FIRST);
				foreach($files as $file) {
					if ($file->getFilename() === '.' || $file->getFilename() === '..') {
						continue;
					}
					if ($file->isDir()){
						rmdir($file->getRealPath());
					} else {
						unlink($file->getRealPath());
					}
				}
				rmdir($dir);


				$this->DeleteSivu( $id );
			}
			else
			{
				$dir = 'upload' . DIRECTORY_SEPARATOR . $id. DIRECTORY_SEPARATOR .$value;
				if( file_exists( $dir ) )
					unlink( $dir );
				echo "poistettiin $value";	
			}


		}

		function SaveFile($id)
		{
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

		function OfflineMerkit($value)
		{
			//echo "\n".json_encode( $value );
			$baseUrl = "markers/";

			if (!file_exists($baseUrl)) 
				mkdir($baseUrl);

			foreach( $value as $x )
			{
				$icon = $x["icon"];
				$size = $x["size"];
				$color = $x["color"];
				$visited = "C0C0C0";
				$pinA = "pin-$size-$icon+$color.png";
				$pinB = "pin-$size-$icon+$color@2x.png";

				$pinAS = "pin-$size-$icon+$visited.png";
				$pinBS = "pin-$size-$icon+$visited@2x.png";

				$url = "https://api.tiles.mapbox.com/v3/marker/";

				$this->downloadFile($url.$pinA, $baseUrl.$pinA);
				$this->downloadFile($url.$pinB, $baseUrl.$pinB); 
				$this->downloadFile($url.$pinA, $baseUrl.$pinAS);
				$this->downloadFile($url.$pinB, $baseUrl.$pinBS);                               
			}


		}

		private function downloadFile ($url, $path) 
		{

			if( file_exists($path) )
				return;

			echo "DL:$path | ";
			$newfname = $path;
			$file = fopen ($url, "rb");
			if ($file) {
				$newf = fopen ($newfname, "wb");

				if ($newf)
					while(!feof($file)) 
					{
					  fwrite($newf, fread($file, 1024 * 8 ), 1024 * 8 );
					}
			}

			if ($file) {
				fclose($file);
			}

			if ($newf) {
				fclose($newf);
			}
		}


		function GetOffline()
		{
			$ret = array();
			$ret["markers"] = array();
			$ret["upload"] = array();

			$markers = "markers/";
			$upload = "upload/";

			if( file_exists($markers) )
			{
				$ret["markers"] = array_diff(scandir($markers), array(".", "..", "Thumbs.db") );

			}
			if( file_exists($upload) )
			{
				$sivut = array_diff(scandir($upload), array(".", "..", "Thumbs.db") );
				//echo json_encode($sivut);
				foreach( $sivut as $x )
				{
					//echo $x."<hr>";
					$ret["upload"][$x] = array_diff(scandir($upload.$x), array(".", "..", "Thumbs.db") );
				}
			}

			echo json_encode($ret);

		}

		
	}

?>