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

#the last_seq of the changes is not returned until the ietration is completed
def get_last_change_seq(db):
    changes = db.changes(descending=False, since=0)
    for change in changes:
        #do nothing
        pass
    return changes.last_seq


#convert a Tangeliner case  document to MySQL case record in case table
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
                log("case_instances already exists")
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
                log(df2)
                mysql_connection.commit()
                df2.to_sql(name='case_instances', con=engine, if_exists='replace', index=False)
                mysql_connection.commit()
            except:
                mysql_connection.commit()
                df.to_sql(name='case_instances', con=engine, if_exists='replace', index=False)
                mysql_connection.commit()

        # add_column = DDL('ALTER TABLE USERS ADD COLUMN city VARCHAR(60) AFTER email')
        # engine.execute(add_column)


#convert a Tangeliner participant  document to MySQL participant table
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
                log("participant already exists")
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

#convert a Tangeliner case-event  document to MySQL case-event table
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
                log("CaseEvent already exists")
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
 
#convert a Tangeliner event form document to MySQL event_form table
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
                log("EventForm already exists")
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


#convert a Tangeliner response document to MySQL response tables
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
        formID = response.get('formId')
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
        if 'caseId' not in response:
            response.update({'caseId': caseId})
        if 'participantId' not in response:
            response.update({'participantId': participantId})
        if 'eventId' not in response:
            response.update({'eventId': eventId})
        if 'eventFormId' not in response:
            response.update({'eventFormId': eventFormId})
        if 'caseEventId' not in response:
            response.update({'caseEventId': caseEventId})
        if 'startDatetime' not in response:
            response.update({'startDatetime': startDatetime})

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
                log("Response ID already exists")
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
 

