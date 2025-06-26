-- Удаляем старые таблицы, если есть
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admins;

-- Таблица пользователей
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  nikname TEXT UNIQUE NOT NULL,
  position TEXT,
  photo_url TEXT
);

-- Навыки
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Прошлые работы
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  responsibility TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Администраторы
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

-- Вставка пользователя (пример)
INSERT INTO users (firstname, lastname, nikname, position, photo_url)
VALUES ('Nazar', 'Rybchuk', 'nrybchuk', 'Full-Stack Developer', '/images/profile.jpg');

-- Вставка админа с захешированным паролем "admin123" (пример)
-- Вы можете сгенерировать свой хеш с помощью bcrypt
-- npm i -g bcrypt-cli
-- bcrypt-cli hash admin123
INSERT INTO admins (username, password_hash)
VALUES (
  'admin',
  '$2b$10$UoUKzDaRfa93xXch.TByG.vvBPntPBfURaDybLUl4KToXgtv1Pa9W'
);
