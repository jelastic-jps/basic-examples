var sAppid = getParam("TARGET_APPID"),
    bBindExtDomainEnabled = false,
    aQuotas,
    oResp;

oResp = jelastic.billing.account.GetQuotas(appid, session);

if (oResp.result != 0) {
    return oResp;
}

aQuotas = oResp.array;

for (var i = 0, n = aQuotas.length; i < n; i += 1) {

    if (aQuotas[i].quota && aQuotas[i].quota.name == 'environment.extdomain.enabled') {
        bBindExtDomainEnabled = aQuotas[i].value;
        break;
    }
}

if (bBindExtDomainEnabled) {
    return jelastic.env.binder.BindExtDomain(sAppid, session, "testDomain.com");
}

return {
    result: 0
};
