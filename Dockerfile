FROM node:14-alpine

USER node

WORKDIR /home/node/app/frontend/dist/frontend
WORKDIR /home/node/app/backend

USER root
RUN chown -R node:node /home/node
USER node

ADD --chown=node:node backend/package.json /home/node/app/backend/package.json 
ADD --chown=node:node backend/yarn.lock /home/node/app/backend/yarn.lock

RUN yarn install --production
# RUN npm install

ADD --chown=node:node frontend/dist/frontend /home/node/app/frontend/dist/frontend
ADD --chown=node:node backend /home/node/app/backend

WORKDIR /home/node/app/backend

EXPOSE 8080
CMD ["yarn", "prod"]

