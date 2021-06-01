# Start with docker-tangerine-base-image, which provides the core Tangerine apps.
FROM python:3.8

#install required Python libraries
RUN pip install couchdb
RUN python -m pip install git+https://github.com/schferbe/python-cloudant.git
RUN pip install pandas
RUN pip install numpy
#since we modfied the file, not sure how we can make sure the local version is being called
RUN pip install synapseclient
RUN apt-get update && apt-get install -y vim
RUN git clone https://github.com/ICTatRTI/synapse-span-table.git synapse_span_table

#Add the connector Python script files
ADD TangerineConnector.py /

ENTRYPOINT [ "python", "/TangerineConnector.py" ]
