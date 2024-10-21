FROM public.ecr.aws/lambda/nodejs:20

WORKDIR /var/task

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

RUN pnpm run build

CMD ["dist/index.handler"]
