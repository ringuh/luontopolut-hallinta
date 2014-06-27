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
		
		
		function DeleteKohde( $id, $rataid )
		{
			$str = "";
			if( $id == null ) // poistetaan KAIKKI rataIDn mukaan
			{
				$str = "delete from $this->kohde_ where tlp_rata_id = :nimi";
				$sth = $this->db->prepare($str);
				$sth->bindParam(':nimi', $rataid, PDO::PARAM_STR, 45);
			}
			else // poistetaan vain yksi yksittäinen merkki
			{
				$str = "delete from $this->kohde_ where id = :nimi";
				$sth = $this->db->prepare($str);
				$sth->bindParam(':nimi', $id, PDO::PARAM_STR, 45);
			}
			$sth->execute();
			
			if( $sth->rowCount() > 0)
				echo "success - removed kohteet of $id";
			else
				echo "DeleteKohde - rowcount0<hr>";
		}
		
		function DeleteReitti( $id )
		{
			$str = "delete from $this->reitti_ where tlp_rata_id = :nimi";
			$sth = $this->db->prepare($str);
			$sth->bindParam(':nimi', $rataid, PDO::PARAM_STR, 45);
			$sth->execute();
			
			if( $sth->rowCount() > 0)
				echo "success - removed reitti of $id";
			else
				echo "DeleteReitti - rowcount0<hr>";
		}
		
		function DeleteTagit( $id )
		{
			$str = "delete from $this->tagi_ where tlp_rata_id = :nimi";
			$sth = $this->db->prepare($str);
			$sth->bindParam(':nimi', $rataid, PDO::PARAM_STR, 45);
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
			$sth->bindParam(':nimi', $rataid, PDO::PARAM_STR, 45);
			$sth->execute();
			
			if( $sth->rowCount() > 0)
				echo "success - removed sivu of $id";
			else
				echo "DeleteSivut - rowcount0<hr>";
		}
		
		
	}

?>