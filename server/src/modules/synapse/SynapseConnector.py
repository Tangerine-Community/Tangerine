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
QUEUE_DOCS=False
DOC_FETCH_COUNT=100
DOC_FLUSH_COUNT=500000
TABLE_PREFIX=''

#
# Helper functions
# 

def log(msg):
    print("{} - {}".format(datetime.now().strftime("%m/%d/%Y, %H:%M:%S"), msg))

def get_last_change_seq(db):
    last_seq = 0
    changes = db.changes(descending=True)
    for change in changes:
        last_seq = change['seq']
        changes.stop()
    return last_seq

def update_state(last_change_seq):
    config.set("TANGERINE","lastsequence",last_change_seq)
    with open(os.path.join(os.getcwd(), 'data', 'connector.ini'), 'w') as configfile:
        config.write(configfile)

def update_doc_state(skip):
    config.set("TANGERINE", "skip", str(skip))
    with open(os.path.join(os.getcwd(), 'data', 'connector.ini'), 'w') as configfile:
        config.write(configfile)

def get_doc_state():
    try:
        return int(config.get("TANGERINE", "skip"))
    except configparser.NoOptionError:
        return 0

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
        synapse_span_table.flexsert_span_table_record(tableName, data)

def get_response_metadata(doc):
    caseId = doc.get('caseId')
    eventId = doc.get('eventId')
    eventFormId = doc.get('eventFormId')
    participantId = doc.get('participantId')

    metadata = {}
    metadata.update({'caseid': caseId})
    metadata.update({'participantid': participantId})
    metadata.update({'eventid': eventId})
    metadata.update({'eventformid': eventFormId})

    return metadata


def save_response(doc):
    global synapse_span_table
    doc_id = doc.get('_id')
    resp_data = doc.get('data')
    resp_data['id'] = doc_id

    metadata = get_response_metadata(doc)
    metadata.update(resp_data)
    data = metadata

    cleanData = {}
    for key in data.keys():
        cleanData[key.strip()] = data[key]
    data = cleanData
    formID = data.get('formId')

    if formID == 'mnh_neonatal_vaccination':
        return
    
    tableName = TABLE_PREFIX + formID
    if QUEUE_DOCS:
        synapse_span_table.queue_span_table_record(tableName, data)
    else:
        synapse_span_table.flexsert_span_table_record(tableName, data)

def save_doc(doc):
    id = doc.get('_id')
    doc_type = doc.get('type')
    if doc_type is not None:
        # log("Processing type: " + doc_type + ", id: " + id)
        if (doc_type.lower() == "response"):
            save_response(doc)
        else:
            save_entity(doc)
    else:
        log("Unexpected document type")

#
# Mode functions
#

class CouchDBConnectError(Exception):
    pass

def couchdb_connect():
    try:
        client = CouchDB(dbUserName, dbPassword, url=dbURL, connect=True, timeout=500)
        return client[dbName]
    except:
        raise CouchDBConnectError

def all_docs_mode():
    global QUEUE_DOCS
    QUEUE_DOCS = True

    complete = False
    try:
        while not complete:
            tangerine_database = couchdb_connect()
            skip = get_doc_state()

            start_time = timeit.default_timer()
            docs = tangerine_database.all_docs(include_docs=True, skip=skip, limit=DOC_FETCH_COUNT)
            rows = docs.get('rows', [])
            log('Queuing docs %d to %d' % (skip, skip + len(rows)))
            for row in rows:
                doc_id = row.get('id')
                doc = row.get('doc')
                save_doc(doc)
            end_time = timeit.default_timer()
            log('Queued %d docs in %d seconds' % (len(rows), int(end_time - start_time)))

            if len(rows) < DOC_FETCH_COUNT:
                complete = True
                skip = skip + len(rows)
                update_doc_state(skip)
                break

            skip = skip + len(rows)
            update_doc_state(skip)

    except CouchDBConnectError:
        pass
    finally:
        log(str('Flushing remaining docs'))
        start_time = timeit.default_timer()
        synapse_span_table.flush_span_tables()
        end_time = timeit.default_timer()
        log('Flushed docs in ' + str(int(end_time - start_time)) + ' seconds')

    return complete


def changes_feed_mode(lastSequence):
    global QUEUE_DOCS 
    QUEUE_DOCS = False
    tangerine_database = couchdb_connect()
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
    if lastSequence == '0':
        log('Processing all docs.')
        if all_docs_mode():
            log('Successfully processed all docs.')
            db = couchdb_connect()
            lastSequence = get_last_change_seq(db)
            log('Saving state with lastSequence of ' + lastSequence + '.')
            update_state(lastSequence)
    log('Processing changes with lastSequence of ' + lastSequence + '.')
    log('Logged into Tangerine database')
    changes_feed_mode(lastSequence)

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
synapse_span_table = SynapseSpanTable(syn, synProjectName, 
                                      columnLimit=MAX_NUMBER_OF_COLUMNS, 
                                      maxStringLength=MAX_STRING_LEN)
log ('Starting with last sequence of ' + lastSequence)
main_job(lastSequence)
