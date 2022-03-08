#!/bin/bash

echo updating version code
python3 updateVersion.py

echo building...
eas build -p android --non-interactive | 

while IFS= read -r line
  do
  	echo $line 
    if [[ "$line" == *"https://expo.dev/artifacts/eas/"* ]]; then

    	echo downloading .aab file...
		curl -L $line -o $(date +'%d-%m-%Y').aab
	fi
  done