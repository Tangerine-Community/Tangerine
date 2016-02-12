FROM ubuntu:14.04
RUN apt-get update && apt-get install git -y && git clone https://github.com/Tangerine-Community/robbert.git && cd robbert && git checkout dev && ./server-init.sh
ENTRYPOINT ['./robbert/start.sh']
