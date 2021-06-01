import pandas as pd
import json
import synapseclient
import configparser
import sched
import time
import timeit
import os

from datetime import datetime
from synapseclient import Activity
from synapseclient import Entity, Project, Folder, File, Link
from synapseclient import Evaluation, Submission, SubmissionStatus
from synapseclient import Schema, Column, Table, Row, RowSet, as_table_columns
from synapseclient import EntityViewType
from cloudant.client import CouchDB
from cloudant.result import Result, ResultByKey
from itertools import islice

from synapse_span_table.synapse_span_table import flexsert_span_table_record, install_span_table

#cloudant API documentation: https: https://python-cloudant.readthedocs.io/en/latest/client.html
#synapse Python API documentation:  https://python-docs.synapse.org/build/html/index.html

def save_entity(resp_dict):
    type = resp_dict.get('type')
    data = {}
    if (isinstance(resp_dict.get('data'), dict)) :
        data = resp_dict.pop('data', None)
        data.update(resp_dict)
    else :
        data = resp_dict
    data['id'] = data.get('_id')
    flexsert_span_table_record(syn, synProjectName, type, data)

def save_response(resp_dict):
    if resp_dict.get('type').lower() == "response":
        respid = resp_dict.get('_id')
        response_data = resp_dict.get('data')
        response_data['id'] = respid
        formID = response_data.get('formId')
        flexsert_span_table_record(syn, synProjectName, formID, response_data)

def update_state(last_change_seq):
    config.set("TANGERINE","lastsequence",last_change_seq)
    with open(os.path.join(os.getcwd(), 'data', 'connector.ini'), 'w') as configfile:
        config.write(configfile)

def main_job():
    client = CouchDB(dbUserName, dbPassword, url=dbURL, connect=True, timeout=500)
    session = client.session()
    tangerine_database = client[dbName]
    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S")+': Logged into Tangerine database')
    start_time = timeit.default_timer()
    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + ': Started converting documents from Tangerine to Synapse')
    changes = tangerine_database.changes(include_docs=True,descending=False,since=lastSequence)
    for change in changes:
        try:
            seq = change.get('seq')
            id = change.get('id')
            #check to see if is a delete change,if it is, just skip it
            if change.get('deleted'):
                #remove the ID from the table, but we don't know which table
                #delete_record(tangerine_database, id)
                continue
            doc = change.get('doc')  #that's a dictionary
            type = doc.get('type')
            print("Processing changes, document type: " + type)
            if (type.lower() == "response"):
                save_response(doc)
            elif type is not None :
                save_entity(doc)
            else:
                print("Unexpected document type")
            update_state(seq)
        except synapseclient.core.exceptions.SynapseHTTPError as e:
            # probably not our fault -- save the data
            print('SynapseHTTPError %s' % e)
    end_time = timeit.default_timer()
    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") +': Finished converting documents from Tangerine to Synapse')
    print('Total Time: ', end_time - start_time)
    client.disconnect()
    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") +': Disconnected from Tangerine database')

#read in the configuration file
config = configparser.ConfigParser()
try:
    config.read(os.path.join(os.getcwd(), 'data', 'connector.ini'))
except:
    print("Unexpected error:")
    
#get all sections
config.sections()
dbURL= config['TANGERINE']['databaseurl']
dbName= config['TANGERINE']['databasename']
dbUserName= config['TANGERINE']['databaseusername']
dbPassword= config['TANGERINE']['databasepassword']
lastSequence = config['TANGERINE']['lastsequence']
interval =config['TANGERINE']['run_interval']

print('Database URL:' +dbURL +' Database Name: ' + dbName + ' Username is: ' +dbUserName )
print ('Last sequence: ' + lastSequence)

#connection to synapse
syn = synapseclient.Synapse()
synProjectName= config['SYNAPSE']['ProjectName']
synUserName= config['SYNAPSE']['UserName']
apiKey= config['SYNAPSE']['apiKey']

print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S")+': Connecting to Synapse')

syn.login(email=synUserName, apiKey=apiKey)
project = syn.get(synProjectName)

install_span_table(syn, synProjectName)

print('Synapse project Name:' +synProjectName +' Synapse userName: ' + synUserName )
print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S")+': Logged into Synapse')

# run the scheduler
s = sched.scheduler(time.time, time.sleep)
def scheduled_job():
    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " Starting job ... ")
    main_job()
    s.enter(60*int(interval), 1, scheduled_job)

#delay 1 minute before starting the first run, then every interval minutes after the completions of the previous run before starting the next run
s.enter(1, 1, scheduled_job)
s.run()

#Logout from Synapse
syn.logout()

# Disconnect from the couchdb  server
#client.disconnect()

