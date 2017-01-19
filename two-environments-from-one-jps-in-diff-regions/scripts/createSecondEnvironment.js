var sAppid = getParam("TARGET_APPID"),
    sSession = hivext.local.getParam("session"),
    sRegion = "windows1",
    sEnvGeneratedName = generateEnvName(),
    oNodes = [{
        "nodeType": "nginxphp",
        "flexibleCloudlets": 10,
        "engine": "php5.4"
    }],
    oEnv = {
        "region": sRegion,
        "engine": "php5.4",
        "shortdomain": sEnvGeneratedName
    },
    sActionkey = "createenv;" + sEnvGeneratedName;

function generateEnvName(sPrefix) {
    sPrefix = sPrefix || "env-";

    return sPrefix + parseInt(Math.random() * 100000, 10);
}

return jelastic.env.control.CreateEnvironment(sAppid, sSession, sActionkey, oEnv, oNodes);