<?php require("ajax.php"); ?>
<br>----------------------------------------<br>
<FORM  method="POST">
<textarea name="f" style="width:100%; height:500px;">
<?= (isset($_POST["command"])) ? $_POST["command"] : ""; ?>
</textarea>
<button type="submit">Отправить</button>
</FORM>