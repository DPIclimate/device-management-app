#!/bin/sh
# Cleans up unused dependencies in node project

for i in $(depcheck | sed 's/* //')
do
	if [ $i != 'devDependencies' ];then
		if [ $i != 'Unused' ]; then
			echo "Uninstalling dependency" $i
			npm uninstall --save $i
		fi
	else
		echo "All unused dependencies have been removed"
		break
	fi
done
