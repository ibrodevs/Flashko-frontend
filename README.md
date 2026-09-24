# Flashko — Frontend

Веб-приложение для изучения карточек и прохождения викторин Flashko на Next.js (App Router) + TypeScript + Tailwind CSS.

## Стек технологий
- **Next.js:** 16 (App Router)
- **React:** 19
- **Стилизация:** Tailwind CSS
- **Шрифт:** Golos Text
- **Иконки:** Lucide React
- **Авторизация:** JWT (Access Token в памяти, Refresh Token 7 дней с автоматическим обновлением)

## Локальный запуск

1. Установить зависимости:
```bash
npm install
```

2. Настроить переменные окружения:
Создайте файл `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Запустить сервер разработки:
```bash
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000) в браузере.

## Сборка и проверка

```bash
npm run lint
npm run build
```

## Деплой на Vercel

1. Импортируйте репозиторий `Flashko-frontend` в Vercel: [vercel.com/new](https://vercel.com/new).
2. В разделе **Environment Variables** добавьте:
   - `NEXT_PUBLIC_API_URL`: URL вашего бэкенда (например, `https://<your-username>.pythonanywhere.com`).
3. Нажмите **Deploy**.
