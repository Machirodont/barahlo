<?php require("ajax.php"); ?>
<FORM  method="POST">
<textarea name="command" style="width:100%; height:500px;">
<?= $_POST["command"] ?>
</textarea>
<button type="submit">Отправить</button>
</FORM>