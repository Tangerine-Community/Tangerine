counter=10000
while [ $counter -gt 0 ]
do
		curl -XPUT localhost:5984/tangerine/$counter
   counter=$(( $counter - 1 ))
done
