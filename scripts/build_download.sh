#!/bin/bash

echo building...
eas build -p android --non-interactive | 

while IFS= read -r line
  do
  	echo $line 
    if [[ "$line" == *"https://expo.dev/artifacts/eas/"* ]]; then

    	echo downloading .aab file...
		curl $line -o $(date +'%d-%m-%Y').aab -k -L
	fi
  done