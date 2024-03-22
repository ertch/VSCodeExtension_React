<?

define( 'ADS_DEBUG_IGNORE'	,	0						);
define(	'ADS_DEBUG_COMMENT'	,	1						);
define(	'ADS_DEBUG_ALL'		,	2						);

// Alter Server ...
//define(	'ADS_HOSTNAME'		,	'192.168.11.241'		);
//define(       'ADS_HOSTNAME'          ,       '192.168.11.228'                );
//define(       'ADS_HOSTNAME'          ,       '10.40.100.16'                );
define(       'ADS_HOSTNAME'          ,       'klicktel.ekontor24.net'                );


define(	'ADS_PORT'			,	'5000'					);
define(	'ADS_USERNAME'		,	''						);
define(	'ADS_PASSWORD'		,	''						);
define(	'ADS_DBNAME'		,	'addresses'				);
define( 'ADS_DEBUG'			,	ADS_DEBUG_ALL			); // 0 = Ignore all // 1 = Error in HTML-Comment // 2 = Full Errorreporting
define( 'ADS_SOCKET_BLOCKING',	true					); // false is strong alpha.

/*
class Address_Server
	function Address_Server( $ASocket = 0, $ADBName = '', $AHostname = '', $APort = '', $AUsername = '', $APassword = '' )

*/


class Address_Server_Statement
	{
	var	$DBName		=	'';
	var	$Debug		=	0;
	var $Lasterror	=	'';

	var	$_Values	=	array();
	var	$_Params	=	array();

	function Address_Server_Statement( $ADBName = '' )
		{
		if( defined( 'ADS_DEBUG' ) ) $this->Debug	=	ADS_DEBUG;
		if( defined( 'ADS_DBNAME' ) && empty( $ADBName ) )	$this->DBName	=	ADS_DBNAME;
													else	$this->DBName	=	$ADBName;
		}


	function Set( $AField, $AValue = '', $AParams = '' )
		{
		if( !empty( $AField ) )
			{
			$AField	=	strtoupper( $AField );
			$this->_Values[ $AField ]	=	trim( $AValue );
			if( !empty( $AParams ) )
				$this->_Params[ $AField ]	=	trim( $AParams );
			}
		else
			return $this->Error( 'No Fieldname given!' );
		}


	function Del( $AField )
		{
		$_newFields	=	array();
		$_newParams	=	array();
		$AField		=	strtoupper( $AField );
		$fieldlist	=	array_keys( $this->_Values );

		if( !empty( $AField ) )
			{
			while( list( $num, $field ) = each( $fieldlist ) )
				{
				if( $AField != $field )
					{
					$_newFields[ $field ]	=	$this->_Values[ $field ];
					if( isSet( $this->_Param[ $field ] ) )
						$_newParams[ $field ]	=	$this->_Params[ $field ];
					}
				}
			$this->_Values	=	$_newFields;
			$this->_Params	=	$_newParams;
			return true;
			}
		else
			return $this->Error( 'No Fieldname given!' );
		}


	function SetFields( $AFields )
		{
		$AFields 	=	strtoupper( $AFields );
		$fieldlist	=	explode( ',', $AFields );
		while( list( $num, $field ) = each( $fieldlist ) )
			$this->_Values[ $field ] = '';
		}


	function SetValue( $AField, $AValue )
		{
		$AField = strtoupper( $AField );
		if( !empty( $AField ) )
			{
			$this->_Values[ $AField ]	=	trim( $AValue );
			return true;
			}
		else
		   return $this->Error( 'No Fieldname given!' );
		}


	function SetParams( $AField, $AParams )
		{
		$AField = strtoupper( $AField );
		if( !empty( $AField ) )
			{
			$this->_Params[ $AField ]	=	trim( $AParams );
			return true;
			}
		else
		   return $this->Error( 'No Fieldname given!' );
		}


	function GetParams( $AField )
		{
		$AField = strtoupper( $AField );
		if( isSet( $this->_Params[ $AField ] ) )
			return $this->_Params[ $AField ];
		else
			return false;
		}


	function GetValue( $AField )
		{
		$AField = strtoupper( $AField );
		if( isSet( $this->_Values[ $AField ] ) )
			return $this->_Values[ $AField ];
		else
			return false;
		}


	function Clear()
		{
		$this->_Values	=	array();
		$this->_Params	=	array();
		}


	function GetSelectQuery()
		{
		$crlf		=	chr( 0x0d ) . chr( 0x0a );
		$result		=	array();
		$result[]	=	'SELECT ' . $this->DBName;
		$fieldlist	=	array_keys( $this->_Values );
		while( list( $num, $field ) = each( $fieldlist ) )
			{
			if( !empty( $this->_Values[ $field ] ) )
				{
				$result[]	=	'FIELD_' . $field . '=' . $this->_Values[ $field ];
				}
				if( isSet( $this->_Params[ $field ] ) )
					$result[]	=	'PARAM_' . $field . '=' . $this->_Params[ $field ];

			}
		return $result;
		}


	function GetResultQuery( $ASort = '', $AStart = -1, $AEnd = -1 )
		{
		$crlf		=	chr( 0x0d ) . chr( 0x0a );
		$result		=	array();
		$result[]	=	'RESULTS' . $crlf;
		$fieldlist	=	array_keys( $this->_Values );
		$result[]	=	'FIELDS=' . implode( ',', $fieldlist ) . ( $this->isFuzzySet() == true? ',QUALITY': '' );
		if( $AStart != -1 )
			$result[]	= 'START=' . $AStart;
		if( $AEnd != -1 )
			$result[]	= 'END=' . $AEnd;
		if( !empty( $ASort ) )
			$result[]	= 'SORT=' . $ASort;
		return $result;
		}


	function Error( $AErr )
		{
		$this->Lasterror	=	$AErr;
		switch( $this->Debug )
			{
			case ADS_DEBUG_IGNORE:
				break;

			case ADS_DEBUG_COMMENT:
				echo 	'<!-- ' . $AErr . ' -->';
				break;

			case ADS_DEBUG_ALL:
				echo	'<B STYLE="color: Marron">' . $AErr . '</B>';
				break;
			}
		return false;
		}


	function isFuzzySet()
		{
		return false;
		$fieldlist	=	array_keys( $this->_Params );
		while( list( $num, $field ) = each( $fieldlist ) )
			{
			$params	=	explode( ';', $this->_Params[ $field ] );
			while( list( $num, $param ) = each( $params ) )
				if( strtoupper( $param ) == 'FUZZY' )
					return true;
			}
		return false;
		}


	}


