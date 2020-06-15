FROM node:14-slim

USER root
WORKDIR /home/node/app/backend
WORKDIR /home/node/app/frontend/dist/frontend

ADD --chown=node:node backend/package.json /home/node/app/backend/package.json 
ADD --chown=node:node backend/yarn.lock /home/node/app/backend/yarn.lock

RUN chown node:node -R /home/node

USER node

RUN yarn

ADD --chown=node:node frontend/dist/frontend /home/node/app/frontend/dist/frontend
ADD --chown=node:node backend /home/node/app/backend

WORKDIR /home/node/app/backend

EXPOSE 8080
CMD ["yarn", "prod"]

