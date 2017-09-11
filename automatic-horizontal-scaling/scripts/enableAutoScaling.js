var APPID = getParam("TARGET_APPID"),
    QUOTA_MAX_NODES = "environment.maxsamenodescount",
    VALUE_TYPE = "PERCENTAGES",
    RESOURCE_TYPE = "CPU",
    NODE_GROUP = "cp",
    oTriggerActions,
    nMaxNodesCount,
    oRespTurnOn,
    aQuotas,
    oData,
    oResp;
    
    oTriggerActions = {
        add: "ADD_NODE",
        remove: "REMOVE_NODE"
    };

oResp = jelastic.billing.account.GetQuotas(appid, session);

if (oResp.result != 0) {
    return oResp;
}

aQuotas = oResp.array;

for (var i = 0, n = aQuotas.length; i < n; i += 1) {

    if (aQuotas[i].quota && aQuotas[i].quota.name == QUOTA_MAX_NODES) {
        nMaxNodesCount = aQuotas[i].value;
        break;
    }
}

oResp = jelastic.env.trigger.GetTriggers(APPID, session, oTriggerActions.add);

if (oResp.array.length > 0) {
    oResp = jelastic.env.trigger.DeleteTrigger(APPID, session, oResp.array[0].id);
}

oData = {
    isEnabled: true,
    name: "hs-add",
    nodeGroup: NODE_GROUP,
    period: 5,
    condition: {
        type: "GREATER",
        value: 80,
        resourceType: RESOURCE_TYPE,
        valueType: VALUE_TYPE
    },
    actions: [
        {
            type: oTriggerActions.add,
            customData: {
                limit: nMaxNodesCount || 3,
                count: 1,
                notify: false
            }
        }
    ]
};

oRespTurnOn = jelastic.env.trigger.AddTrigger(APPID, session, oData);

if (oRespTurnOn.result != 0) {
    return oRespTurnOn;
}


oResp = jelastic.env.trigger.GetTriggers(APPID, session, oTriggerActions.remove);

if (oResp.array.length > 0) {
    oResp = jelastic.env.trigger.DeleteTrigger(APPID, session, oResp.array[0].id);
}

oData = {
    isEnabled: true,
    name: "hs-remove",
    nodeGroup: NODE_GROUP,
    period: 15,
    condition: {
        type: "LESS",
        value: 5,
        resourceType: RESOURCE_TYPE,
        valueType: VALUE_TYPE
    },
    actions: [
        {
            type: oTriggerActions.remove,
            customData: {
                limit: 2,
                count: 1,
                notify: false
            }
        }
    ]
};

oRespTurnOff = jelastic.env.trigger.AddTrigger(APPID, session, oData);

return oRespTurnOff;
