FROM ubuntu:latest
RUN apt-get update && apt-get upgrade -y && apt-get install -y tzdata wget
ENV TZ Asia/Tokyo
WORKDIR /opt
RUN apt-get install -y openjdk-17-jre && \
    wget https://piston-data.mojang.com/v1/objects/f69c284232d7c7580bd89a5a4931c3581eae1378/server.jar
WORKDIR /root
RUN echo eula=true > eula.txt && echo "mv /mnt/var/* /root" > run.sh && \
    echo "java -Xmx1024M -Xms1024M -jar /opt/server.jar" >> run.sh && \
    echo "mv /root/* /mnt/var" >> run.sh && chmod 777 run.sh && mkdir /mnt/var
CMD ["sh", "run.sh"]