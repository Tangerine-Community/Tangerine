# Start with docker-tangerine-support, which provides the core Tangerine apps.
FROM tangerine/docker-tangerine-support
ENV TS_URL foo.tangerinecentral.org
ENV T_NEW_ADMIN admin
ENV T_NEW_ADMIN_PASS password
ENV T_USER1 user1
ENV T_USER1_PASSWORD password

ADD ./ /root/Tangerine-server
RUN /root/Tangerine-server/server-init.sh

ENTRYPOINT /root/Tangerine-server/entrypoint.sh
