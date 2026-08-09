FROM node:20-bullseye

ENV TZ=Asia/Jakarta

# 1. Install LibreOffice & fontconfig
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    fontconfig \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# 2. Buat direktori font kustom & copy file font (.ttf)
# (Direkomendasikan gabung perintah RUN font biar layer Docker lebih efisien)
RUN mkdir -p /usr/share/fonts/truetype/customfont
COPY assets/fonts/* /usr/share/fonts/truetype/customfont/
RUN chmod -R 644 /usr/share/fonts/truetype/customfont/* \
    && fc-cache -f /usr/share/fonts/truetype/customfont

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]