# Synapse Connector for Tangerine

To start the connector, run the following commands.

```
# Connector code lives in the Tangerine repository.
git clone https://github.com/tangerine-community/tangerine
cd tangerine/server/src/modules/synapse
# Configure for the specific Tangerine Group and Synapse Project.
cp connector.ini_example connector.ini
vim connector.ini
# This will build a docker image and start a container with your configuration.
./start.sh
```

Need to clear out the synapse project and reset last sequence to 0? Run `./clear-cache.sh`.

## Development
- cloudant API documentation: https: https://python-cloudant.readthedocs.io/en/latest/client.html
- synapse Python API documentation:  https://python-docs.synapse.org/build/html/index.html
- Synapse Span Table documentation:  https://github.com/ICTatRTI/synapse-span-table

