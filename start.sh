git pull
pnpm i --frozen-lockfile

cd client
pnpm i --frozen-lockfile
pnpm build

cd ..
pnpm start