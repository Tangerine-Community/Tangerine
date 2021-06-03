import pandas as pd
import json
import synapseclient
import configparser
import sched
import time
import timeit
import os
import functools
print = functools.partial(print, flush=True)
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
MAX_NUMBER_OF_COLUMNS=20

def log(msg) :
    print("{} - {}").format(datetime.now().strftime("%m/%d/%Y, %H:%M:%S"), msg)

def save_entity(doc):
    type = doc.get('type')
    data = {}
    if (isinstance(doc.get('data'), dict)) :
        data = doc.pop('data', None)
        data.update(doc)
    else :
        data = doc 
    data['id'] = data.get('_id')
    cleanData = {}
    for key in data.keys():
        cleanData[key.strip()] = data[key]
    data = cleanData
    flexsert_span_table_record(syn, synProjectName, type, data, MAX_NUMBER_OF_COLUMNS)

def save_response(doc):
    id = doc.get('_id')
    data = doc.get('data')
    data['id'] = id
    cleanData = {}
    for key in data.keys():
        cleanData[key.strip()] = data[key]
    data = cleanData
    formID = data.get('formId')
    flexsert_span_table_record(syn, synProjectName, formID, data, MAX_NUMBER_OF_COLUMNS)

def update_state(last_change_seq):
    config.set("TANGERINE","lastsequence",last_change_seq)
    with open(os.path.join(os.getcwd(), 'data', 'connector.ini'), 'w') as configfile:
        config.write(configfile)

def process_doc(doc) :
    type = doc.get('type')
    log("Processing type: " + type + ", id: " + id)
    if (type.lower() == "response"):
        save_response(doc)
    elif type is not None :
        save_entity(doc)
    else:
        log("Unexpected document type")
 
def process_all_docs(tangerine_database) :
    for documentInfo in tangerine_database :
        doc = json.loads(documentInfo.json())
        process_doc(doc)

def process_changes(tangerine_database) :
    changes = tangerine_database.changes(feed='continuous',include_docs=True,descending=False,since=lastSequence)
    for change in changes:
        start_time = timeit.default_timer()
        seq = change.get('seq')
        if seq :
            log('Processing sequence:' + seq)
        id = change.get('id')
        if change.get('deleted'):
            continue
        doc = change.get('doc')
        process_doc(doc)
        update_state(seq)
        end_time = timeit.default_timer()
        log('Processed change in ' + str(int(end_time - start_time)) + ' seconds')

def main_job():
    client = CouchDB(dbUserName, dbPassword, url=dbURL, connect=True, timeout=500)
    session = client.session()
    tangerine_database = client[dbName]
    log('Logged into Tangerine database')
    if lastSequence is '0':
        lastSequence = get_last_change_seq()
        log('Processing all docs with a stashed lastSequence of ' + lastSequence + '.')
        process_all_docs(tangerine_database)
        log('Successfully processed all docs. Saving state with lastSequence of ' + lastSequence + '.')
        update_state(lastSequence)
    log('Processing changes with lastSequence of ' + lastSequence + '.')
    process_changes(tangerine_database)

log('Loading configuration from connector.ini')
config = configparser.ConfigParser()
try:
    config.read(os.path.join(os.getcwd(), 'data', 'connector.ini'))
except:
    log("Could not read config")
config.sections()
dbURL= config['TANGERINE']['databaseurl']
dbName= config['TANGERINE']['databasename']
dbUserName= config['TANGERINE']['databaseusername']
dbPassword= config['TANGERINE']['databasepassword']
lastSequence = config['TANGERINE']['lastsequence']
log('Connecting to Synapse')
syn = synapseclient.Synapse()
synProjectName= config['SYNAPSE']['ProjectName']
synUserName= config['SYNAPSE']['UserName']
apiKey= config['SYNAPSE']['apiKey']
syn.login(email=synUserName, apiKey=apiKey)
project = syn.get(synProjectName)
log('Installing Synapse Span Table')
install_span_table(syn, synProjectName)
log ('Starting with last sequence of ' + lastSequence)
main_job()
