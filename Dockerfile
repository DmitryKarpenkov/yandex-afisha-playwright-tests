FROM mcr.microsoft.com/playwright:v1.58.0-jammy

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN apt-get update && \
    apt-get install -y default-jre && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p allure-results allure-report test-results playwright-report

CMD ["npm", "test"]