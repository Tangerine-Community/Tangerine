FROM ubuntu:14.04
ENV T_HOSTNAME local.tangerinecentral.org
ENV T_ADMIN admin
ENV T_PASS password
ENV T_COUCH_HOST localhost
ENV T_COUCH_PORT 5984
ENV T_ROBBERT_PORT 4444
ENV T_TREE_PORT 4445
ENV T_BROCKMAN_PORT 4446
ENV T_DECOMPRESSOR_PORT 4447

ADD ./ /root/Tangerine-server
RUN cd /root/Tangerine-server && cp tangerine-env-vars.sh.defaults tangerine-env-vars.sh && ./server-init.sh
EXPOSE 80
ENTRYPOINT /root/Tangerine-server/entrypoint.sh 
