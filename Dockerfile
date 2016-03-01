# Start with docker-tangerine-support, which provides the core Tangerine apps.
# FROM ubuntu:14.04
FROM tangerine/docker-tangerine-support

ENTRYPOINT /root/Tangerine-server/entrypoint.sh
#ENTRYPOINT /root/Tangerine-server/entrypoint-simple.sh