class Address_Server extends Address_Server_Statement
	{
	var	$Hostname;
	var	$Username;
	var	$Password;
	var	$Port		=	5000;
	var	$Timeout	=	5;
	var	$Blocking	=	true;

	var	$_socket	=	0;


	function Address_Server( $ASocket = 0, $ADBName = '', $AHostname = '', $APort = '', $AUsername = '', $APassword = '' )
		{
		$this->Address_Server_Statement();
		if( defined( 'ADS_DEBUG' ) ) $this->Debug	=	ADS_DEBUG;

		if( $ASocket == 0 )
			{
			if( defined( 'ADS_HOSTNAME'	) && empty( $AHostname 	) )	$this->Hostname	=	ADS_HOSTNAME;
															else	$this->Hostname	=	$AHostname;
			if( defined( 'ADS_PORT' 	) && empty( $APort		) )	$this->Port		=	ADS_PORT;
															else	$this->Port		=	$APort;
			if( defined( 'ADS_USERNAME'	) && empty( $AUsername	) )	$this->Username	=	ADS_USERNAME;
															else	$this->Username	=	$AUsername;
			if( defined( 'ADS_PASSWORD'	) && empty( $APassword	) )	$this->Password	=	ADS_PASSWORD;
															else	$this->Password	=	$APassword;
			if( defined( 'ADS_DBNAME'	) && empty( $ADBName	) ) $this->DBName	=	ADS_DBNAME;
															else	$this->DBName	=	$ADBName;
			if( defined( 'ADS_SOCKET_BLOCKING' ) )					$this->Blocking	=	ADS_SOCKET_BLOCKING;
			}
		else
			$this->_socket	=	$ASocket;
		}


	function Open()
		{
		if( !$this->_socket	=	fsockopen( $this->Hostname, $this->Port, $errno, $errstr, $this->Timeout	)  )
			return $this->Error( $errstr );
		else
			{
			socket_set_blocking( $this->_socket, $this->Blocking );
			socket_set_timeout( $this->_socket, $this->Timeout );
			$this->ReadStrings(); // Buffer leeren
			return true;
			}
		}


	function Error( $AErr )
		{
		$this->Lasterror	=	$AErr;
		switch( $this->Debug )
			{
			case ADS_DEBUG_IGNORE:
				break;

			case ADS_DEBUG_COMMENT:
				echo 	'<!-- ' . $AErr . ' -->';
				break;

			case ADS_DEBUG_ALL:
				echo	'<B STYLE="color: Maron">' . $AErr . '</B>';
				break;
			}
		return false;
		}


	function timenow()
		{
		return doubleval(ereg_replace('^0\.([0-9]*) ([0-9]*)$','\\2.\\1',microtime()));
		}


	function ReadStrings()
		{
		socket_set_blocking( $this->_socket, $this->Blocking );
		socket_set_timeout( $this->_socket, $this->Timeout );
		if( $this->_socket )
			{
			if( $this->Blocking )
				{
				$result	= array();
				if( !feof( $this->_socket ) )
					do
						{
						$line		=	fgets( $this->_socket, 1024 );
						if( trim( $line ) != '.' )
							$result[]	=	$line;
						} while( ( trim( $line ) != '.' ) || feof( $this->_socket ) );
				return $result;
				}
			else
				{
				$starttime	=	$this->timenow();
				$buf 		=	'';
				$bufcnt		=	0;
				sleep( 1 );
				do
					{
					$buf .= fgetc( $this->_socket );
					$bufcnt++;
					$socketstatus = socket_get_status( $this->_socket );
					if ($this->timenow()>($starttime+$this->Timeout))
						{
						$this->Error( 'Connection timed out!' );
						fclose( $this->_socket );
						$this->_socket = 0;
						return false;
						}
					} while( $socketstatus["unread_bytes"] > 0 );
				$buf = explode( chr( 0x0a ), $buf );

				fputs( $this->_socket, chr( 28 ) );
				return $buf;
				}
			}
		else
			{
			$this->Error( 'Socket not opened!' );
			return false;
			}
		}


	function WriteStrings( $ALines = array() )
		{
		if( is_array( $ALines ) )
			{
			reset( $ALines );
			if( $this->_socket )
				{
				socket_set_blocking( $this->_socket, $this->Blocking );
				if( $this->Blocking )
					{
					while( list( $num, $line ) = each( $ALines ) )
						{
						fputs( $this->_socket, trim( $line ) . chr( 0x0d ) . chr( 0x0a ) );
						}
					if( $line != '.' )
						fputs( $this->_socket, '.' . chr( 0x0d ) . chr( 0x0a ) );
					return true;
					}
				else
					{
					$buf = '';
					while( list( $num, $line ) = each( $ALines ) )
						$buf .= trim( $line ) . chr( 0x0d ) . chr( 0x0a );
					if( $line != '.' )
						$buf .= '.' . chr( 0x0d ) . chr( 0x0a );
					if( fputs( $this->_socket, $buf, strlen( $buf ) ) != strlen( $buf ) )
						return $this->Error( 'Write socket failed!' );
					return true;
					}
				}
			else
				return $this->Error( 'Socket not opened!' );
			}
		else
			return $this->Error( 'Lines not an array!' );
		}


	function Execute()
		{
		if( $this->WriteStrings( $this->GetSelectQuery() ) == true )
			{
			if( $res = $this->ReadStrings() )
				return	(int)trim( $res[0] ) + 0;
			else
				return	false;
			}
		else
			return false;
		}


	function GetResultList( $ASort = '', $AStart = -1, $AEnd = -1 )
		{
		$reslist	= array();
		if( $this->WriteStrings( $this->GetResultQuery( $ASort, $AStart, $AEnd ) ) == true )
			{
			$fieldlist	=	array_keys( $this->_Values );
			if( $this->isFuzzySet() == true )
				$fieldlist[] = 'QUALITY';
			$result 	= $this->ReadStrings();


			if( count( $result ) > 0 )
				{


				$rowres		= explode( '|', $result[0] );
				//if( count( $rowres ) == count( $fieldlist ) ) {

					reset( $result );


					while( list( $num, $line ) = each( $result ) )
						{
						$rowres	=	explode( '|', $line );
						$row	=	array();
						reset( $fieldlist );
						if( count( $rowres ) == count( $fieldlist ) )
							{
							while( list( $num, $field ) = each( $fieldlist ) ) {
								$row[ $field ]	=	$rowres[ $num ];
							}
							$reslist[]	=	$row;
							}
						}
					}
				//else
					//return $this->Error( $result[0] );
				//}
			else
				return	$this->Error( 'Wrong result!' );
			}
		return $reslist;
		}

	} // class Address_Server
?>
