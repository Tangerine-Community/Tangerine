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

#cloudant API documentation: https: https://python-cloudant.readthedocs.io/en/latest/client.html
#synapse Python API documentation:  https://python-docs.synapse.org/build/html/index.html

#last sequence
lastSequence ="0"

#initlaize variables so that we check the table schema when a new record is added for the first time but will skip it for the rest of records for performance
case_df_add = pd.DataFrame()
case_df_update = pd.DataFrame()
case_df_old = pd.DataFrame()
case_synID =""
case_eTag = None

participant_df_add = pd.DataFrame()
participant_df_update = pd.DataFrame()
participant_df_old = pd.DataFrame()
participant_synID =""
participant_eTag = None

event_form_df_add = pd.DataFrame()
event_form_df_update = pd.DataFrame()
event_form_df_old = pd.DataFrame()
event_form_synID =""
event_form_eTag = None

case_event_df_add = pd.DataFrame()
case_event_df_update = pd.DataFrame()
case_event_df_old = pd.DataFrame()
case_event_synID =""
case_event_eTag = None

response_tables = []

# split a dictionary into multiple sub dictonary with the same length
def dict_split(d, chunk_size=1):
    results = []
    items = d.items()
    dict_size = len(items)

    for i in range(0, dict_size, chunk_size):
        start = i
        end = i + chunk_size
        sub_d = dict(islice(d.items(), start, end))
        results.append(sub_d)

    return results

def dataframe_by_columns_intersection(dataframe, columns):
    return dataframe.reindex(columns=dataframe.columns.intersection(columns)).ffill()

def dataframe_by_columns_symmetric_difference(dataframe, columns):
    return dataframe.reindex(columns=dataframe.columns.symmetric_difference(columns)).ffill()

def dataframe_by_columns_union(dataframe, columns):
    return dataframe.reindex(columns=dataframe.columns.union(columns)).ffill()

# Function takes data in a new dataframe and adds it appropriately to synapse tables
# - Rows are added to synapse tables until there are 152 columns
# - Newly added variables are appended to the end of the last table, unless it has 152 columns
# - Deleted variables are left in place
# create the table with the metadata first
# Return:
# - list of columns entered into the table
def get_metadata(resp_dict):
    # get the metadata from the dataframe --- yes, this could be improved
    respid = resp_dict.get('_id')
    startDatetime = resp_dict.get('startDatetime')
    geoIp = resp_dict.get('geoip')
    caseId = resp_dict.get('caseId')
    eventId = resp_dict.get('eventId')
    eventFormId = resp_dict.get('eventFormId')
    participantId = resp_dict.get('participantId')
    caseEventId = resp_dict.get('caseEventId')

    # add id data at the beginning in the dictionary
    meta_data = {}
    meta_data.update({'_id': respid})
    meta_data.update({'caseId': caseId})
    meta_data.update({'participantId': participantId})
    meta_data.update({'eventId': eventId})
    meta_data.update({'eventFormId': eventFormId})
    meta_data.update({'caseEventId': caseEventId})
    meta_data.update({'startDatetime': startDatetime})

    # append geoIP to the response dict
    if geoIp is not None:
        for key in geoIp:
            meta_data.update({'geoip_' + key: geoIp.get(key)})

    metadata_df = pd.DataFrame([meta_data])
    metadata_df.rename(columns={'_id': 'ID', '_rev': 'dbRevision'}, inplace=True)

    return metadata_df


def create_new_table_with_metadata(resp_dict, formID, dataframe, index=1):
    metadata_df = get_metadata(resp_dict)
    df = metadata_df.join(dataframe)

    if len(df.columns) > 152:
        df = df.iloc[:,[0,152]]

    # create the table with the metadata
    print('Creating response form data table: %s_%d' % (formID, index))
    table = synapseclient.table.build_table(formID + "_" + str(index), synProjectName, df)
    syn.store(table)

    # return the non-metadata columns that were used
    return list(set(df.columns) ^ set(metadata_df))


