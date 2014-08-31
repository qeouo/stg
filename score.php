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
	$fp = fopen("score", "r");
	$array=array();
	while ($line = fgets($fp)) {
		$arr = explode(",",$line);
		$arr[2]=intval($arr[2]);
		$array[]=$arr;
	}
	fclose($fp);

if($id && $name && $score){

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
			$writeflg=1;
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
			$writeflg=1;
		}
	}
	if($writeflg ==1){
		$fp = fopen("score", "w");
		if($fp == null){
		}else{
			for($i=0;$i<count($array);$i++){
				if($i>=10)break;
				$arr=$array[$i];
				if($arr[0]==""){continue;}
				if(count($arr)<=1)continue;
				fwrite($fp,"$arr[0],$arr[1],$arr[2]\n");
			}
			fclose($fp);
		}	
	}	
}
print("scoreboard([\n");
for($i=0;$i<count($array);$i++){
	if($i>=10)break;
	$arr=$array[$i];
	if($arr[0]==""){continue;}
	if(count($arr)<=1)continue;
	print("{id:'$arr[0]',name:'$arr[1]',score:$arr[2]}");
	if($i !=0 || $i !=(count($array)-1)){
		print(",\n");
	}else{
		print("\n");
	}
}
print("]);");

?>
