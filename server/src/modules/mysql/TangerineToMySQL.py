import configparser
import sched
import cloudant
import pandas as pd
import os
import sys
import json
import mysql.connector
import pymysql
import time
import timeit

from datetime import datetime
from cloudant.client import CouchDB
from sqlalchemy import create_engine
from sqlalchemy import DDL
from cloudant.result import Result, ResultByKey
from itertools import islice

def log(message):
    print(message)
    sys.stdout.flush()

#convert a Tangerine case  document to MySQL case record in case table
def convert_case(resp_dict):
    global case_synID
    global case_eTag
    global case_df_update
    global case_df_add
    global case_df_old

    type = resp_dict.get('type')
    if (type.lower() == "case"):
        # handle case type
        caseDefID = resp_dict.get('caseDefinitionId')
        caseId = resp_dict.get('_id')
        dbRev = resp_dict.get('_rev')
        collection = resp_dict.get('collection')
        startDatetime = resp_dict.get('startDatetime')
        uploadDatetime = resp_dict.get('uploadDatetime')
        caseData = resp_dict.get('data')
        if 'caseDefinitionId' not in caseData:
            caseData.update({'caseDefinitionId': caseDefID})
        if 'dbRevision' not in caseData:
            caseData.update({'dbRevision': dbRev})
        if 'collection' not in caseData:
            caseData.update({'collection': collection})
        if 'startDatetime' not in caseData:
            caseData.update({'startDatetime': startDatetime})
        if 'uploadDatetime' not in caseData:
            caseData.update({'uploadDatetime': uploadDatetime})

        df = pd.DataFrame([caseData])
        df.rename(columns={'_id': 'CaseID'}, inplace=True)
        # Try 3 things to insert data...
        #     1) Insert the data as a new or updated row. If that fails...
        #     2) There may be a schema update so try pulling out all the data from the database, appending what we're inserting, and then overwrite the table. If that fails...
        #     3) Then the database doesn't exist! Just insert it.
        try:
            #delete the case if it already exists in table so we can add the new one
            qry = "SELECT * FROM " + mysqlDatabaseName + ".case_instances where CaseID='" + caseId+"'"
            cursor.execute(qry)
            if cursor.rowcount >= 1:
                cursor.execute("Delete from " + mysqlDatabaseName + ".case_instances where CaseID='" + caseId+"'")
                mysql_connection.commit()
            # this will fail if there is a new column
            mysql_connection.commit()
            df.to_sql(name='case_instances', con=engine, if_exists='append', index=False)
            mysql_connection.commit()
        except:
            try:
                data = pd.read_sql('SELECT * FROM ' + mysqlDatabaseName + '.case_instances', engine)
                df2 = pd.concat([data, df], sort=False)
                mysql_connection.commit()
                df2.to_sql(name='case_instances', con=engine, if_exists='replace', index=False)
                mysql_connection.commit()
            except:
                mysql_connection.commit()
                df.to_sql(name='case_instances', con=engine, if_exists='replace', index=False)
                mysql_connection.commit()

#convert a Tangerine participant  document to MySQL participant table
def convert_participant(resp_dict):
    global participant_df_add
    global participant_df_update
    global participant_df_old
    global participant_synID
    global participant_eTag

    type = resp_dict.get('type')
    if (type.lower() == "participant"):
        caseId = resp_dict.get('caseId')
        participantId = resp_dict.get('_id')
        dbRev = resp_dict.get('_rev')
        role = resp_dict.get("caseRoleId")

        participantData = resp_dict.get('data')
        if 'ParticipantID' not in participantData:
            participantData.update({'ParticipantID': participantId})
        if 'CaseID' not in participantData:
            participantData.update({'CaseID': caseId})
        if 'caseRoleId' not in participantData:
            participantData.update({'caseRoleId': role})
        if 'dbRevision' not in participantData:
            participantData.update({'dbRevision': dbRev})

        #check to see if we have any additional data elements that we need to convert and save to MySQL database
        del resp_dict["data"]
        del resp_dict["caseId"]
        del resp_dict["_id"]
        del resp_dict["_rev"]
        del resp_dict["caseRoleId"]
        del resp_dict["id"]
        del resp_dict["type"]

        if resp_dict is not None:
            for key in resp_dict:
                participantData.update({key: resp_dict.get(key)})

        df = pd.DataFrame([participantData])
        # RJ: Do we need a df.rename() like we do on other types of data?
        # Try 3 things to insert data...
        #     1) Insert the data as a new or updated row. If that fails...
        #     2) There may be a schema update so try pulling out all the data from the database, appending what we're inserting, and then overwrite the table. If that fails...
        #     3) Then the database doesn't exist! Just insert it.
        try:
            #delete the Participant if it already exists in table so we can add the new one
            qry = "SELECT * FROM " + mysqlDatabaseName + ".participant where ParticipantID='" + participantId+"'"
            cursor.execute(qry)
            if cursor.rowcount >= 1:
                cursor.execute("Delete from " + mysqlDatabaseName + ".participant where ParticipantID='" + participantId+"'")
                mysql_connection.commit()
            # this will fail if there is a new column
            mysql_connection.commit()
            df.to_sql(name='participant', con=engine, if_exists='append', index=False)
            mysql_connection.commit()
        except:
            try:
                data = pd.read_sql('SELECT * FROM ' + mysqlDatabaseName + '.participant', engine)
                df2 = pd.concat([data, df], sort=False)
                mysql_connection.commit()
                df2.to_sql(name='participant', con=engine, if_exists='replace', index=False)
                mysql_connection.commit()
            except:
                mysql_connection.commit()
                df.to_sql(name='participant', con=engine, if_exists='replace', index=False)
                mysql_connection.commit()