# create the table with the metadata
def create_new_table(formID, df, index=1):
    if len(df.columns) > 152:
        # safeguard adding too many columns
        df = df.iloc[:,[0,152]]

    print('Creating response form data table: %s_%d' % (formID, index))
    table = synapseclient.table.build_table(formID + "_" + str(index), synProjectName, df)
    syn.store(table)

    # return the columns that were used
    return df.columns


#update Synapse table schema if needed when a new record is saved
def add_data_to_synapse_table(resp_dict, table, table_df):
    print('Adding response form data table: %s' % table.tableId)

    metadata_df = get_metadata(resp_dict)
    metadata_cols = list(set(table_df.columns) ^ set(metadata_df))
    table_df = dataframe_by_columns_intersection(table_df, metadata_cols)
    df = metadata_df.join(table_df)

    if len(df.columns) > 152:
        df = df.iloc[:,[0,152]]

    used_columns = []
    # only add the table df columns, no the metadata
    for col in table_df.columns:
        if len(table.headers) < 152: # shouldn't need this check but just in case
            # this is a new column
            columnType = synapseclient.table.DTYPE_2_TABLETYPE[table_df[col].dtype.char]
            if columnType == 'STRING':
                maxStrLen = table_df[col].str.len().max()
                if maxStrLen > 1000:
                    newcolumn = syn.store(Column(name=col, columnType='LARGETEXT', defaultValue=''))
                    table.schema.addColumn(newcolumn)
                    #time.sleep(2)
                    #table = syn.store(table)
                    used_columns.append(col)
                else:
                    # change it so the column size is long enough for our needs
                    size = int(round(min(1000, max(100, maxStrLen * 3))))  # Determine the length of the longest string
                    newcolumn = syn.store(Column(name=col, columnType=columnType, maximumSize=size, defaultValue=''))
                    table.schema.addColumn(newcolumn)
                    #time.sleep(2)
                    #table = syn.store(table)
                    used_columns.append(col)
            else:
                #make sure the name is acceptable, no dot . in column names
                newcolumn = syn.store(Column(name=col, columnType=columnType))
                table.schema.addColumn(newcolumn)
                #time.sleep(2)
                #table = syn.store(table)
                used_columns.append(col)

    table = syn.store(table)

    schema = syn.get(table.tableId)
    syn.store(Table(schema, df))

    return used_columns


def add_response_data_to_tables(resp_dict, formID):
    # put the response data into a pandas dataframe for easy manipulation
    metadata_df = get_metadata(resp_dict)
    response_df = pd.DataFrame(data=[resp_dict.get('data')])
    full_df = metadata_df.join(response_df)

    table = None
    table_index = 0
    unused_columns = response_df.columns
    while len(unused_columns) > 0:
        # Loop through the tables, adding data to existing full tables in place
        table_index += 1
        synID = syn.findEntityId(formID + "_" + str(table_index), project)
        try:
            # get the synapse columns for the table current table
            schema = syn.get(synID)
            print("Updating response form table: %s" % schema.name)
            cols = syn.getTableColumns(schema)
            colNames = []
            for column in cols:
                colNames.append(column.name)
            table_columns = len(colNames)
            # use pandas to split the new df with only the columns in table
            # table_df has the columns for this table including metadata
            table_df = dataframe_by_columns_intersection(full_df, colNames)
            unused_columns = list(set(unused_columns) - set(table_df.columns))

            if len(unused_columns) > 0 and table_columns < 152:
                # doing some math here
                # the existing table data takes up the first x columns
                # so the new_table_df should be at most 152 minus the number of existing columns
                lst_idx = 152 - table_columns
                unused_df = dataframe_by_columns_intersection(response_df,
                                                              unused_columns[:lst_idx])
                schema.addColumns(synapseclient.as_table_columns(unused_df))
                schema = syn.store(schema)
                table_df = table_df.join(unused_df)
                unused_columns = list(set(unused_columns) - set(table_df.columns))

            # store the table: it is either full or there are no more unused columns
            syn.store(Table(schema, table_df))

        except TypeError:
            if synID is None:
                # doing some math here
                # the metadata takes up the first x columns
                # so the new_table_df should be at most 152 minus the number of metadata columns
                lst_idx = 152 - len(metadata_df.columns)
                unused_df = dataframe_by_columns_intersection(response_df, unused_columns[:lst_idx])
                new_table_df = metadata_df.join(unused_df)
                used_columns = create_new_table(formID, new_table_df, table_index)
                unused_columns = list(set(unused_columns) - set(used_columns))
                continue
            else:
                raise TypeError

    return

