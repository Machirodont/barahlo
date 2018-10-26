<?php
header('Content-Type: text/html; charset=utf-8');
require("config.php");

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

    if ($f === "save_stack") {
        $saveResult["f"] = "save_stack_result";
        if ($stack = isset($_POST["stack"]) ? json_decode($_POST["stack"]) : null) {
            $saveResult["status"] = "ok";

            if (!($insertStmt = $mysqli->prepare("INSERT INTO items SET name=?, is_container=?"))) {
                $saveResult["status"] = "Не удалось подготовить запрос: (" . $mysqli->errno . ") " . $mysqli->error;
            }

            foreach ($stack as $k => $v) {
                $saveResult["stack"][$k]["status"] = "ok";
                $saveResult["stack"][$k]["reqId"] = $k;
                if(!is_object($v)){
                    $saveResult["stack"][$k]["status"] = "Некорректный формат инструкции";
                }
                elseif($v->f==="new") {
                    $saveResult["stack"][$k]["f"] = $v->f;
                    if (!$insertStmt->bind_param("si", $v->item->name, $v->item->is_container)) {
                        $saveResult["stack"][$k]["status"] = "Не удалось привязать параметры: (" . $insertStmt->errno . ") " . $insertStmt->error;
                    }
                    if (!$insertStmt->execute()) {
                        $saveResult["stack"][$k]["status"] = "Не удалось выполнить запрос: (" . $insertStmt->errno . ") " . $insertStmt->error;
                    }

                    $saveResult["stack"][$k]["masterId"] = $insertStmt->insert_id;
                    $saveResult["stack"][$k]["localId"] = $v->item->localId;
                    $saveResult["stack"][$k]["name"] = $v->item->name;
                    $saveResult["stack"][$k]["is_container"] = $v->item->is_container;
                }
                else{
                    $saveResult["stack"][$k]["status"] = "Неизвестная инструкция";
                }
            }
            $insertStmt->close();
        } else {
            $saveResult["status"] = "error";
        }
        echo json_encode($saveResult);
    }
} else {
    echo "FAIL<br>";
}

?>