#convert a Tangerine case-event  document to MySQL case-event table
def convert_case_event(resp_dict):
    global case_event_df_add
    global case_event_df_update
    global case_event_df_old
    global case_event_synID
    global case_event_eTag

    type = resp_dict.get('type')
    if (type.lower() == "case-event"):
        caseEventId = resp_dict.get('_id')
        del resp_dict["id"]
        del resp_dict["type"]
        df = pd.DataFrame([resp_dict])
        df.rename(columns={'_id': 'CaseEventID', '_rev': 'dbRevision'}, inplace=True)
        # Try 3 things to insert data...
        #     1) Insert the data as a new or updated row. If that fails...
        #     2) There may be a schema update so try pulling out all the data from the database, appending what we're inserting, and then overwrite the table. If that fails...
        #     3) Then the database doesn't exist! Just insert it.
        try:
            #delete the CaseEvent if it already exists in table so we can add the new one
            qry = "SELECT * FROM " + mysqlDatabaseName + ".caseevent where CaseEventID='" + caseEventId+"'"
            cursor.execute(qry)
            if cursor.rowcount >= 1:
                cursor.execute("Delete from " + mysqlDatabaseName + ".caseevent where CaseEventID='" + caseEventId+"'")
                mysql_connection.commit()
            # this will fail if there is a new column
            mysql_connection.commit()
            df.to_sql(name='caseevent', con=engine, if_exists='append', index=False)
            mysql_connection.commit()
        except:
            try:
                data = pd.read_sql('SELECT * FROM ' + mysqlDatabaseName + '.caseevent', engine)
                df2 = pd.concat([data, df], sort=False)
                mysql_connection.commit()
                df2.to_sql(name='caseevent', con=engine, if_exists='replace', index=False)
                mysql_connection.commit()
            except:
                mysql_connection.commit()
                df.to_sql(name='caseevent', con=engine, if_exists='replace', index=False)
                mysql_connection.commit()
 
#convert a Tangerine event form document to MySQL event_form table
def convert_event_form(resp_dict):
    global event_form_df_add
    global event_form_df_update
    global event_form_df_old
    global event_form_synID
    global event_form_eTag

    type = resp_dict.get('type')
    # there are 4 major types: case, participant, case-event, event-form
    if (type.lower() == "event-form"):
        # handle case-event, this is skipped
        eventFormId = resp_dict.get('_id')
        del resp_dict["id"]
        del resp_dict["type"]
        df = pd.DataFrame([resp_dict])
        df.rename(columns={'_id': 'EventFormID', '_rev': 'dbRevision'}, inplace=True)
        # Try 3 things to insert data...
        #     1) Insert the data as a new or updated row. If that fails...
        #     2) There may be a schema update so try pulling out all the data from the database, appending what we're inserting, and then overwrite the table. If that fails...
        #     3) Then the database doesn't exist! Just insert it.
        try:
            #delete the EventForm if it already exists in table so we can add the new one
            qry = "SELECT * FROM " + mysqlDatabaseName + ".eventform where EventFormID='" + eventFormId+"'"
            cursor.execute(qry)
            if cursor.rowcount >= 1:
                cursor.execute("Delete from " + mysqlDatabaseName + ".eventform where EventFormID='" + eventFormId+"'")
                mysql_connection.commit()
            # this will fail if there is a new column
            mysql_connection.commit()
            df.to_sql(name='eventform', con=engine, if_exists='append', index=False)
            mysql_connection.commit()
        except:
            try: 
                data = pd.read_sql('SELECT * FROM ' + mysqlDatabaseName + '.eventform', engine)
                df2 = pd.concat([data, df], sort=False)
                mysql_connection.commit()
                df2.to_sql(name='eventform', con=engine, if_exists='replace', index=False)
                mysql_connection.commit()
            except:
                mysql_connection.commit()
                df.to_sql(name='eventform', con=engine, if_exists='replace', index=False)
                mysql_connection.commit()


