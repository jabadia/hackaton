<?php

    /*
     *   functions
     */
    function get_param($name,$default=null)
    {
        if( isset($_GET[$name]))
            return $_GET[$name];
        else if( isset($_POST[$name]))
            return $_POST[$name];
        else
            return $default;
    }

    function query_by_phone($phone)
    {
        $service = 'http://services1.arcgis.com/w5PNyOikLERl9lIp/arcgis/rest/services/LoveHere_Features/FeatureServer/0';
        $query = '/query?where='. urlencode("TELEFONO='".$phone."'");
        $query .= '&outFields=Nick&returnGeometry=false&f=json';
        $url = $service . $query;
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $data = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($data);
        if( $data && count($data->features) > 0 )
            return $data->features[0];
        else
            return null;
    }

    /*
     *   request processing begins here
     */

    $from = get_param('From');
    $from = str_replace('+34', '', $from);


    header("content-type: text/xml");

    $user = query_by_phone($from);
    if( $user )
    {
        $from_nick = $user->attributes->Nick;
        $to_number = "656466110"; // hardcoded to avoid demo problems
?>
<Response>
    <Say voice="woman" language="es">Hola <?php print $from_nick ?>. Bienvenido a Lofjiar punto com. Tu llamada sera transferida a la pareja seleccionada sin revelar tu numero</Say>
  <Dial callerId="+34518880946">+34<?php print $to_number ?></Dial>
</Response>
<?php
    }
    else
    {
?>
<Response>
    <Say voice="woman" language="es">Bienvenido a Lofjiar punto com. Lo sentimos pero el teléfono desde el que llama no pertenece a ningun usuario registrado.</Say>
</Response>
<?php
    }
?>