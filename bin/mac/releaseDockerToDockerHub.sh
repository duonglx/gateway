#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

if [ -z "$1" ]; then
    clear & ./../../gradlew clean bootJar jib -Djib.to.credHelper=osxkeychain --settings-file ./../../settings.gradle -Papi-docs
else
    if [ -z "$2" ]; then
        clear & ./../../gradlew clean bootJar jib -Djib.to.credHelper=osxkeychain -Djib.to.image=assimbly/gateway-$1 --settings-file ./../../settings.gradle  -Papi-docs -P$1
    else
        if [ -z "$3" ]; then
            clear & ./../../gradlew clean bootJar jib -Djib.to.credHelper=osxkeychain -Djib.to.image=assimbly/gateway-$1 --settings-file ./../../settings.gradle  -Papi-docs -P$1 -P$2
        else
            if [ -z "$4" ]; then
                clear & ./../../gradlew clean bootJar jib -Djib.to.credHelper=osxkeychain -Djib.to.image=assimbly/gateway-$1 --settings-file ./../../settings.gradle  -Papi-docs -P$1 -P$2
            else
                clear & ./../../gradlew clean bootJar jib -Djib.to.credHelper=osxkeychain -Djib.to.image=assimbly/gateway-$1:$4 --settings-file ./../../settings.gradle  -Papi-docs -P$1 -P$2 -P$3
            fi
        fi
    fi
fi