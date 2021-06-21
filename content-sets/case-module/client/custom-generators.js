const yes_no = function() {
    const possibilities = [
        [
            {
                "label": "yes",
                "name": "1",
                "value": ""
            },
            {
                "label": "no",
                "name": "0",
                "value": "on"
            }
        ],
        [
            {
                "label": "yes",
                "name": "1",
                "value": "on"
            },
            {
                "label": "no",
                "name": "0",
                "value": ""
            }
        ]
    ]
    return possibilities[Math.floor(Math.random() * possibilities.length)]
}

const substitutions = [
    {
        "type": "caseDoc",
        "substitutions": {
            "first_name": {
                "functionName": "firstname",
                "runOnce":"perCase"
            },
            "last_name": {
                "functionName": "surname",
                "runOnce":"perCase"
            },
            "participant_id": {
                "functionName": "participant_id",
                "runOnce":"perCase"
            },
            "consent": {
                "functionName": "yes_no",
                "runOnce": false
            }
        }
    },
    {
        "type": "demoDoc",
        "formId": "registration-role-1",
        "substitutions": {
            "first_name": {
                "functionName": "firstname",
                "runOnce":"perCase"
            },
            "last_name": {
                "functionName": "surname",
                "runOnce":"perCase"
            },
            "participant_id": {
                "functionName": "participant_id",
                "runOnce":"perCase"
            },
            "consent": {
                "functionName": "yes_no",
                "runOnce": false
            }
        }
    }
]
    


exports.customGenerators = {yes_no}
exports.customSubstitutions = substitutions
