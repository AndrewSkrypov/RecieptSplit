# Build Docker
docker build -t split-bill-app .

# Launch
docker run -p 4000:4000 split-bill-app

# Or launching an image (myapp.tr )
docker load < myapp.tar
docker run -p 4000:4000 myapp

# Import
docker load -i project_all.tar
docker-compose up



# Account Separation — A web application for friendly payment

Good afternoon! This is a modern application that allows users to conveniently and intuitively divide the bill at the table — in a cafe, restaurant or at a party. 

---

## The stack of technologies used

### Frontend:

- **React**
  - A popular library for creating dynamic user interfaces.
  - Support for a component-based approach, reuse, and fast rendering via the virtual DOM.

- **TypeScript**
- On top of JavaScript, adds strong typing, increasing code reliability and auto-completion in the editor.

- **Tailwind CSS**
is a utilitarian CSS framework that allows you to quickly and flexibly style the interface without writing custom CSS.
  - Great for the style of our app thanks to the color tokens and neat appearance.

- **React Router**
  - Used for page transitions (`/login`, `/payment', `/register`, `/random`, etc.).

- **Zustand**
is a lightweight and fast alternative to Redux for global state management.
  - Easy to use, easily expandable, and has native React support.

- **Tesseract.js**
- OCR (text recognition) from receipt images, which allows users to upload photos and automatically receive a list of dishes.

- **socket.io-client**
- Provides real-time operation: selecting dishes, updating the basket, and synchronizing participants.

- **Lucide-react**
  - Beautiful set of SVG icons, minimalistic and adaptive.

- **React Swipeable**
- Adds swipes by dish (to split portions between users).

---

### Backend:

- **Node.js + Express**
is a backend server that processes connections, tables, users, dishes, data sharing and synchronization.

- **Socket.IO **
- The server part for WebSockets — provides two-way communication between the client and the server.
  - It is used for real-time work with tables, dishes and users.

---

### Auth API

-  **Go + Gin**
  - Easy and fast authorization and registration server.

- **GORM**
is an ORM for working with PostgreSQL.

- **PostgreSQL**
is a database for storing users and sessions.

- **JWT**
- Token authentication.

### The server is written in Go and runs as a separate container (go_server).

---

### DevOps:

- **Docker + Docker Compose**
- Build, isolate, and run all project components.

- **docker-compose up --build**
 - localhost:4000 — client + Node backend + WebSocket

 - localhost:8080 — Go backend (authorization)

 - localhost:5432 — PostgreSQL





### Data storage and structure

- **Zustand**
- Local status management (selected dishes, current user, tips, recognized dishes, etc.)
- Ease of deployment to create a small project

- **In-Memory State (on the server)**
- `tableUsers` — list of users at the table
- `tableDishes` — all selected and divided dishes

- **PostgreSQL (via Go API)**
- Users, Login, JWT

---

### Additional technologies and utilities:

- **UUID (crypto.randomUUID)**
- Generation of unique user IDs and dishes

---

### Why these particular technologies:

**React + TypeScript** - Performance, scalability, ease of development 
**Zustand** - Ease and speed of learning. It is sufficient to start the project. 
**Tailwind CSS** - Speed of styling and responsive design, minimalism 
**Socket.IO ** - Instant synchronization between participants at the table 
**Tesseract.js** - Automatic recognition of dishes from the receipt without manual input 
**React Swipeable** - Convenient interactions via swipes for UX 
**Go** — speed, conciseness, stability in production
**PostgreSQL** %

 - Reliability and stability: PostgreSQL is used in production in many large projects, including fintech and government agencies.

 - Powerful features: transactions, indexes, table relationships, validation, and extensions (e.g. pg_trgm, PostGIS).

 - GORM compatibility: fully supported by the ORM library in Go, easy to connect and scale.

 - Open source and active community: PostgreSQL is developing as an open source with a huge amount of documentation and a support community.

---

### In the plans:
- Integration of payment systems SBP, QR...
- Storing the history of orders and users in the database




# Сборка Докера
docker build -t split-bill-app .

# Запуск
docker run -p 4000:4000 split-bill-app

# Или запуск image (myapp.tr)
docker load < myapp.tar
docker run -p 4000:4000 myapp

# Импорт
docker load -i project_all.tar
docker-compose up



# Разделение счёта — Web-приложение для дружной оплаты

Добрый день! Это современное приложение, позволяющее пользователям удобно и интуитивно понятно делить счёт за столом — в кафе, ресторане или на вечеринке. 

---

## Стек используемых технологий

### Frontend:

- **React**
  - Популярная библиотека для создания динамических пользовательских интерфейсов.
  - Поддержка компонентного подхода, повторного использования и быстрой отрисовки через виртуальный DOM.

- **TypeScript**
  - Поверх JavaScript, добавляет строгую типизацию, повышая надёжность кода и автодополнение в редакторе.

- **Tailwind CSS**
  - Утилитарный CSS-фреймворк, позволяющий быстро и гибко стилизовать интерфейс без написания кастомного CSS.
  - Отлично подходит для стилистики нашего приложения благодаря цветовым токенам и аккуратному внешнему виду.

- **React Router**
  - Используется для переходов между страницами (`/login`, `/payment`, `/register`, `/random`, и т.д.).

- **Zustand**
  - Лёгкая и быстрая альтернатива Redux для глобального управления состоянием.
  - Прост в использовании, легко расширяется и имеет нативную поддержку React.

- **Tesseract.js**
  - OCR (распознавание текста) из изображений чеков, что позволяет пользователям загружать фото и автоматически получать список блюд.

- **Python**
  - Для подключения в проект более продвинутой версии OCR и лучшего качества распознования. 

- **socket.io-client**
  - Обеспечивает работу в реальном времени: выбор блюд, обновление корзины, синхронизация участников.

- **Lucide-react**
  - Красивый набор SVG-иконок, минималистичный и адаптивный.

- **React Swipeable**
  - Добавляет свайпы по блюдам (для разделения порций между пользователями).

---

### Backend:

- **Node.js + Express**
  - Backend-сервер, обрабатывающий подключения, столы, пользователей, блюда, разделение и синхронизацию данных.

- **Socket.IO**
  - Серверная часть для WebSockets — обеспечивает двустороннюю связь между клиентом и сервером.
  - Используется для работы в реальном времени со столами, блюдами и пользователями.

---

### Auth API

-  **Go + Gin**
  - Лёгкий и быстрый сервер авторизации и регистрации.

- **GORM**
  - ORM для работы с PostgreSQL.

- **PostgreSQL**
  - База данных для хранения пользователей и сессий.

- **JWT**
  - Аутентификация по токену.

### Сервер написан на Go и запускается как отдельный контейнер (go_server).

---

### DevOps:

- **Docker + Docker Compose**
  - Сборка, изоляция, запуск всех компонентов проекта.

- **docker-compose up --build**
 - localhost:4000 — клиент + Node backend + WebSocket

 - localhost:8080 — Go backend (авторизация)

 - localhost:5432 — PostgreSQL





### Хранилище и структура данных

- **Zustand**
  - Локальное управление состоянием (выбранные блюда, текущий пользователь, чаевые, распознанные блюда и пр.)
  - Легкость развертки для создания небольшого проекта

- **In-Memory State (на сервере)**
  - `tableUsers` — список пользователей за столом
  - `tableDishes` — все выбранные и разделённые блюда

- **PostgreSQL (через Go API)**
  - Пользователи, логин, JWT

---

### Дополнительные технологии и утилиты:

- **UUID (crypto.randomUUID)**
  - Генерация уникальных ID пользователей и блюд

---

### Почему именно эти технологии:

**React + TypeScript** - Производительность, масштабируемость, удобство разработки 
**Zustand** - Простота и скорость осваивания. Достаточен для старта проекта. 
**Tailwind CSS** - Скорость стилизации и адаптивный дизайн, минимализм 
**Socket.IO** - Мгновенная синхронизация между участниками за столом 
**Tesseract.js** - Автоматическое распознавание блюд с чека без ручного ввода 
**React Swipeable** - Удобные взаимодействия через свайпы для UX 
**Go** — скорость, лаконичность, стабильность в продакшене
**PostgreSQL** %

 - Надёжность и стабильность: PostgreSQL используется в продакшене во многих крупных проектах, включая финтех и госструктуры.

 - Мощные возможности: транзакции, индексы, связи между таблицами, валидация и расширения (например, pg_trgm, PostGIS).

 - Совместимость с GORM: полноценно поддерживается ORM-библиотекой в Go, легко подключается и масштабируется.

 - Открытый код и активное сообщество: PostgreSQL развивается как open-source с огромным количеством документации и сообществом поддержки.

---

### В планах:
- Интеграция платёжных систем СБП, QR...
- Хранение истории заказов и пользователей в БД