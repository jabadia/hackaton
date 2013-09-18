<?php
    header("content-type: text/xml");
// +34518880963

	$objectid= isset($_GET['objectid'])? $_GET['objectid'] : 0;
	$service = 'http://services1.arcgis.com/w5PNyOikLERl9lIp/arcgis/rest/services/LoveHere_Features/FeatureServer/0';
	$query = '/query?where=&objectIds='.$objectid.'&outFields=TELEFONO&returnGeometry=false&f=json';
	$url = $service . $query;
    $ch = curl_init($url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $data = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($data);
    $number = $data->features[0]->attributes->TELEFONO;

    $number = "656466110";

?>
<Response>
    <Say voice="woman" language="es">Bienvenidos a Lofjiar punto com. Tu llamada sera transferida a la pareja seleccionada sin revelar tu numero</Say>
  <Dial callerId="+34518880946">+34<?php print $number ?></Dial>
</Response>
