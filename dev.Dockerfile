FROM node:20

WORKDIR /app

EXPOSE 3000

VOLUME [ "/app" ]
VOLUME [ "/app/db" ]

RUN mkdir /app/db

ENTRYPOINT [ "npm", "run", "container-run:dev" ]
