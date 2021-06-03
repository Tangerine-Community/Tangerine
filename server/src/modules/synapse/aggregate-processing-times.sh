docker logs python-tangerine-synapse-connector | grep 'Processed doc in' | awk '{print $7}' | sort | sed 's/.$//' | uniq -c | xargs -I {} echo "{}0+ seconds"
