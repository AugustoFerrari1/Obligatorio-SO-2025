FROM node:18

RUN mkdir -p /home/backup

RUN touch /var/log/cron.log && chmod 0666 /var/log/cron.log

WORKDIR /app

COPY package.json .

COPY app.js .

RUN npm install

RUN apt-get update && apt-get install -y cron dos2unix

COPY backup-cron /etc/cron.d/backup-cron

RUN dos2unix /etc/cron.d/backup-cron

RUN chmod 0644 /etc/cron.d/backup-cron

RUN crontab /etc/cron.d/backup-cron

CMD ["bash", "-c", "cron && tail -f /var/log/cron.log"]