counter=10000
while [ $counter -gt 0 ]
do
		curl -XPUT -d '{"foo":"bar"}' localhost:5985/tangerine/$counter
   counter=$(( $counter - 1 ))
done
