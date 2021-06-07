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

from synapse_span_table.synapse_span_table import SynapseSpanTable
MAX_NUMBER_OF_COLUMNS=152
MAX_STRING_LEN=50
QUEUE_DOCS=True
DOC_FLUSH_COUNT=25
TABLE_PREFIX=''

#
# Helper functions
# 

def log(msg):
    print("{} - {}".format(datetime.now().strftime("%m/%d/%Y, %H:%M:%S"), msg))

def get_last_change_seq(db):
    changes = db.changes(descending=False, since=0, limit=50)
    for change in changes:
        #do nothing
        pass
    return changes.last_seq

def update_state(last_change_seq):
    config.set("TANGERINE","lastsequence",last_change_seq)
    with open(os.path.join(os.getcwd(), 'data', 'connector.ini'), 'w') as configfile:
        config.write(configfile)

#
# Save functions
#

def save_entity(doc):
    global synapse_span_table
    doc_type = doc.get('type')
    data = {}
    if (isinstance(doc.get('data'), dict)):
        data = doc.pop('data', None)
        data.update(doc)
    else:
        data = doc 
    data['id'] = data.get('_id')
    cleanData = {}
    case_data = data.get('data', None)
    if case_data:
        #flatten any sub-data that is a dict --- FIX ME
        for dict_item in case_data:
            if isinstance(case_data[dict_item], dict):
                case_data[dict_item].clear()
    for key in data.keys():
        # strip whitespase off the key and turn the value into a string of length MAX_STRING_LEN
        cleanData[key.strip()] = str(data[key])[:MAX_STRING_LEN]
    data = cleanData
    tableName = TABLE_PREFIX + doc_type
    if QUEUE_DOCS:
        synapse_span_table.queue_span_table_record(tableName, data)
    else:
        synapse_span_table.flexsert_span_table_record(tableName, data, MAX_NUMBER_OF_COLUMNS)

def save_response(doc):
    global synapse_span_table
    id = doc.get('_id')
    data = doc.get('data')
    data['id'] = id
    cleanData = {}
    for key in data.keys():
        cleanData[key.strip()] = data[key]
    data = cleanData
    formID = data.get('formId')
    tableName = TABLE_PREFIX + formID
    if QUEUE_DOCS:
        synapse_span_table.queue_span_table_record(tableName, data)
    else:
        synapse_span_table.flexsert_span_table_record(tableName, data, MAX_NUMBER_OF_COLUMNS)

def save_doc(doc):
    start_time = timeit.default_timer()
    id = doc.get('_id')
    type = doc.get('type')
    log("Processing type: " + type + ", id: " + id)
    if (type.lower() == "response"):
        save_response(doc)
    elif type is not None:
        save_entity(doc)
    else:
        log("Unexpected document type")
    end_time = timeit.default_timer()
    log('Processed doc in ' + str(int(end_time - start_time)) + ' seconds')

#
# Mode functions
#

def all_docs_mode(tangerine_database):
    QUEUE_DOCS = True
    cnt = 0
    try:
        for documentInfo in tangerine_database:
            doc = json.loads(documentInfo.json())
            save_doc(doc)
            cnt = cnt + 1
            if cnt % DOC_FLUSH_COUNT == 0:
                log('Flushing docs')
                start_time = timeit.default_timer()
                synapse_span_table.flush_span_tables()
                end_time = timeit.default_timer()
                log('Flushed docs in ' + str(int(end_time - start_time)) + ' seconds')
    except requests.HTTPError as exception:
        log('HTTPError while parsing all docs: %s' % exception)

def changes_feed_mode(tangerine_database, lastSequence):
    changes = tangerine_database.infinite_changes(include_docs=True, since=lastSequence)
    for change in changes:
        seq = change.get('seq')
        if seq:
            log('Processing sequence:' + seq)
        id = change.get('id')
        if change.get('deleted'):
            continue
        doc = change.get('doc')
        save_doc(doc)
        update_state(seq)

#
# Main job
#

def main_job(lastSequence):
    client = CouchDB(dbUserName, dbPassword, url=dbURL, connect=True, timeout=500)
    session = client.session()
    tangerine_database = client[dbName]
    log('Logged into Tangerine database')
    if lastSequence == '0':
        log('Processing all docs with a stashed lastSequence of ' + lastSequence + '.')
        lastSequence = get_last_change_seq(tangerine_database)
        all_docs_mode(tangerine_database)
        log('Successfully processed all docs. Saving state with lastSequence of ' + lastSequence + '.')
        update_state(lastSequence)
    log('Processing changes with lastSequence of ' + lastSequence + '.')
    changes_feed_mode(tangerine_database, lastSequence)

#
# Startup
#

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
TABLE_PREFIX = config['SYNAPSE']['tablePrefix']
syn.login(email=synUserName, apiKey=apiKey)
project = syn.get(synProjectName)
log('Installing Synapse Span Table')
synapse_span_table = SynapseSpanTable(syn, synProjectName, maxStringLength=MAX_STRING_LEN)
log ('Starting with last sequence of ' + lastSequence)
main_job(lastSequence)
