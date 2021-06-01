import configparser
import synapseclient
import json
import os

config = configparser.ConfigParser()
config.read(os.path.join(os.getcwd(), 'connector.ini'))
config.sections()

syn = synapseclient.Synapse()
synProjectName= config['SYNAPSE']['ProjectName']
synUserName= config['SYNAPSE']['UserName']
apiKey= config['SYNAPSE']['apiKey']
syn.login(email=synUserName, apiKey=apiKey)
project = syn.get(synProjectName)

children = syn.getChildren(synProjectName)
for entity in children :
    syn.delete(entity['id'])