#convert a Tangerine response document to MySQL response tables
def convert_response(resp_dict):
    global response_tables
    type = resp_dict.get('type')
    # there are 4 major types: case, participant, case-event, event-form
    if (type.lower() == "response"):
        id= resp_dict.get('_id')
        startDatetime = resp_dict.get('startDatetime')
        geoIp = resp_dict.get('geoip')
        caseId = resp_dict.get('caseId')
        eventId = resp_dict.get('eventId')
        eventFormId=  resp_dict.get('eventFormId')
        participantId = resp_dict.get('participantId')
        caseEventId = resp_dict.get('caseEventId')

        response = resp_dict.get('data')
        formID = response.get('formid')
        # Make formID safe for SQL table naming and protect against empty formId.
        # RJ: Why would formId be blank? Is that ok?
        if isinstance(formID,str):
            formID = formID.replace('-', '_')
        else:
            return

        #need to delete ID element from response as it's form ID which is useless but it causes confusion with _ID
        #del response["id"]

        # append geoIP to the response dict
        if geoIp is not None:
            for key in geoIp:
                response.update({'geoip_' + key: geoIp.get(key)})

        # make sure id is in the dictionary, otherwise add it
        if '_id' not in response:
            response.update({'_id': id})
        if 'caseid' not in response:
            response.update({'caseid': caseId})
        if 'participantid' not in response:
            response.update({'participantid': participantId})
        if 'eventid' not in response:
            response.update({'eventid': eventId})
        if 'eventformid' not in response:
            response.update({'eventformid': eventFormId})
        if 'caseeventid' not in response:
            response.update({'caseeventid': caseEventId})
        if 'startdatetime' not in response:
            response.update({'startdatetime': startDatetime})

        df = pd.DataFrame([response])  # wrapping your dictionary in to list, this works for only 1 record
        df.rename(columns={'_id': 'ID', '_rev': 'dbRevision'}, inplace=True)
        # Try 3 things to insert data...
        #     1) Insert the data as a new or updated row. If that fails...
        #     2) There may be a schema update so try pulling out all the data from the database, appending what we're inserting, and then overwrite the table. If that fails...
        #     3) Then the database doesn't exist! Just insert it.
        try:
            #delete the ID for the given form table if it already exists in table so we can add the new one
            qry = "SELECT * FROM " + mysqlDatabaseName + "." + formID + " where ID='" + id+"'"
            cursor.execute(qry)
            if cursor.rowcount >= 1:
                cursor.execute("Delete from " + mysqlDatabaseName + "." + formID+" where ID='" + id+"'")
                mysql_connection.commit()

            # this will fail if there is a new column
            mysql_connection.commit()
            df.to_sql(name=formID, con=engine, if_exists='append', index=False)
            mysql_connection.commit()
        except:
            try: 
                data = pd.read_sql('SELECT * FROM ' + mysqlDatabaseName + '.'+formID, engine)
                df2 = pd.concat([data, df], sort=False)
                mysql_connection.commit()
                df2.to_sql(name=formID, con=engine, if_exists='replace', index=False)
                mysql_connection.commit()
            except:
                mysql_connection.commit()
                df.to_sql(name=formID, con=engine, if_exists='replace', index=False)
                mysql_connection.commit()
 

def delete_record(tangerine_database,id):
    with cloudant.document.Document(tangerine_database, document_id=id) as document:
        doc_dict = json.loads(document.json())
        type = doc_dict.get('type')
        # for deleted documents, the type element is no longer available
        if (type.lower() == "case"):
            # handle case type
            cursor.execute("Delete from " + mysqlDatabaseName + ".case where CaseID='" + id + "'")
            mysql_connection.commit()
        elif (type.lower() == "participant"):
            # pass
            cursor.execute("Delete from " + mysqlDatabaseName + ".participant where ParticipantID='" + id + "'")
            mysql_connection.commit()
        elif (type.lower() == "event-form"):
            # pass
            cursor.execute("Delete from " + mysqlDatabaseName + ".eventform where EventFormID='" + id + "'")
            mysql_connection.commit()
        elif (type.lower() == "case-event"):
            cursor.execute("Delete from " + mysqlDatabaseName + ".caseevent where CaseEventID='" + id + "'")
            mysql_connection.commit()
        elif (type.lower() == "response"):
            response = doc_dict.get('data')
            formID = response.get('formId').replace('-', '_')
            cursor.execute("Delete from " + mysqlDatabaseName + "." + formID + " where ID='" + id + "'")
            mysql_connection.commit()
        else:
            log("Unexpected document type")


