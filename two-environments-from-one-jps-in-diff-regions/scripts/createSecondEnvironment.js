var sAppid = getParam("TARGET_APPID"),
    sSession = getParam("session"),
    sRegion = "default_hn2_group",
    sEnvGeneratedName = generateEnvName(),
    oNodes = [{
        "nodeType": "nginxphp",
        "flexibleCloudlets": 10
    }],
    oEnv = {
        "region": sRegion,
        "shortdomain": sEnvGeneratedName
    },
    sActionkey = "createenv;" + sEnvGeneratedName;

function generateEnvName(sPrefix) {
    sPrefix = sPrefix || "env-";

    return sPrefix + parseInt(Math.random() * 100000, 10);
}

return jelastic.env.control.CreateEnvironment(sAppid, sSession, sActionkey, oEnv, oNodes);
