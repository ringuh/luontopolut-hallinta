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
		
		function EditRata( $id, $value, $osoite)
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
				$this->DeleteReitti( $id );
				$this->DeleteTagit( $id );
				
				$str = "delete from $this->rata_ where nimi = :nimi"; // poistetaan rata
				$sth = $this->db->prepare($str);
				$sth->bindParam(':nimi', $id, PDO::PARAM_STR, 45);
				$sth->execute();
				
				if( $sth->rowCount() > 0)
					echo "success - removed rata of $id";
				else
					echo "Delete Rata - rowcount0<hr>";
			}
		}
		
		function GetRadat() // haetaan lista radoista
		{
			
			$str = "select * from $this->rata_";
			$sth = $this->db->prepare($str);
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

			
			$this->DeletePath($id);

			if($value == null)
				return;

			$str = "INSERT INTO $this->reitti_ ( tlp_rata_id, latitude, longitude, altitude, distance ) values ";

			for( $i = 0; $i < count($value); ++$i )
			{
				if( $i == 0)
					$str .= "( :id$i, :lat$i, :lng$i, :alt$i, :dist$i )";
				else
					$str .= ",( :id$i, :lat$i, :lng$i, :alt$i, :dist$i )";
			}

			$sth = $this->db->prepare($str);
			


			for( $i = 0; $i < count($value); ++$i )
			{
				$sth->bindParam(":id$i", $id, PDO::PARAM_INT );
				$sth->bindParam(":lat$i", $value[$i]["lat"], PDO::PARAM_STR );
				$sth->bindParam(":lng$i", $value[$i]["lng"], PDO::PARAM_STR );
				$sth->bindParam(":alt$i", $value[$i]["altitude"], PDO::PARAM_STR );
				$sth->bindParam(":dist$i", $value[$i]["distance"], PDO::PARAM_STR );
			}	
			echo $str;
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
				$str = "delete from $this->kohde_ where tlp_rata_id = :nimi";
				$sth = $this->db->prepare($str);
				$sth->bindParam(':nimi', $rataid, PDO::PARAM_INT);
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


				$str = "delete from $this->kohde_ where id NOT IN $del";
				$sth = $this->db->prepare($str);
				
			}
			$sth->execute();
			
			if( $sth->rowCount() > 0)
				echo "success - removed kohteet of $id";
			else
				echo "DeleteKohde - rowcount0<hr>";
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
			else
				echo "DeleteTagit - rowcount0<hr>";
		}
		
		function DeleteSivu( $id )
		{
			$str = "delete from $this->sivu_ where id = :nimi";
			$sth = $this->db->prepare($str);
			$sth->bindParam(':nimi', $id, PDO::PARAM_INT);
			$sth->execute();
			
			if( $sth->rowCount() > 0)
				echo "success - removed sivu of $id";
			else
				echo "DeleteSivut - rowcount0<hr>";
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
	}

?>