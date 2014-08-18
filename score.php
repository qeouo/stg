<?php
  // [ user.php ]
  if(isset($_GET['id'])) {
      $id = $_GET['id'];
  }
  if(isset($_GET['name'])) {
      $name = $_GET['name'];
  }
  if(isset($_GET['score'])) {
      $score = $_GET['score'];
	  $score = intval($score);
  }
if($id && $name && $score){

	$fp = fopen("score", "r");
	$array=[];
	while ($line = fgets($fp)) {
		$arr = explode(",",$line);
		$arr[2]=intval($arr[2]);
		$array[]=$arr;
	}
	fclose($fp);

	$flg=0;
	for($i=0;$i<count($array);$i++){
		if(count($arr)<=1)continue;
	}
	for($i=0;$i<count($array);$i++){
		$arr=$array[$i];
		if($arr[2]<$score && $flg==0){
			$arr[0]=$id;
			$arr[1]=$name;
			$arr[2]=$score;
			array_splice($array,$i,0,array($arr));
			$flg=1;
			continue;
		}
		if($arr[0]==$id){
			if($flg==0){
				$arr[1]=$name;
				$array[$i]=$arr;
				$flg=1;
			}else{
				$arr[0]="";
				$array[$i]=$arr;
			}
		}
	}
	$fp = fopen("score", "w");
	if($fp == null){
		return;
	}
	for($i=0;$i<count($array);$i++){
		if($i>=10)break;
		$arr=$array[$i];
		if($arr[0]==""){continue;}
		if(count($arr)<=1)continue;
		fwrite($fp,"$arr[0],$arr[1],$arr[2]\n");
		print("$arr[0],$arr[1],$arr[2]\n");
	}
	fclose($fp);
}
?>
