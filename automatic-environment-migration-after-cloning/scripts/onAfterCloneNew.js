/**
 * JS script for executing actions with the newly cloned environment.
 * The script is subscribed on the onAfterClone event and will be executed after old environment cloning.
 */
var APPID = getParam("TARGET_APPID"),
    CLONED_ENV_APPID = "${event.response.env.appid}", // placeholder for the cloned environment AppID

    APP_CONFIG_FILE_PATH = "/opt/tomcat/webapps/alfresco/WEB-INF/classes/alfresco-global.properties", // path to Alfresco config, where the database connection string should be replaced
    APP_INDEX_FILE_PATH = "/opt/tomcat/webapps/alfresco/index.jsp", // path to the Alfresco index.jsp file for the new environment URL substitution
    SOURCE_ENV_URL = "${env.url}", // placeholder for the old environment URL; will be substituted during the script execution

    NODE_TYPE_CP = "tomcat7", // keyword of the compute node's software stack.
    NODE_TYPE_DB = "mysql5", // keyword of the DB node's software stack

    HN_GROUP_PROFIT_BRICKS = "pbricks-de"; // second hardware node group's identifier

/**
 * Adjust application settings according to a new database connection string
 * @param {Object} oClonedEnvInfo - meta information of the cloned environment
 * @returns {Response}
 */
function configureAppSettings(oClonedEnvInfo) {
    var oFileService,
        oResp,
        sDbAddress;
        
    // fetch internal IP address of a new database node
    oClonedEnvInfo.nodes.some(function (oNode) {
        
        if (oNode.nodeType == NODE_TYPE_DB) {
            sDbAddress =  oNode.address;
        }
    });

    // adjust old database connection string with parameters of the cloned one
    oResp = jelastic.env.file.ReplaceInBody(CLONED_ENV_APPID, session, APP_CONFIG_FILE_PATH, "db.url=jdbc:mysql://.*", "db.url=jdbc:mysql://" + sDbAddress + "/alfresco?useUnicode=yes\\&characterEncoding=UTF-8", "", NODE_TYPE_CP);

    // replace environment URL with the cloned one
return jelastic.env.file.ReplaceInBody(CLONED_ENV_APPID, session, APP_INDEX_FILE_PATH, SOURCE_ENV_URL, oClonedEnvInfo.url, "", NODE_TYPE_CP);
}

/**
 * Method for migrating new environment to another hardware node group
 * @param {object} oEnvService - new environment service
 * @param {object} oClonedEnvInfo - meta information about the cloned environment
 * @returns {Response}
 */
function migrateEnv(oClonedEnvInfo) {
    // migrate environment API to another hardware node group
    return jelastic.env.control.Migrate(CLONED_ENV_APPID, session, HN_GROUP_PROFIT_BRICKS, true);
}

/**
 * Main method for executing actions with cloned environment
 * @returns {Response}
 */
function processEnvironment() {
    var oClonedEnvInfo,
        oEnvService,
        oResp;

    // Get meta information of the new environment.
    // Meta information includes all the data about environment, comprised nodes and their properties
     oClonedEnvInfo = jelastic.env.control.GetEnvInfo(CLONED_ENV_APPID, session);

    if (oClonedEnvInfo.result !== 0) {
        return oClonedEnvInfo;
    }


    // apply new configurations according to the cloned environment properties
    oResp = configureAppSettings(oClonedEnvInfo);

    if (oResp.result !== 0) {
        return oResp;
    }

    // migrate cloned environment to a new hardware node group, located in another region
/*    oResp = migrateEnv(oClonedEnvInfo);

    if (oResp.result !== 0) {
        return oResp;
    }
*/
    // Get meta information of the new environment after migrating into new region.
    oClonedEnvInfo = jelastic.env.control.GetEnvInfo(CLONED_ENV_APPID, session);

    if (oClonedEnvInfo.result !== 0) {
        return oClonedEnvInfo;
    }

    // apply new configurations according to the migrated environment properties
    oResp =  configureAppSettings(oClonedEnvInfo);
     
    return jelastic.env.binder.SwapExtDomains(APPID, session, CLONED_ENV_APPID);
}

return processEnvironment();
