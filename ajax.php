<?php
const MYSQL_HOST = "localhost";
const MYSQL_USER = "ucit";
const MYSQL_PASS = "dev";
const MYSQL_DB = "barahlo";

$mysqli = new mysqli(MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_DB);
$mysqli->query("SET CHARACTER SET utf8 ");

if ($mysqli->connect_errno) {
    echo "MySQL error $mysqli->error <br> ", $mysqli->errno;
    throw new Exception("MySQL error $mysqli->error <br>", $mysqli->errno);
}

if ($f = (isset($_POST["f"])) ? $_POST["f"] : null) {
    if ($f === "load_all") {
        $res = $mysqli->query("SELECT * FROM items");
        $arr = $res->fetch_all(MYSQLI_ASSOC);
        echo '{"f":"' . $f . '", "items": ' . json_encode($arr) . '}';
    }
} else {
    echo "FAIL<br>";
}

?>