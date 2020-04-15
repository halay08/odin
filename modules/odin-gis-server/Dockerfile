FROM ubuntu:20.04

ARG DEBIAN_FRONTEND=noninteractive

USER root
RUN  apt-get update \
  && apt-get install -y wget \
  && apt-get install -y gnupg \
  && apt-get install -y software-properties-common
RUN wget -qO - https://qgis.org/downloads/qgis-2020.gpg.key | apt-key add -
RUN add-apt-repository "deb https://qgis.org/ubuntu/ `lsb_release -c -s` main"
RUN apt-get install -y apache2 libapache2-mod-fcgid qgis-server curl net-tools
RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
RUN apt-get -y install nodejs
RUN mkdir -p /var/lock/apache2
RUN mkdir -p /var/run/apache2
RUN mkdir -p /home/qgis
RUN mkdir -p /home/qgis/projects

RUN mkdir /var/log/qgis/
RUN chown www-data:www-data /var/log/qgis

RUN mkdir /home/qgis/qgisserverdb/
RUN chown www-data:www-data /home/qgis/qgisserverdb

ENV QGIS_SERVER_PARALLEL_RENDERING true

ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_PID_FILE /var/run/apache2.pid
ENV APACHE_RUN_DIR /var/run/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_LOG_DIR /var/log/apache2
ENV LANG C

COPY ./project/project.qgs /home/qgis/projects/project.qgs

RUN rm -r /etc/apache2/sites-available/*

COPY ./qgis.demo.conf /etc/apache2/sites-available/qgis.conf

COPY ./.htaccess /var/www/html/

RUN a2enmod fcgid
RUN a2enmod headers
RUN a2enmod rewrite
RUN a2ensite qgis
RUN a2dissite 000-default.conf

EXPOSE 80

RUN service apache2 restart

CMD ["/usr/sbin/apache2","-D","FOREGROUND"]
