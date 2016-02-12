FROM ubuntu:14.04
ADD . /root/robbert
RUN /root/robbert/server-init.sh
ENTRYPOINT ['/root/robbert/start.sh']