#the last_seq of the changes is not returned until the ietration is completed
def get_last_change_seq(db, paged=False):
    if paged:
        changes = db.changes(descending=False, since=0, limit=50)
        for change in changes:
            #do nothing
            pass
    else:
        changes = db.changes(descending=False, since=0)
    return changes.last_seq

#update Synapse table schema if needed when a new dataframe is saved
def update_data(synId, key, eTag, oldDf, newDf):
    table = syn.get(synId)
    for col in newDf.columns:
        if col not in oldDf.columns:
            # this is a new column
            columnType = synapseclient.table.DTYPE_2_TABLETYPE[newDf[col].dtype.char]
            if columnType == 'STRING':
                maxStrLen = newDf[col].str.len().max()
                if maxStrLen > 1000:
                    newcolumn = syn.store(Column(name=col, columnType='LARGETEXT', defaultValue=''))
                    table.addColumn(newcolumn)
                    time.sleep(2)
                    table = syn.store(table)
                else:
                    # change it so the column size is long enough for our needs
                    size = int(round(min(1000, max(100, maxStrLen * 3))))  # Determine the length of the longest string
                    newcolumn = syn.store(Column(name=col, columnType=columnType, maximumSize=size, defaultValue=''))
                    table.addColumn(newcolumn)
                    time.sleep(2)
                    table = syn.store(table)
            else:
                # make sure the name is acceptable, no dot . in column names
                newcolumn = syn.store(Column(name=col, columnType=columnType))
                table.addColumn(newcolumn)
                time.sleep(2)
                table = syn.store(table)

    # make sure bool datatype doesn't change to string
    cdf = oldDf.reindex(columns=oldDf.columns.union(newDf.columns)).ffill()
    cdf.set_index(key)
    oldDf.set_index(key)
    # make sure bool datatype doesn't change to string, update silently changes data type
    cdf.update(newDf)
    cdf = cdf.astype(newDf.dtypes.to_dict()) #reset the data type

    #concat doesn't work, it creates too many rows
    #testDf = pd.concat([cdf, newDf]).drop_duplicates(oldDf.columns.union(newDf.columns), keep='last').sort_values(key)
    #testDf.drop_duplicates(subset=key, inplace=True)
    #table = syn.store(Table(table, testDf, etag=eTag))

    #cdf.reset_index()
    #cdf.replace(newDf)  #replace doesn't do anything
    #make sure there is no dupliacte rowID in the dataframe
    #cdf.drop_duplicates(subset=key, inplace=True)
    table = syn.store(Table(table, cdf, etag=eTag))

