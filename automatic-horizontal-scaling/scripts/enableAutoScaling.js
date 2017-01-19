var APPID = getParam("TARGET_APPID"),
    oRespTurnOn,
    oData;

oData = {
    "isEnabled": true,
    "name": "hs-add-nginx",
    "nodeGroup": "cp",
    "period": 5,
    "condition": {
        "type": "GREATER",
        "value": 80,
        "resourceType": "CPU",
        "valueType": "PERCENTAGES"
    },
    "actions": [
        {
            "type": "ADD_NODE",
            "customData": {
                "limit": 3,
                "count": 1,
                "notify": false
            }
        }
    ]
};

oRespTurnOn = jelastic.env.trigger.AddTrigger(APPID, session, oData);

if (oRespTurnOn.result != 0) {
    return oRespTurnOn;
}

oData = {
    "isEnabled": true,
    "name": "hs-remove-nginx",
    "nodeGroup": "cp",
    "period": 15,
    "condition": {
        "type": "LESS",
        "value": 5,
        "resourceType": "CPU",
        "valueType": "PERCENTAGES"
    },
    "actions": [
        {
            "type": "REMOVE_NODE",
            "customData": {
                "limit": 2,
                "count": 1,
                "notify": false
            }
        }
    ]
};

oRespTurnOff = jelastic.env.trigger.AddTrigger(APPID, session, oData);

return oRespTurnOff;