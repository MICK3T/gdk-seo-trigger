FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY trigger.js ./
# Aucune dépendance externe (fetch natif Node 22) → pas de npm install.
CMD ["node", "trigger.js"]