#update Synapse table schema if needed when a new record is saved
def add_data(synId, newDf):
    table = syn.get(synId)
    cols = syn.getTableColumns(table)
    colNames= []
    for column in cols:
        colNames.append(column.name)

    for col in newDf.columns:
        if col not in colNames:
            table = syn.get(synId)
            if len(table.columnIds) < 152:
                # this is a new column
                columnType = synapseclient.table.DTYPE_2_TABLETYPE[newDf[col].dtype.char]
                if columnType == 'STRING':
                    maxStrLen = newDf[col].str.len().max()
                    if maxStrLen > 1000:
                        newcolumn = syn.store(Column(name=col, columnType='LARGETEXT', defaultValue=''))
                        table.addColumn(newcolumn)
                        time.sleep(2)
                        table = syn.store(table)
                    else:
                        # change it so the column size is long enough for our needs
                        size = int(round(min(1000, max(100, maxStrLen * 3))))  # Determine the length of the longest string
                        newcolumn = syn.store(Column(name=col, columnType=columnType, maximumSize=size, defaultValue=''))
                        table.addColumn(newcolumn)
                        time.sleep(2)
                        table = syn.store(table)
                else:
                    #make sure the name is acceptable, no dot . in column names
                    newcolumn = syn.store(Column(name=col, columnType=columnType))
                    table.addColumn(newcolumn)
                    time.sleep(2)
                    table = syn.store(table)

    #make sure no duplictes
    #newDf.drop_duplicates(inplace=True)
    table = syn.store(Table(table, newDf))

#convert a Tangerine case  document to Synapse case record in case table
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
        df.rename(columns={'_id': 'CaseID'},inplace=True)
        synID = syn.findEntityId("case", project)
        case_synID = synID
        if synID is None:  # create the table first
            table = synapseclient.table.build_table("case", synProjectName, df)
            table = syn.store(table)
        else:
            table = syn.get(synID)
            # check to see if the record already exists, if it does, do an update, otherwise do an add
            row = syn.tableQuery("select * from " + synID + " where CaseID='" + caseId + "'", resultsAs="rowset",
                                 limit=1)
            # check to see if row actually has any data
            if row.count == 0:
                #queue to the global dataframe
                case_df_add = case_df_add.append(df, ignore_index = True)
                # we do add
                # if first_case:
                #     add_data(synID, table, df)
                #     first_case = False
                # else:
                #     table = syn.store(Table(table, df))
            else:
                row_df = row.asDataFrame(rowIdAndVersionInIndex=False)
                case_df_update = case_df_update.append(df, ignore_index = True)
                case_df_old = case_df_old.append(row_df, ignore_index = True)
                case_eTag = row.etag
                # we do update
                # row_df = row.asDataFrame(rowIdAndVersionInIndex=False)
                # update_data(table, "CaseID", row, row_df, df)

#convert a Tangerine participant  document to Synapse participant record in participant table
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
        numinf = resp_dict.get('numInf')

        participantData = resp_dict.get('data')
        if 'ParticipantID' not in participantData:
            participantData.update({'ParticipantID': participantId})
        if 'CaseID' not in participantData:
            participantData.update({'CaseID': caseId})
        if 'caseRoleId' not in participantData:
            participantData.update({'caseRoleId': role})
        if 'dbRevision' not in participantData:
            participantData.update({'dbRevision': dbRev})
        # if 'numinf' not in participantData:
        #     participantData.update({'numinf': numinf})

        #check to see if we have any additional data elements that we need to convert and save to Synapse database
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
        synID = syn.findEntityId("participant", project)
        participant_synID = synID
        if synID is None:  # create the table first
            table = synapseclient.table.build_table("participant", synProjectName, df)
            table = syn.store(table)
        else:
            table = syn.get(synID)
            # check to see if the record already exists, if it does, do an update, otherwise do an add
            row = syn.tableQuery("select * from " + synID + " where ParticipantID='" + participantId + "'", resultsAs="rowset", limit=1)
            #check to see if row actually has any data
            if row.count==0:
                #we do add
                participant_df_add = participant_df_add.append(df, ignore_index=True)
                # if first_participant:
                #     add_data(synID, df)
                #     first_participant = False
                # else:
                #     table = syn.store(Table(table, df))
            else:
                #we do update
                row_df = row.asDataFrame(rowIdAndVersionInIndex=False)
                participant_df_update = participant_df_update.append(df, ignore_index=True)
                participant_df_old = participant_df_old.append(row_df, ignore_index=True)
                participant_eTag  = row.etag

                # update_data(synID, "ParticipantID", row, row_df, df)
                #this works but it's a left join, new columns in DF will not be updated
                # row_df.set_index('ParticipantID')
                # df.set_index('ParticipantID')
                # row_df.update(df)
                # for col in df.columns:
                #     if col not in row_df.columns:
                #         #this is a new column
                #         columnType = synapseclient.table.DTYPE_2_TABLETYPE[df[col].dtype.char]
                #         if columnType == 'STRING':
                #             maxStrLen = df[col].str.len().max()
                #             if maxStrLen > 1000:
                #                 newcolumn = syn.store(Column(name=col, columnType='LARGETEXT',defaultValue=''))
                #                 table.addColumn(newcolumn)
                #                 table = syn.store(table)
                #             else:
                #                 # change it so the column size is long enough for our needs
                #                 size = int(round(min(1000, max(100, maxStrLen * 3))))  # Determine the length of the longest string
                #                 newcolumn = syn.store(Column(name=col, columnType=columnType,  maximumSize=size,defaultValue=''))
                #                 table.addColumn(newcolumn)
                #                 table = syn.store(table)
                #         else:
                #             newcolumn = syn.store(Column(name=col, columnType=columnType))
                #             table.addColumn(newcolumn)
                #             table = syn.store(table)
                #
                # cdf = row_df.reindex(columns=row_df.columns.union(df.columns))
                # cdf.set_index('ParticipantID')
                # df.set_index('ParticipantID')
                # cdf.update(df)
                # table = syn.store(Table(table, cdf, etag=row.etag))

