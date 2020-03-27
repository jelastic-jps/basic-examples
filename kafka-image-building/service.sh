#This script creates all necessary service files required to run Kafka Broker

#Let’s create a dedicated directory to work at
mkdir kafka
cd kafka

#Download prepared Dockerfile to build certified Kafka Broker image
wget -q https://raw.githubusercontent.com/vlobzakov/basic-examples/master/kafka-image-building/Dockerfile -O Dockerfile
echo
echo "Docker file downloaded"

#Create a directory tree where the system service files will be located. These files are added to the image due to the ADD src/. / line in Dockerfile.
mkdir -p src/etc/sudoers.d src/etc/systemd/system  src/etc/jelastic src/var/lib/jelastic/overrides
echo
echo "Directory tree created"

#Define start/stop service commands that are allowed to be executed as user kafka in src/etc/sudoers.d/kafka file.
cat << EOF > src/etc/sudoers.d/kafka
Cmnd_Alias KAFKA_SERVICE = /sbin/service kafka stop, /sbin/service kafka start, /sbin/service kafka restart
%ssh-access ALL = NOPASSWD: KAFKA_SERVICE
EOF
echo
echo "Necessary rights granted for user kafka"

#The image uses systemd to initialize multiple daemon services. Kafka distribution has ZooKeeper as an integrated component, and the two services are run in a single container. As a result, two appropriate systemd service files should be created (kafka.service and zookeeper.service).
#kafka.service
cat << EOF > src/etc/systemd/system/kafka.service
[Unit]
Requires=zookeeper.service
After=zookeeper.service

[Service]
Type=simple
User=kafka
ExecStart=/bin/sh -c '/opt/kafka/bin/kafka-server-start.sh /opt/kafka/config/server.properties > /opt/kafka/logs/kafka_stdout.log 2>/opt/kafka/logs/kafka_stderr.log'
ExecStop=/opt/kafka/bin/kafka-server-stop.sh
Restart=on-abnormal

[Install]
WantedBy=multi-user.target
EOF
echo
echo "kafka.service file created"

#Create zookepeer.service
cat << EOF > src/etc/systemd/system/zookeeper.service
[Unit]
Requires=network.target remote-fs.target
After=network.target remote-fs.target
PartOf=kafka.service

[Service]
Type=simple
User=kafka
ExecStart=/opt/kafka/bin/zookeeper-server-start.sh /opt/kafka/config/zookeeper.properties
ExecStop=/opt/kafka/bin/zookeeper-server-stop.sh
Restart=on-abnormal

[Install]
WantedBy=multi-user.target
EOF
echo
echo "zookeeper.service file created"

#Create the src/etc/jelastic/favourites.conf file that configures shortcuts to the most common files and directories at the left pane of Jelastic Configuration File Manager.
cat << EOF > src/etc/jelastic/favourites.conf
# This file is considered only during container creation. To modify the list of items at Favorites panel,
# please make the required changes within image initial settings and rebuild it.

[directories]
/home/jelastic
/opt/kafka/config
/opt/kafka/zookeeper
/opt/kafka/kafka-logs
/var/spool/cron
[files]
/home/jelastic/conf/variables.conf
EOF
echo
echo "favourites.conf file created"

#The redeploy.conf file lists files to keep during the container lifecycle.
cat << EOF > src/etc/jelastic/redeploy.conf
# This file stores links to custom configuration files or folders that will be kept during container redeploy.

/etc/jelastic/redeploy.conf
/opt/kafka/config
/opt/kafka/logs
/var/spool/cron/kafka
/usr/lib/locale
/etc/locale.conf
EOF
echo
echo "redeploy.conf file created"

#It is used by JEM to determine the template-specific logic (service initialization and restart in the case of Kafka).
cat << EOF > src/var/lib/jelastic/overrides/envinfo.lib
case ${COMPUTE_TYPE} in
kafka)
        STACK_PATH='/opt/kafka';
        DATA_OWNER='kafka:kafka';
        SERVICE='kafka';
;;
esac
EOF
echo
echo "envinfo.lib file created"
