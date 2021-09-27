import configparser
import synapseclient
import json
import os

config = configparser.ConfigParser()
config.read(os.path.join(os.getcwd(), 'connector.ini'))
config.sections()

def update_state(last_change_seq):
    config.set("TANGERINE","lastsequence",last_change_seq)
    with open(os.path.join(os.getcwd(), 'connector.ini'), 'w') as configfile:
        config.write(configfile)

syn = synapseclient.Synapse()
synProjectName= config['SYNAPSE']['ProjectName']
synUserName= config['SYNAPSE']['UserName']
apiKey= config['SYNAPSE']['apiKey']
syn.login(email=synUserName, apiKey=apiKey)
project = syn.get(synProjectName)

children = syn.getChildren(synProjectName)
for entity in children :
    syn.delete(entity['id'])
update_state("0")