#convert a Tangerine case-event  document to Synapse case-event record in case-event table
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

        synID = syn.findEntityId("case-event", project)
        case_event_synID = synID
        if synID is None:  # create the table first
            table = synapseclient.table.build_table("case-event", synProjectName, df)
            table = syn.store(table)
        else:
            table = syn.get(synID)
            # check to see if the record already exists, if it does, do an update, otherwise do an add
            row = syn.tableQuery("select * from " + synID + " where CaseEventID='" + caseEventId + "'", resultsAs="rowset", limit=1)
            #check to see if row actually has any data
            if row.count==0:
                #we do add
                case_event_df_add = case_event_df_add.append(df, ignore_index=True)
                # if first_case_event:
                #     add_data(synID, df)
                #     first_case_event = False
                # else:
                #     table = syn.store(Table(table, df))
            else:
                #we do update
                row_df = row.asDataFrame(rowIdAndVersionInIndex=False)
                case_event_df_update = case_event_df_update.append(df, ignore_index=True)
                case_event_df_old = case_event_df_old.append(row_df, ignore_index=True)
                case_event_eTag = row.etag
                # update_data(synID, "CaseEventID", row, row_df, df)

                # row_df.set_index('CaseEventID')
                # df.set_index('CaseEventID')
                # row_df.update(df)
                # table = syn.store(Table(table, row_df, etag=row.etag))

#convert a Tangerine event form document to Synapse event form record in event_form table
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

        synID = syn.findEntityId("event-form", project)
        event_form_synID = synID
        if synID is None:  # create the table first
            table = synapseclient.table.build_table("event-form", synProjectName, df)
            table = syn.store(table)
        else:
            table = syn.get(synID)
            # check to see if the record already exists, if it does, do an update, otherwise do an add
            row = syn.tableQuery("select * from " + synID + " where EventFormID='" + eventFormId + "'", resultsAs="rowset", limit=1)
            #check to see if row actually has any data
            if row.count==0:
                #we do add
                event_form_df_add = event_form_df_add.append(df, ignore_index=True)
            else:
                #we do update
                row_df = row.asDataFrame(rowIdAndVersionInIndex=False)
                event_form_df_update = event_form_df_update.append(df, ignore_index=True)
                event_form_df_old = event_form_df_old.append(row_df, ignore_index=True)
                event_form_eTag = row.etag
                #update_data(synID, "EventFormID", row, row_df, df)


