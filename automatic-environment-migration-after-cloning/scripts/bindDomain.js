var sAppid = getParam("TARGET_APPID"),
    sSession = getParam("session"),
    oResp;

return jelastic.env.binder.BindExtDomain(sAppid, sSession, "testDomain.com");