def delete_record(tangerline_database,id):
    with cloudant.document.Document(tangerline_database, document_id=id) as document:
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

    #login
    client = CouchDB(dbUserName, dbPassword, url=dbURL, connect=True, use_basic_auth=True)
    session = client.session()
    tangerline_database = client.create_database(dbName)
    log(datetime.now().strftime("%m/%d/%Y, %H:%M:%S")+': Logged into Tangerine database')


    #login to MySQL
    mysql_database = mysql.connector.connect(user=mysqlUserName, password=mysqlPassword,
                                  host=mysqlHostName,
                                  database=mysqlDatabaseName)

    cursor = mysql_database.cursor()


    start_time = timeit.default_timer()
    log(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + ': Started converting documents from Tangeline to MySQL')
    #if sequence number is 0, then we are starting with a new database so let's do initial data converaison from Tanger couchDB to MySQL
    # Iterate over a "normal" _changes feed
    changes = tangerline_database.changes(include_docs=True,descending=False,  since=lastSequence)
    cnt2 = 0
    for change in changes:
        cnt2 = cnt2 + 1
        #log(change)
        #change is a dictionary object
        if change is not None:
            seq = change.get('seq')
            id = change.get('id')
            cng = change.get('changes')
            #check to see if is a delete change,if it is, just delete the record
            if change.get('deleted'):
                #remove the ID from the table, but we don't know which table
                #delete_record(tangerline_database, id)
                continue
            #get the change revision
            version = cng[0].get('rev')
            doc = change.get('doc')  #that's a doctionary
            #log(doc)
            #need to handle delete changes
            type = doc.get('type')
            id = doc.get('_id')
            log("Processing changes, document type: " + type + ", Count: " + str(cnt2) + ", ID: " + id)
            # there are 5 major types: case, participant, case-event, event-form and response
            if (type.lower() == "case"):
                # handle case type
                convert_case(doc)
            elif (type.lower() == "participant"):
                # participant is already handled in case, ignore, donothing
                #pass
                convert_participant(doc)
            elif (type.lower() == "event-form"):
                #pass
                convert_event_form(doc)
            # handle case-event, this is skipped
            elif (type.lower() == "case-event"):
                # handle case-event, this is skipped
                #pass
                convert_case_event(doc)
                # convert_document(document)
            elif (type.lower() == "response"):
                # handle case-event, this is skipped
                #pass
                convert_response(doc)
                # convert_document(document)
            else:
                log("Unexpected document type")
        lastSequence = change.get('seq')

    #write the last sequence number back to the INI file, tlast sequence number won't work if descending is set to true
    config.set("TANGERINE","LastSequence",lastSequence)
    # Writing the configuration file to

    log(sys.argv[1])   
    with open(sys.argv[1], 'w') as configfile:
        config.write(configfile)

    end_time = timeit.default_timer()
    log(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") +': Finished converting documents from Tangeline to MySQL')
    totalTime = end_time - start_time
    log('Total Time: ' + str(totalTime))
    #logout and disconnect
    client.disconnect()
    log(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") +': Disconnected from Tangerline database')
    #need to keep the connection open, or rewirte how it is connected, some issues ...
    #mysql_connection.close()
    #log(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") +': Disconnected from MySQL database')

#run the scheduler
def scheduled_job():
    log(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " Starting job ... ")
    main_job()
    s.enter(60*int(interval), 1, scheduled_job)


#read in the configuration file
config = configparser.ConfigParser()
pathName = sys.argv[1]
log('Config file: ' + pathName)
config.read(pathName)

#get all sections
config.sections()
dbURL = config['TANGERINE']['DatabaseURL']
dbName = config['TANGERINE']['DatabaseName']
dbUserName = config['TANGERINE']['DatabaseUserName']
dbPassword = config['TANGERINE']['DatabasePassword']
lastSequence = config['TANGERINE']['LastSequence']
interval = config['TANGERINE']['run_interval']

log('Database URL:' +dbURL +' Database Name: ' + dbName + ' Username is: ' +dbUserName )

#login
client = CouchDB(dbUserName, dbPassword, url=dbURL, connect=True, use_basic_auth=True)

session = client.session()
tangerline_database = client.create_database(dbName)
# log(datetime.now().strftime("%m/%d/%Y, %H:%M:%S")+': Logged into Tangerine database')


#connection to MySQL database
mysqlHostName = config['MySQL']['HostName']
mysqlDatabaseName = config['MySQL']['DatabaseName']
mysqlUserName = config['MySQL']['UserName']
mysqlPassword = config['MySQL']['Password']


log('MySQL Connection String:' +mysqlHostName +'  database: ' + mysqlDatabaseName + " username: " + mysqlUserName)
log(datetime.now().strftime("%m/%d/%Y, %H:%M:%S")+': Logged into MySQL')

#
# RJ: Commenting this out because it looks like a redundant connection to the MySQL database.
#
#mysql_connection = mysql.connector.connect(user=mysqlUserName, password=mysqlPassword,
#                              host=mysqlHostName,
#                              database=mysqlDatabaseName)

#api: https://docs.sqlalchemy.org/en/13/core/engines.html
#dialect+driver://username:password@host:port/database
#engine = create_engine('mysql+mysqlconnector://[user]:[pass]@[host]:[port]/[schema]', echo=False)
#engine = create_engine('mysql+pymysql://'+mysqlUserName+':'+mysqlPassword+'@'+mysqlHostName+'/'+mysqlDatabaseName, echo=False)
mysql_connection_string = 'mysql+pymysql://'+mysqlUserName+':'+mysqlPassword+'@'+mysqlHostName+':3306/'+mysqlDatabaseName
engine = create_engine(mysql_connection_string)
mysql_connection = engine.raw_connection()
cursor = mysql_connection.cursor()

#main_job()

s = sched.scheduler(time.time, time.sleep)
#delay 1 minute before starting the first run, then every interval minutes after the completions of the proveious run before starting the next run
s.enter(1, 1, scheduled_job)
s.run()


#Logout from MySQL
#mysql_connection.close()

# Disconnect from the couchdb server
#client.disconnect()