# Function: Converts a Tangerine response document into a set of tables in Synapse
# All documents of the type "response" are processed here. Each response has a unique string formID
# e.g. 'mch_sociodemographic' and a unique identifier for that response. A table is created for each type of form
# response and the unique identifiers of that type of response are listed in that table. The data for each response is
# spread across tables named with the prefix of the formID and index so that no table has more than 152 columns.
def convert_response(resp_dict):
    global response_tables
    # there are 4 major types: case, participant, case-event, event-form
    if resp_dict.get('type').lower() == "response":
        # get the response id to check if it already exists in the system
        respid = resp_dict.get('_id')

        # get the form id which is at data.formId in the document
        response_data = resp_dict.get('data')
        formID = response_data.get('formId')

        # get the list of known response tables
        synID = syn.findEntityId(formID, project)
        if synID is None:
            # this is the first upload of a form of this response type
            print('First upload of response type with formID: %s' % formID)

            # create the response table of type formID and data of just the response doc id
            response_table_df = pd.DataFrame([{'response_id': respid}])
            table = synapseclient.table.build_table(formID, project, response_table_df)
            syn.store(table)
            synID = syn.findEntityId(formID, project)
        else:
            schema = syn.get(synID)

        # check to see if the record already exists, if it does, do an update, otherwise do an add,
        row = syn.tableQuery("select * from " + synID +" where response_id='" + respid +"'", resultsAs="rowset", limit=1)
        if row.count == 0:
            response_table_df = pd.DataFrame([{'response_id': respid}])
            syn.store(Table(schema, response_table_df))
        else:
            # this is an update to an existing entry - delete it in all tables
            table_index = 1
            synID = syn.findEntityId(formID + "_" + str(table_index), project)
            while synID != None:
                # Loop through the tables, adding data to existing full tables in place
                try:
                    # get the synapse columns for the table current table
                    row = syn.tableQuery("select * from " + synID + " where ID='" + respid + "'",
                                         resultsAs="rowset", limit=1)
                    print('Existing form response is being deleted then updated in response form data table: %s' % formID + "_" + str(table_index))
                    syn.delete(row)
                    table_index += 1
                    synID = syn.findEntityId(formID + "_" + str(table_index), project)
                except TypeError:
                    if synID is None:
                        break
                    else:
                        raise TypeError

        add_response_data_to_tables(resp_dict, formID)


