docker logs python-tangerine-synapse-connector | grep 'Processed change in' | awk '{print $7}' | sort | uniq -c
