<?php
	class DBTalker
	{
		private $db;
		private $dbhost_ = "mydb.tamk.fi";
		private $dbname_ = "dbe2avaaka1";
		private $dbuser_ = "e2avaaka";
		private $dbpass_ = "f96f3LJD";


		function __construct() {
			try{
			
				$this->db = new PDO('mysql:host='.$this->dbhost_.';dbname='.$this->dbname_.';charset=utf8', $this->dbuser_, $this->dbpass_);
				$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			}
			catch(Exception $e)
			{
				echo "error".$this->Error($e->getCode());
			}
		}

		function AddPlace( $place )
		{
			try{
				$str = "select * from kp_alueet where nimi = :nimi";
				$sth = $this->db->prepare($str);
				$sth->bindParam(':nimi', $place, PDO::PARAM_STR, 45);
				$sth->execute();
				if( $sth->rowCount() != 0)
				{
					echo "error paikka $place oli jo olemassa";
					return;
				}

				$str = "INSERT INTO kp_alueet ( nimi ) values ( :nimi )";
				$sth = $this->db->prepare($str);
				$sth->bindParam(':nimi', $place, PDO::PARAM_STR, 45);
				$sth->execute();

				if( $sth->rowCount() == 1)
					echo "success - added $place";
			}
			catch( Exception $e ){
				echo "error ".$this->Error($e->getCode());
			}
		}

		function GetPlaces()
		{
			try{
				$str = "select * from kp_alueet";
				$sth = $this->db->prepare($str);
				$sth->execute();

				echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS) );
			}
			catch( Exception $e ){
				echo "error ".$this->Error($e->getCode());
			}

		}

		function AddSpot( $id, $latitude, $longitude)
		{
			echo "AddSpot: $id, $latitude, $longitude";
			try{
				$str = "INSERT INTO kp_koordinaatit ( kp_alueet_id, latitude, longitude ) values ( :id, :latitude, :longitude )";
				$sth = $this->db->prepare($str);
				$sth->bindParam(':id', $id, PDO::PARAM_INT );
				$sth->bindParam(':latitude', $latitude, PDO::PARAM_STR );
				$sth->bindParam(':longitude', $longitude, PDO::PARAM_STR );
				$sth->execute();

				if( $sth->rowCount() == 1)
					echo "success - added $latitude, $longitude";

				echo "<> $str";
			}
			catch( Exception $e ){
				echo "error ".$this->Error($e->getMessage());
			}
		}

		function GetSpots($id){
			if( $id != "-2" )
			{
				try{
					$str = "select * from kp_koordinaatit WHERE kp_alueet_ID= :id";
					$sth = $this->db->prepare($str);
					$sth->bindParam(':id', $id, PDO::PARAM_INT );
					$sth->execute();

					echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS) );
				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}
			}
			else
			{
				try{
					$str = "select * from kp_koordinaatit";
					$sth = $this->db->prepare($str);
					$sth->execute();

					echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS) );
				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}
			}
		}

		function AddSpotValue($id, $value)
		{
			try{
				$str = "INSERT INTO kp_links_to ( kp_koordinaatit_id, url ) values ( :id, :url )";
				$sth = $this->db->prepare($str);
				$sth->bindParam(':id', $id, PDO::PARAM_INT );
				$sth->bindParam(':url', $value, PDO::PARAM_STR );
				$sth->execute();

				if( $sth->rowCount() == 1)
					echo "success - added $id, $value";
			}
			catch( Exception $e ){
				echo "error ".$this->Error($e->getMessage());
			}
		}

		function GetSpotValue($id)
		{
			try{
				$str = "select * from kp_links_to WHERE kp_koordinaatit_id= :id";
				$sth = $this->db->prepare($str);
				$sth->bindParam(':id', $id, PDO::PARAM_INT );
				$sth->execute();

				echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS) );
			}
			catch( Exception $e ){
				echo "error ".$this->Error($e->getMessage());
			}
		}
		
		function SavePage($id, $value, $tunniste)
		{
			$saveID = "unset";
			if( $id != "" && $id != '-1' )
			{
				//echo "id oli";
				try{
					$str = "UPDATE kp_sivut SET tunniste=:tunniste WHERE id=:id";
					$sth = $this->db->prepare($str);
					$sth->bindParam(':id', $id, PDO::PARAM_INT );
					$sth->bindParam(':tunniste', $tunniste, PDO::PARAM_STR );
					$sth->execute();
					
					if( $sth->rowCount() == 1)
					{
						$saveID = $this->db->lastInsertId();
						echo $saveID;						
					}
				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}
				
			}
			else
			{
				//echo "update";
				try{
					$str = "INSERT INTO kp_sivut ( tunniste ) values ( :tunniste )";
					$sth = $this->db->prepare($str);
					
					$sth->bindParam(':tunniste', $tunniste, PDO::PARAM_STR );
					$sth->execute();

					if( $sth->rowCount() == 1)
					{
						$saveID = $this->db->lastInsertId();
						echo $saveID;						
					}
				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}
			}
			
			if( $saveID != "unset" )
			{
				if (!file_exists("upload")) {
					mkdir("upload");
				}
				if (!file_exists("upload/$saveID")) {
					mkdir("upload/$saveID");
				}//uploads/$saveID/
				file_put_contents( "upload/$saveID/index.html", $value );
			}
			
		}
		
		function GetPages()
		{
			try{
					$str = "select * from kp_sivut";
					$sth = $this->db->prepare($str);
					$sth->execute();
					echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS) );
				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}
		}
	
		function GetPage( $id )
		{
			$ret = array();
			try{
					$str = "select * from kp_sivut WHERE id=:id";
					$sth = $this->db->prepare($str);
					$sth->bindParam(':id', $id, PDO::PARAM_INT );
					$sth->execute();
					$ret["stuff"] = $sth->fetchAll(PDO::FETCH_CLASS);
				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}
			$ret["html"] = file_get_contents( "upload/$id/index.html" );
			$ret['dir'] = array_diff(scandir("upload/$id"), array('..', '.', "index.html"));
			
			
			echo json_encode( $ret );
		}
		function GetPageLinked( $id )
		{
			if( $id != "all" )
			{
			
				try{
					$str = "select * from kp_links_to WHERE kp_koordinaatit_ID=:id";
					$sth = $this->db->prepare($str);
					$sth->bindParam(':id', $id, PDO::PARAM_INT );
					$sth->execute();
					if( $sth->rowCount() == 1)
						echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS));
					else
						echo "not linked";
				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}	
			}
			else
			{
				try{
					$str = "select * from kp_links_to";
					$sth = $this->db->prepare($str);
					
					$sth->execute();
					echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS));
				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}
			}
		}
		
		function LinkPages( $id, $value )
		{
			try{
					$str = "INSERT INTO kp_links_to ( kp_koordinaatit_ID, kp_sivut_id ) "
						."values ( :id, :val ) ON DUPLICATE KEY UPDATE "
						."kp_koordinaatit_ID = :id, kp_sivut_id = :val";
						
					$sth = $this->db->prepare($str);
					
					$sth->bindParam(':id', $id, PDO::PARAM_INT );
					$sth->bindParam(':val', $value, PDO::PARAM_INT );
					$sth->execute();

					if( $sth->rowCount() == 1)
					{
						echo "success $saveID";						
					}
					else
						echo "$id, $value";
				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}
		
		}
		
		function AddReitti($id, $value )
		{
			echo "$id, ".json_encode($value);
			try{
				$str = "delete from kp_reitit WHERE kp_alueet_ID = :id";
				$sth = $this->db->prepare($str);
				$sth->bindParam(':id', $id, PDO::PARAM_INT );
				$sth->execute();
				//echo "\n$str\n";
			}
			catch( Exception $e )
			{
				echo "error ".$this->Error($e->getMessage());
			}
			try{
					$str = "INSERT INTO kp_reitit ( kp_alueet_ID, latitude, longitude ) "
						."values ";
					foreach( $value as $x )
						$str .= "( $id, $x[0], $x[1] ), ";
					
					$str = rtrim($str, ", ");
					
					//echo "\ninsertti\n$str\n";
					
					$sth = $this->db->prepare($str);
					
					
					$sth->execute();

					echo "success: ".$sth->rowCount();
				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}
		}
		
		function GetReitti($id)
		{
			if( $id != "-2")
			{
				try{
					$str = "select * from kp_reitit WHERE kp_alueet_ID=:id";
					$sth = $this->db->prepare($str);
					$sth->bindParam(':id', $id, PDO::PARAM_INT );
					$sth->execute();
					
					echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS));
					
				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}	
			}
			else
			{
				try{
					$str = "select * from kp_reitit";
					$sth = $this->db->prepare($str);
					$sth->execute();
					
					echo json_encode( $sth->fetchAll(PDO::FETCH_CLASS));
					
				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}	
			}
		}
		
		private function Error( $e )
		{
			if( $e == "21S01")
				return "Insert value list does not match column list";



			return $e;

		}

		function ResetSpot( $id )
		{
			$arr = Array();
			try{
				$str = "select ID from kp_koordinaatit WHERE kp_alueet_ID = :id";
				$sth = $this->db->prepare($str);
				$sth->bindParam(':id', $id, PDO::PARAM_INT );
				$sth->execute();
				$arr = $sth->fetchAll(PDO::FETCH_CLASS);
				$arr = json_encode($arr);
				$arr = json_decode( $arr, true);
			}
			catch( Exception $e ){
				echo "error ".$this->Error($e->getMessage());
			}
			$x = "";

			if( count( $arr ) > 0 )
			{
				foreach( $arr as $i )
				{

					$x.= $i["ID"].',';
				}
				$x = trim($x, ',');
				
				try{
					$pre = "delete from kp_links_to WHERE kp_koordinaatit_ID IN($x)";
					
					echo "|".$pre."|";
					$sth = $this->db->prepare($pre);
					
					$sth->execute();

				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}
				try{
					
					$str = "delete from kp_koordinaatit WHERE ID IN($x)";
					//echo "|".$str."|";
					
					$sth = $this->db->prepare($str);
					$sth->execute();
					

					
				}
				catch( Exception $e ){
					echo "error ".$this->Error($e->getMessage());
				}
			}
			
		}
		
		function Offline()
		{
			$ret = array();
			
			// haetaan reitit
			try{
				$str = "select * from kp_reitit";
				$sth = $this->db->prepare($str);
				$sth->execute();
				$ret["reitit"] = $sth->fetchAll(PDO::FETCH_CLASS);
			}
			catch( Exception $e )
			{
				echo "error ".$this->Error($e->getMessage());
			}
			// haetaan alueet
			try{
				$str = "select * from kp_alueet";
				$sth = $this->db->prepare($str);
				$sth->execute();
				$ret["alueet"] = $sth->fetchAll(PDO::FETCH_CLASS);
			}
			catch( Exception $e )
			{
				echo "error ".$this->Error($e->getMessage());
			}
			// haetaan koordinaatit
			try{
				$str = "select * from kp_koordinaatit";
				$sth = $this->db->prepare($str);
				$sth->execute();
				$ret["koordinaatit"] = $sth->fetchAll(PDO::FETCH_CLASS);
			}
			catch( Exception $e )
			{
				echo "error ".$this->Error($e->getMessage());
			}
			// haetaan links_to
			try{
				$str = "select * from kp_links_to";
				$sth = $this->db->prepare($str);
				$sth->execute();
				$ret["links_to"] = $sth->fetchAll(PDO::FETCH_CLASS);
			}
			catch( Exception $e )
			{
				echo "error ".$this->Error($e->getMessage());
			}
			// haetaan sivut
			try{
				$str = "select * from kp_sivut";
				$sth = $this->db->prepare($str);
				$sth->execute();
				$ret["sivut"] = $sth->fetchAll(PDO::FETCH_CLASS);
			}
			catch( Exception $e )
			{
				echo "error ".$this->Error($e->getMessage());
			}
			
			//echo json_encode( $ret );
			
			// haetaan kaikki sivuihin liittyvät tiedostot
			$ret["file"] = array();
			$folders = array_diff(scandir("upload"), array('.','..','Thumbs.db'));
			foreach( $folders as $f )
			{
				$path = "upload/".$f;
				$cnt = array_diff(scandir($path), array('.','..','Thumbs.db'));
				$ret["file"][$f] = $cnt;
				//echo json_encode($cnt)."<hr>";
			}
			echo json_encode( $ret );
		}
		
		function GetTiles()
		{
			$ret = array();
			$dir = "MapQuest";
			$folders = array_diff(scandir($dir), array('.','..','Thumbs.db'));
			foreach( $folders as $f )
			{
				$ret[$f] = array();			
				$subfolders = array_diff(scandir("$dir/$f"), array('.','..','Thumbs.db'));
				foreach( $subfolders as $y )
				{
					$path = "$dir/$f/$y";
					$cnt = array_diff(scandir($path), array('.','..','Thumbs.db'));
					$ret[$f][$y] = $cnt;
				}				
			}
			echo json_encode($ret);
		}
		
	}

?>