def main_job():
    global lastSequence
    global case_df_add
    global case_df_update
    global participant_df_add
    global participant_df_update
    global event_form_df_add
    global event_form_df_update
    global case_event_df_add
    global case_event_df_update
    client = CouchDB(dbUserName, dbPassword, url=dbURL, connect=True, use_basic_auth=True)
    session = client.session()
    tangerine_database = client.create_database(dbName)
    mysql_database = mysql.connector.connect(user=mysqlUserName, password=mysqlPassword,
                                  host=mysqlHostName,
                                  database=mysqlDatabaseName)
    cursor = mysql_database.cursor()
    start_time = timeit.default_timer()
    changes = tangerine_database.changes(include_docs=True,descending=False,  since=lastSequence)
    cnt2 = 0
    for change in changes:
        cnt2 = cnt2 + 1
        if change is not None:
            seq = change.get('seq')
            lastSequence = seq 
            id = change.get('id')
            cng = change.get('changes')
            # Check to see if is a delete change,if it is, just delete the record.
            if change.get('deleted'):
                # Remove the ID from the table, but we don't know which table.
                # @TODO
                #delete_record(tangerine_database, id)
                continue
            version = cng[0].get('rev')
            doc = change.get('doc')
            type = doc.get('type')
            if type is not None:
                id = doc.get('_id')
                log("Processing Seq: " + lastSequence + ", ID: " + id)
                # There are 5 major types: case, participant, case-event, event-form and response
                if (type.lower() == "case"):
                    convert_case(doc)
                elif (type.lower() == "participant"):
                    convert_participant(doc)
                elif (type.lower() == "event-form"):
                    convert_event_form(doc)
                elif (type.lower() == "case-event"):
                    convert_case_event(doc)
                elif (type.lower() == "response"):
                    convert_response(doc)
                else:
                    log("Unexpected document type: " + id)

    # Write the last sequence number back to the INI file, the last sequence number won't work if descending is set to true.
    config.set("TANGERINE","LastSequence",lastSequence)
    with open(sys.argv[1], 'w') as configfile:
        config.write(configfile)
    # Finish.
    end_time = timeit.default_timer()
    totalTime = end_time - start_time
    if (cnt2 > 0):
        log('Finished converting documents from Tangerine to MySQL. Total Time: ' + str(totalTime))
    client.disconnect()

# Run the scheduler.
def scheduled_job():
    main_job()
    s.enter(60*int(interval), 1, scheduled_job)

# Read in the configuration file.
config = configparser.ConfigParser()
pathName = sys.argv[1]
config.read(pathName)
config.sections()
dbURL = config['TANGERINE']['DatabaseURL']
dbName = config['TANGERINE']['DatabaseName']
dbUserName = config['TANGERINE']['DatabaseUserName']
dbPassword = config['TANGERINE']['DatabasePassword']
lastSequence = config['TANGERINE']['LastSequence']
reportingDelayInMinutes = round((int(os.getenv('T_REPORTING_DELAY')) / 1000) / 60)
if (reportingDelayInMinutes == 0):
    interval = 1
else:
    interval = reportingDelayInMinutes

# Connection to CouchDB.
client = CouchDB(dbUserName, dbPassword, url=dbURL, connect=True, use_basic_auth=True)
session = client.session()
tangerine_database = client.create_database(dbName)

# Connection to MySQL database.
mysqlHostName = config['MySQL']['HostName']
mysqlDatabaseName = config['MySQL']['DatabaseName']
mysqlUserName = config['MySQL']['UserName']
mysqlPassword = config['MySQL']['Password']


# API: https://docs.sqlalchemy.org/en/13/core/engines.html
mysql_connection_string = 'mysql+pymysql://'+mysqlUserName+':'+mysqlPassword+'@'+mysqlHostName+':3306/'+mysqlDatabaseName
engine = create_engine(mysql_connection_string)
mysql_connection = engine.raw_connection()
cursor = mysql_connection.cursor()
# Delay 1 minute before starting the first run, then every interval minutes after the completions of the previous run before starting the next run
s = sched.scheduler(time.time, time.sleep)
s.enter(1, 1, scheduled_job)
s.run()