def save_data(last_change_seq):
    print('Saving the data')
    global lastSequence
    global case_df_add
    global case_df_update
    global participant_df_add
    global participant_df_update
    global event_form_df_add
    global event_form_df_update
    global case_event_df_add
    global case_event_df_update

    if len(case_df_add.index) > 0:
        try:
            #save the data to the Synapse database now
            add_data(case_synID, case_df_add)
        except synapseclient.core.exceptions.SynapseHTTPError as e:
            # probably not our fault -- continue on
            print('SynapseHTTPError saving added cases %s' % e)
        case_df_add = case_df_add.iloc[0:0]

    if len(case_df_update.index) > 0:
        try:
            update_data(case_synID, "CaseID", case_eTag, case_df_old, case_df_update)
        except synapseclient.core.exceptions.SynapseHTTPError as e:
            # probably not our fault -- continue on
            print('SynapseHTTPError saving updated cases %s' % e)
        case_df_update = case_df_update.iloc[0:0]

    if len(participant_df_add.index) > 0:
        try:
            add_data(participant_synID, participant_df_add)
        except synapseclient.core.exceptions.SynapseHTTPError as e:
            # probably not our fault -- continue on
            print('SynapseHTTPError saving added participants %s' % e)
        participant_df_add= participant_df_add.iloc[0:0]

    if len(participant_df_update.index) > 0:
        try:
            update_data(participant_synID, "ParticipantID", participant_eTag, participant_df_old, participant_df_update)
        except synapseclient.core.exceptions.SynapseHTTPError as e:
            # probably not our fault -- continue on
            print('SynapseHTTPError saving updated participants %s' % e)
        participant_df_update= participant_df_update.iloc[0:0]

    if len(case_event_df_add.index) > 0:
        try:
            add_data(case_event_synID, case_event_df_add)
        except synapseclient.core.exceptions.SynapseHTTPError as e:
            # probably not our fault -- continue on
            print('SynapseHTTPError saving added case events %s' % e)
        case_event_df_add=case_event_df_add.iloc[0:0]

    if len(case_event_df_update.index) > 0:
        try:
            update_data(case_event_synID, "CaseEventID", case_event_eTag, case_event_df_old, case_event_df_update)
        except synapseclient.core.exceptions.SynapseHTTPError as e:
            # probably not our fault -- continue on
            print('SynapseHTTPError saving updated case events %s' % e)
        case_event_df_update= case_event_df_update.iloc[0:0]

    if len(event_form_df_add.index) > 0:
        try:
            add_data(event_form_synID, event_form_df_add)
        except synapseclient.core.exceptions.SynapseHTTPError as e:
            # probably not our fault -- continue on
            print('SynapseHTTPError saving added event forms %s' % e)
        event_form_df_add = event_form_df_add.iloc[0:0]

    if len(event_form_df_update.index) > 0:
        try:
            update_data(event_form_synID, "EventFormID", event_form_eTag, event_form_df_old, event_form_df_update)
        except synapseclient.core.exceptions.SynapseHTTPError as e:
            # probably not our fault -- continue on
            print('SynapseHTTPError saving updated event forms %s' % e)
        event_form_df_update = event_form_df_update.iloc[0:0]

    lastSequence = last_change_seq
    #write the last sequence number back to the INI file, tlast sequence number won't work if descending is set to true
    config.set("TANGERINE","LastSequence",last_change_seq)
    # Writing the configuration file to

    print ('Last sequence writing back to connector.ini file: ' + lastSequence)

    pathName = os.path.join(os.getcwd(), 'data', 'connector.ini')
    print('Config file: ' + pathName)
    with open(os.path.join(os.getcwd(), 'data', 'connector.ini'), 'w') as configfile:
    #with open("C:\\Projects\\Tangerine\\source\\tangerine-synapse-connector\\connector.ini", 'w') as configfile:
        config.write(configfile)


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
    client = CouchDB(dbUserName, dbPassword, url=dbURL, connect=True, timeout=500)
    session = client.session()
    tangerine_database = client[dbName]
    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S")+': Logged into Tangerine database')

    #login to Synpase
    # syn.login(synUserName, synPassword)
    # project = syn.get(synProjectName)
    # print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S")+': Logged into Synapse')

    start_time = timeit.default_timer()
    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + ': Started converting documents from Tangerine to Synapse')
    #if sequence number is 0, then we are starting with a new database so let's do initial data converaison from Tangerine couchDB to Synapse
    last_change_seq = lastSequence
    if lastSequence == '0':
        #changes = tangerine_database.changes(descending=False, since=0)
        #changes.last_seq is None
        last_change_seq= get_last_change_seq(tangerine_database, paged=True)
        cnt = 0
        for document in tangerine_database:
            cnt = cnt + 1
            resp_dict = json.loads(document.json())
            type = resp_dict.get('type')
            print("Processing document type: " + type + ", Count: " + str(cnt))
            #there are 5 major types: case, participant, case-event, event-form and response
            if (type.lower() == "case"):
                #handle case type
                convert_case(document)
            elif (type.lower() == "participant"):
                #participant is already handled in case, ignore, donothing
                #pass
                convert_participant(document)
            elif (type.lower() == "event-form"):
                #pass
                convert_event_form(document)
            # handle case-event, this is skipped
            elif (type.lower() == "case-event"):
                # handle case-event, this is skipped
                #pass
                convert_case_event(document)
                #convert_document(document)
            elif (type.lower() == "response"):
                # handle case-event, this is skipped
                #pass
                convert_response(document)
                #convert_document(document)
            else:
                print("Unexpected document type")
                #do nothing

        #get the last change sequence as from now on we will only deal with the changes
        last_change_seq= get_last_change_seq(tangerine_database)
    else:
        # Iterate over a "normal" _changes feed
        last_change_seq= get_last_change_seq(tangerine_database)
        changes = tangerine_database.changes(include_docs=True,descending=False,since=lastSequence)
        cnt2 = 0
        for change in changes:
            try:
                cnt2 = cnt2 + 1
                if (cnt2 % 10) == 0:
                    save_data(last_change_seq)
                #change is a dictionary object
                seq = change.get('seq')
                id = change.get('id')
                #check to see if is a delete change,if it is, just skip it
                if change.get('deleted'):
                    #remove the ID from the table, but we don't know which table
                    #delete_record(tangerine_database, id)
                    continue
                cng = change.get('changes')
                #get the change revision
                version = cng[0].get('rev')
                doc = change.get('doc')  #that's a dictionary
                #print(doc)
                type = doc.get('type')
                print("Processing changes, document type: " + type + ", Count: " + str(cnt2))
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
                    print("Unexpected document type")
                last_change_seq = change['seq']
            except synapseclient.core.exceptions.SynapseHTTPError as e:
                # probably not our fault -- save the data
                print('SynapseHTTPError %s' % e)

    save_data(last_change_seq)

    end_time = timeit.default_timer()
    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") +': Finished converting documents from Tangerine to Synapse')
    print('Total Time: ', end_time - start_time)
    #logout and disconnect
    #syn.logout()
    client.disconnect()
    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") +': Disconnected from Tangerine database')


