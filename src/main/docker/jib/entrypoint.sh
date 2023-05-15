#!/bin/sh

echo "The application will start in ${JHIPSTER_SLEEP}s..." && sleep ${JHIPSTER_SLEEP}
exec java ${JAVA_OPTS} -noverify -XX:MaxRAMPercentage=80 -XX:MinRAMPercentage=50 -XX:InitialRAMPercentagle=5 -XX:+AlwaysPreTouch -Djava.security.egd=file:/dev/./urandom -cp /app/resources/:/app/classes/:/app/libs/* "org.assimbly.gateway.GatewayApp"  "$@"  --application.gateway.base-directory=/data  --server.port=8088