#testing connection to a CouchDB database
#http://localhost:5984/_utils/#/_all_dbs

#read in the configuration file
config = configparser.ConfigParser()
#pathName = os.path.join(os.getcwd(), 'data', 'connector.ini')
#print('Config file: ' + pathName)
#config.read(pathName)

#config.read("C:\\Users\\azhang\\OneDrive - Research Triangle Institute\\MyProjects\\Tangerine\\source\\tangerine-synapse-connector\\connector.ini")
try:
    config.read(os.path.join(os.getcwd(), 'data', 'connector.ini'))
except:
    print("Unexpected error:")
    
    
#get all sections
config.sections()
dbURL= config['TANGERINE']['DatabaseURL']
dbName= config['TANGERINE']['DatabaseName']
dbUserName= config['TANGERINE']['DatabaseUserName']
dbPassword= config['TANGERINE']['DatabasePassword']
lastSequence = config['TANGERINE']['LastSequence']
interval =config['TANGERINE']['run_interval']

print('Database URL:' +dbURL +' Database Name: ' + dbName + ' Username is: ' +dbUserName )
print ('Last sequence: ' + lastSequence)
# Use CouchDB to create a CouchDB client, coudant API
#need to read username, password and connection URL from external parameters
#client = CouchDB(dbUserName, dbPassword, url=dbURL, connect=True)

#session = client.session()
#print('Username: {0}'.format(session['userCtx']['name']))
#print('Databases: {0}'.format(client.all_dbs()))

# Open an existing database, need to read the database name from config file
#tangerine_database = client['arc-reports-test']
#tangerine_database = client[dbName]

#connection to synapse
syn = synapseclient.Synapse()
synProjectName= config['SYNAPSE']['ProjectName']
synUserName= config['SYNAPSE']['UserName']
apiKey= config['SYNAPSE']['apiKey']

print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S")+': Connecting to Synapse')

syn.login(email=synUserName, apiKey=apiKey)
project = syn.get(synProjectName)

print('Synapse project Name:' +synProjectName +' Synapse userName: ' + synUserName )
print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S")+': Logged into Synapse')

#while True:
#    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " Starting job ... ")
#    main_job()
#    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " Job finished, sleeping for " + str(60*int(interval)) + " seconds")
#    time.sleep(60*int(interval))
#    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " Running again ... " )

#schedule.every(int(interval)).minutes.do(main_job)

# while True:
#     schedule.run_pending()
#     time.sleep(10)

# #run the scheduler
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

