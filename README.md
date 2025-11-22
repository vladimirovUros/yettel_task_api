# Yettel Task API

Ovaj projekat predstavlja REST API za upravljanje taskovima sa rolama korisnika (Basic i Admin), napravljen sa Node.js, Express i MySQL.

---

## Swagger API Dokumentacija

API ima **interaktivnu Swagger dokumentaciju** dostupnu na:
```
http://localhost:3000/api-docs
```

### Kako koristiti Swagger UI:

1. **Pregled endpoint-a**: Svi endpoint-i su organizovani po kategorijama (Auth, Tasks, Users)
2. **Testiranje endpoint-a**: 
   - Klikni na bilo koji endpoint
   - Klikni **"Try it out"**
   - Unesi parametre/body
   - Klikni **"Execute"**
3. **Autentikacija za zaštićene endpoint-e**:
   - Klikni **"Authorize"** dugme (gornji desni ugao, ikonica brave)
   - Unesi: `Bearer <tvoj_jwt_token>` (bez navodnika)
   - Klikni **"Authorize"**
   - Sada možeš testirati sve zaštićene endpoint-e

### Kako dobiti JWT token za testiranje:

1. U Swagger-u otvori **POST /api/auth/login**
2. Klikni **"Try it out"**
3. Unesi email i password (npr. `marko@example.com` / `marko123`)
4. Klikni **"Execute"**
5. Kopiraj **token** iz response-a
6. Klikni **"Authorize"** i paste token

**Prednosti Swagger dokumentacije:**
- Interaktivno testiranje direktno iz browser-a
- Automatska validacija request/response strukture
- Jasni primeri za sve endpoint-e
- Ne treba Postman za brzo testiranje

---





---
## API Dokumentacija

### Base URL
```
http://localhost:3000/api
```

---

### Public Endpoint-i (bez autentikacije)

#### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
    "status": "OK",
    "timestamp": "2025-11-22T12:00:00.000Z"
}
```

---

#### 2. Register
```http
POST /auth/register
Content-Type: application/json
```
**Body:**
```json
{
    "firstName": "Marko",
    "lastName": "Markovic",
    "username": "marko123",
    "email": "marko@example.com",
    "password": "marko123",
    "role": "basic"
}
```

**Success Response (201):**
```json
{
    "message": "User registered successfully.",
    "user": {
        "id": 1,
        "firstName": "Marko",
        "lastName": "Markovic",
        "username": "marko123",
        "email": "marko@example.com",
        "role": "basic",
        "created_at": "2025-11-22T..."
    }
}
```

**Error Responses:**
- `400` - Missing fields / Invalid email / Short password
- `409` - Email or username already exists

---

#### 3. Login
```http
POST /auth/login
Content-Type: application/json
```
**Body:**
```json
{
    "email": "marko@example.com",
    "password": "marko123"
}
```

**Success Response (200):**
```json
{
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "firstName": "Marko",
        "lastName": "Markovic",
        "username": "marko123",
        "email": "marko@example.com",
        "role": "basic"
    }
}
```

**VAŽNO:** Sačuvaj `token` - koristi ga u Authorization header-u za sve zaštićene rute!

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid email or password

---

### Protected Endpoint-i (JWT token obavezan)

**Svi sledeći endpoint-i zahtevaju Authorization header:**
```http
Authorization: Bearer <your_jwt_token>
```

---

### Task Endpoint-i

#### 4. Create Task (samo BASIC user)
```http
POST /tasks
Authorization: Bearer <basic_user_token>
Content-Type: application/json
```
**Body:**
```json
{
    "body": "Kupiti hleb i mleko"
}
```

**Success Response (201):**
```json
{
    "message": "Task created successfully.",
    "task": {
        "id": 1,
        "body": "Kupiti hleb i mleko",
        "userId": 1,
        "firstName": "Marko",
        "lastName": "Markovic",
        "username": "marko123",
        "created_at": "2025-11-22T...",
        "updated_at": "2025-11-22T..."
    }
}
```

**Error Responses:**
- `400` - Empty body
- `401` - No token / Invalid token
- `403` - Admin pokušava da kreira task

---

#### 5. Get All Tasks (sa paginacijom i sortiranjem)
```http
GET /tasks?page=1&limit=10&sort=DESC
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opciono): Broj stranice (default: 1)
- `limit` (opciono): Taskova po stranici (default: 10, max: 100)
- `sort` (opciono): `DESC` (najnoviji first) ili `ASC` (najstariji first)

**Ponašanje:**
- **Basic User**: Vidi samo svoje taskove
- **Admin User**: Vidi sve taskove

**Success Response (200):**
```json
{
    "tasks": [
        {
            "id": 1,
            "body": "Kupiti hleb i mleko",
            "userId": 1,
            "firstName": "Marko",
            "lastName": "Markovic",
            "username": "marko123",
            "created_at": "2025-11-22T...",
            "updated_at": "2025-11-22T..."
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 3,
        "totalTasks": 25,
        "tasksPerPage": 10
    }
}
```

**Error Responses:**
- `400` - Invalid page/limit/sort parameters

---

#### 6. Get Single Task
```http
GET /tasks/:id
Authorization: Bearer <token>
```

**Ponašanje:**
- **Basic User**: Može videti samo svoje taskove
- **Admin User**: Može videti sve taskove

**Success Response (200):**
```json
{
    "task": {
        "id": 1,
        "body": "Kupiti hleb i mleko",
        "userId": 1,
        "firstName": "Marko",
        "lastName": "Markovic",
        "username": "marko123",
        "created_at": "2025-11-22T...",
        "updated_at": "2025-11-22T..."
    }
}
```

**Error Responses:**
- `403` - Basic user pokušava da vidi tuđ task
- `404` - Task not found

---

#### 7. Update Task
```http
PUT /tasks/:id
Authorization: Bearer <token>
Content-Type: application/json
```
**Body:**
```json
{
    "body": "UPDATED - Kupiti hleb, mleko i jaja"
}
```

**Ponašanje:**
- **Basic User**: Može update-ovati samo svoje taskove
- **Admin User**: Može update-ovati sve taskove

**Success Response (200):**
```json
{
    "message": "Task updated successfully.",
    "task": {
        "id": 1,
        "body": "UPDATED - Kupiti hleb, mleko i jaja",
        "userId": 1
    }
}
```

**Error Responses:**
- `400` - Empty body
- `403` - Basic user pokušava da update-uje tuđ task
- `404` - Task not found

---

### User Endpoint-i

#### 8. Get User Data
```http
GET /users/:id
Authorization: Bearer <token>
```

**Ponašanje:**
- **Basic User**: Može videti samo svoje podatke
- **Admin User**: Može videti sve user-e

**Success Response (200):**
```json
{
    "user": {
        "id": 1,
        "firstName": "Marko",
        "lastName": "Markovic",
        "username": "marko123",
        "email": "marko@example.com",
        "role": "basic",
        "created_at": "2025-11-22T..."
    }
}
```

**Napomena:** Password polje nije uključeno (bezbednost).

**Error Responses:**
- `403` - Basic user pokušava da vidi druge user-e
- `404` - User not found

---

#### 9. Update User Data
```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json
```
**Body (sva polja opciona):**
```json
{
    "firstName": "Marko",
    "lastName": "Markovic UPDATED",
    "username": "marko_new",
    "email": "marko_new@example.com"
}
```

**Ponašanje:**
- **Basic User**: Može update-ovati samo svoje podatke
- **Admin User**: Može update-ovati sve user-e
- Podržava parcijalni update (nije obavezno poslati sva polja)

**Success Response (200):**
```json
{
    "message": "User updated successfully.",
    "user": {
        "id": 1,
        "firstName": "Marko",
        "lastName": "Markovic UPDATED",
        "username": "marko_new",
        "email": "marko_new@example.com",
        "role": "basic",
        "created_at": "2025-11-22T..."
    }
}
```

**Error Responses:**
- `400` - Invalid email format / No fields provided
- `403` - Basic user pokušava da update-uje druge user-e
- `404` - User not found
- `409` - Email or username already exists

---
## E2E Testing

Projekat sadrži kompletne integration testove koji pokrivaju sve funkcionalnosti API-ja.

### Pokretanje Testova
```bash
npm test
```

### Test Suites

Projekat ima **4 test suite-a** sa **50 integration testova**:

#### 1. Auth Tests (12 testova)
- Registracija korisnika (success i fail case-ovi)
- Login (success i fail case-ovi)
- Email/password validacije
- Duplicate email/username provere

#### 2. Task Tests (21 test)
- CRUD operacije za taskove
- Role-based access control (Basic vs Admin)
- Paginacija (page, limit parametri)
- Sortiranje (ASC)
- Validacije i error handling
- 404 i 403 edge cases

#### 3. User Tests (14 testova)
- CRUD operacije za korisnike
- Role-based access control
- Parcijalni update (optional fields)
- Email format validacija
- Duplicate email/username provere

#### 4. Integration Tests (3 testa)
- Kompletan Basic user flow (register → login → create tasks → update)
- Kompletan Admin user flow (view/update all resources)
- Multi-user isolation (provera da basic user ne može pristupiti tuđim resursima)

### Test Database

Testovi koriste zasebnu test bazu (`task_api_test`) koja se automatski:
- Kreira prilikom setup-a
- Čisti pre svakog testa
- Disconnectuje nakon završetka testova

**Važno:** Production baza (`task_api`) ostaje **netaknuta** tokom testiranja.

### Test Coverage

**Pokriveni scenariji:**
- Autentikacija i autorizacija
- JWT token validacija
- Role-based access control (Basic/Admin)
- CRUD operacije (Tasks i Users)
- Paginacija i sortiranje
- Input validacija
- Error handling (400, 401, 403, 404, 409, 500)
- Edge cases i boundary conditions
- Multi-user isolation
- E2E user workflows

### Napomene

- DESC sortiranje je testirano ručno preko Postman-a i funkcioniše ispravno
- ASC sortiranje je pokriveno integration testom
- Testovi se izvršavaju sekvencijalno (`--runInBand`) radi konzistentnosti



## Sadržaj

- [Swagger API Dokumentacija](#swagger-api-dokumentacija)
- [API Dokumentacija](#api-dokumentacija)
- [E2E Testing](#e2e-testing)
- [Opis Projekta](#opis-projekta)
- [Tehnologije](#tehnologije)
- [Funkcionalnosti](#funkcionalnosti)
- [Preduslov za Pokretanje](#preduslov-za-pokretanje)
- [Instalacija i Pokretanje](#instalacija-i-pokretanje)
- [Struktura Projekta](#struktura-projekta)
- [Postman Testiranje](#postman-testiranje)
- [Baza Podataka](#baza-podataka)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Opis Projekta

Ovaj projekat je REST API sistem za upravljanje taskovima koji implementira **role-based access control** sa dva tipa korisnika:

- **Basic User**: Može kreirati, listati i ažurirati samo svoje taskove i profile
- **Admin User**: Može listati i ažurirati sve taskove i profile, ali ne može kreirati taskove

API podržava JWT autentikaciju, paginaciju, sortiranje i validaciju podataka.

---

## Tehnologije

- **Node.js** (v14+)
- **Express.js** (v5.1.0) - Web framework
- **MySQL** (v8.0+) - Relaciona baza podataka
- **mysql2** - MySQL driver sa Promise podrškom
- **bcryptjs** - Hashovanje passworda
- **jsonwebtoken** - JWT autentikacija
- **dotenv** - Upravljanje environment varijablama
- **swagger-ui-express** - API dokumentacija
- **nodemon** - Auto-restart servera (development)

---

## Funkcionalnosti

### Autentikacija
- Registracija korisnika (basic/admin)
- Login sa JWT tokenom
- Password hashovanje (bcrypt)
- Token expiration (24h)

### Task Management
- **Basic User**: Kreiranje, listanje (samo svoje), update (samo svoje)
- **Admin User**: Listanje svih taskova, update svih taskova (ne može kreirati)
- Paginacija taskova (`page`, `limit`)
- Sortiranje (`ASC` - najstariji first, `DESC` - najnoviji first)

### User Management
- **Basic User**: Pregled i update samo svojih podataka
- **Admin User**: Pregled i update svih korisnika

### Validacije
- Unique email i username
- Email format validacija
- Password minimum 6 karaktera
- Input validacija za sve endpoint-e
- Error handling

---

## Preduslov za Pokretanje

Pre pokretanja projekta, potrebno je da imate instalirano:

1. **Node.js** (v14 ili noviji)
   - Preuzmite sa: https://nodejs.org/
   - Provera verzije: `node --version`

2. **MySQL** (v8.0 ili noviji)
   - Preuzmite sa: https://dev.mysql.com/downloads/mysql/
   - Ili koristi XAMPP/WAMP za Windows
   - Provera verzije: `mysql --version`

3. **Git** (opciono, za kloniranje repozitorijuma)
   - Preuzmite sa: https://git-scm.com/

4. **Postman** (za testiranje API-ja)
   - Preuzmite sa: https://www.postman.com/downloads/

---

## Instalacija i Pokretanje

### 1. Kloniranje Repozitorijuma

```bash
git clone <repository-url>
cd yettel_task
```

### 2. Instalacija Paketa

```bash
npm install
```

Ovo će instalirati sve potrebne dependencije:
- express
- mysql2
- dotenv
- bcryptjs
- jsonwebtoken
- swagger-ui-express
- nodemon (dev dependency)

### 3. Kreiranje MySQL Baze

Otvori MySQL Workbench ili terminal i izvrši sledeće SQL komande:

```sql
-- Kreiranje baze podataka
CREATE DATABASE task_api;
USE task_api;

-- Kreiranje users tabele
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(40) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    username VARCHAR(35) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('basic', 'admin') DEFAULT 'basic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Kreiranje tasks tabele
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    body TEXT NOT NULL,
    userId INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Kreiranje indeksa za optimizaciju
CREATE UNIQUE INDEX idx_username ON users(username);
CREATE INDEX idx_userId ON tasks(userId);
CREATE INDEX idx_created_at ON tasks(created_at);
```

### 4. Konfiguracija Environment Variables

Kreirajte `.env` fajl u root folderu projekta:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=task_api
DB_PORT=3306

# JWT
JWT_SECRET=k8mP2nQ9vR5wX3zA7bC4dE1fG6hJ0iL8mN5oP2qR9sT4uV7wX3yZ6aB1cD4eF
JWT_EXPIRES_IN=24h
```

**VAŽNO:** Promenite `DB_PASSWORD` ako vaš MySQL root user ima password!

### 5. Pokretanje Servera

**Development mode** (sa auto-restart):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Ako je sve uspešno, videćete:
```
Database connected successfully
Server is running on port 3000
Environment: development
```

### 6. Testiranje Health Check

Otvori browser ili Postman i pozovi:
```
GET http://localhost:3000/api/health
```

Trebalo bi da dobijete:
```json
{
    "status": "OK",
    "timestamp": "2025-11-22T..."
}
```

API je spreman za korišćenje!

### 7. Swagger API Dokumentacija

Otvori browser i idi na:
```
http://localhost:3000/api-docs
```

Videćete interaktivnu dokumentaciju sa svim endpoint-ima i mogućnošću testiranja direktno iz browser-a.

---

## Struktura Projekta

```
yettel_task/
├── src/
│   ├── config/
│   │   └── database.js          # MySQL konekcija (connection pool)
│   ├── controllers/
│   │   ├── authController.js    # Register & Login logika
│   │   ├── userController.js    # User CRUD operacije
│   │   └── taskController.js    # Task CRUD operacije
│   ├── middleware/
│   │   ├── auth.js              # JWT token verifikacija
│   │   └── roleCheck.js         # Role-based access control
│   ├── models/
│   │   ├── User.js              # User model (database queries)
│   │   └── Task.js              # Task model (database queries)
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth endpoint-i
│   │   ├── userRoutes.js        # /api/users endpoint-i
│   │   └── taskRoutes.js        # /api/tasks endpoint-i
│   └── app.js                   # Express app setup
├── swagger.json                  # Swagger/OpenAPI specifikacija
├── .env                          # Environment variables
├── .gitignore                    # Git ignore fajl
├── server.js                     # Entry point
├── package.json                  # NPM dependencies
└── README.md                     # Ovaj fajl
```

### Arhitektura

Projekat prati **SOLID** principe i **MVC** pattern:

- **Models**: Interakcija sa bazom podataka (SQL queries)
- **Controllers**: Business logika (validacija, error handling)
- **Routes**: Definisanje endpoint-a i middleware-a
- **Middleware**: JWT autentikacija, role provera

---

## Postman Testiranje

### Import Kolekcije i Environment-a

U root folderu projekta nalaze se tri JSON fajla:

1. **`yettel_task_api.postman_collection.json`** - Kolekcija sa 56 testova
2. **`yettel_task_template.postman_environment.json`** - Environment template (prazne vrednosti)
3. **`yettel_task.postman_environment.json`** - Environment sa popunjenim vrednostima (opciono)

#### Korak 1: Import u Postman

1. Otvori Postman
2. Klikni **Import** (gornji levi ugao)
3. Drag & drop sve tri JSON fajla ili klikni **Choose Files**
4. Klikni **Import**

#### Korak 2: Aktiviraj Environment

1. U gornjem desnom uglu Postman-a klikni dropdown meni
2. Selektuj **`yettel_task_template`** (za čist početak) ili **`yettel_task`** (sa popunjenim vrednostima)

---

### Environment Varijable

Nakon import-a, imaš dostupne sledeće varijable:

| Varijabla       | Opis                                    | Kako se popunjava                    |
|-----------------|-----------------------------------------|--------------------------------------|
| `base_url`      | Base URL servera                        | Već popunjeno: `http://localhost:3000` |
| `basic_token`   | JWT token basic usera                   | Nakon login-a, kopiraj iz response-a |
| `admin_token`   | JWT token admin usera                   | Nakon login-a, kopiraj iz response-a |
| `basic_user_id` | ID basic usera                          | Nakon registracije, kopiraj iz response-a |
| `admin_user_id` | ID admin usera                          | Nakon registracije, kopiraj iz response-a |
| `task_id_1`     | ID prvog taska (za testiranje)          | Nakon kreiranja taska, kopiraj iz response-a |
| `task_id_2`     | ID drugog taska (za testiranje)         | Nakon kreiranja taska, kopiraj iz response-a |

---

### Testiranje - Korak po Korak

#### Faza 1: Registracija Korisnika

1. Otvori folder **"2. Auth (Register & Login)"**
2. Pokreni **"Register Basic User #1 (Marko)"** → Send
   - Očekuješ: 201 Created
   - Kopiraj `user.id` iz response-a
   - Idi u **Environments** → `yettel_task_template` → Paste u `basic_user_id` → Save
3. Pokreni **"Register Admin User (Ana)"** → Send
   - Očekuješ: 201 Created
   - Kopiraj `user.id` iz response-a
   - Paste u `admin_user_id` → Save

#### Faza 2: Login i Token-i

1. Pokreni **"Login Basic User (Marko)"** → Send
   - Očekuješ: 200 OK sa tokenom
   - Kopiraj ceo `token` string iz response-a
   - Idi u **Environments** → `yettel_task_template` → Paste u `basic_token` → Save
2. Pokreni **"Login Admin User (Ana)"** → Send
   - Kopiraj `token` → Paste u `admin_token` → Save

**VAŽNO:** Od sada svi zaštićeni endpoint-i će raditi jer imaš token-e u Environment-u!

#### Faza 3: Task Operacije

1. Otvori folder **"3. Tasks - Basic User"**
2. Pokreni **"Create Task #1"** → Send (kao Marko)
   - Kopiraj `task.id` → Save u `task_id_1`
3. Pokreni **"Create Task #2"** → Send
   - Kopiraj `task.id` → Save u `task_id_2`
4. Pokreni ostale testove (Create Task #3, #4, #5)
5. Testiraj paginaciju i sortiranje
6. Testiraj fail case-ove

#### Faza 4: Admin Testovi

1. Otvori folder **"4. Tasks - Admin"**
2. Pokreni **"Create Task - Admin (FAIL)"** → Očekuješ: 403 Forbidden
3. Pokreni **"Get All Tasks - Admin"** → Admin vidi SVE taskove
4. Pokreni **"Update Task - Admin"** → Admin može menjati tuđe taskove

#### Faza 5: User Operacije

1. Testiraj folder **"5. Users - Basic User"**
2. Testiraj folder **"6. Users - Admin"**

#### Faza 6: Edge Cases

1. Testiraj folder **"7. Edge Cases"**

---

### Struktura Kolekcije

```
Yettel Task API (56 testova)
├── 1. Health Check (1 test)
├── 2. Auth (Register & Login) (14 testova)
├── 3. Tasks - Basic User (20 testova)
├── 4. Tasks - Admin (5 testova)
├── 5. Users - Basic User (9 testova)
├── 6. Users - Admin (4 testova)
└── 7. Edge Cases (3 testa)
```

---

### Razlog za Tri Environment Fajla

**Zašto su uključena tri fajla:**

1. **`yettel_task_template.postman_environment.json`** - Template sa praznim vrednostima
2. **`yettel_task.postman_environment.json`** - Sa popunjenim vrednostima za brzo testiranje
3. **`yettel_task_api.postman_collection.json`** - Kompletan set testova

Razlog: Token-i ekspiraju nakon 24h i User/Task ID-evi su specifični za svaku bazu. Template omogućava svakom korisniku da popuni svoje vrednosti tokom testiranja, dok popunjen environment omogućava brzu proveru funkcionalnosti.

---

## Baza Podataka

### Schema

#### users tabela
| Kolona      | Tip               | Opis                               |
|-------------|-------------------|------------------------------------|
| id          | INT (PK)          | Auto-increment ID                  |
| firstName   | VARCHAR(40)       | Ime korisnika                      |
| lastName    | VARCHAR(50)       | Prezime korisnika                  |
| username    | VARCHAR(35)       | Unique username                    |
| email       | VARCHAR(50)       | Unique email                       |
| password    | VARCHAR(255)      | Hashed password (bcrypt)           |
| role        | ENUM              | 'basic' ili 'admin' (default: basic) |
| created_at  | TIMESTAMP         | Datum kreiranja                    |
| updated_at  | TIMESTAMP         | Datum poslednjeg update-a          |

**Indeksi:**
- PRIMARY KEY (id)
- UNIQUE KEY (email)
- UNIQUE KEY (username)

---

#### tasks tabela
| Kolona      | Tip               | Opis                               |
|-------------|-------------------|------------------------------------|
| id          | INT (PK)          | Auto-increment ID                  |
| body        | TEXT              | Sadržaj taska                      |
| userId      | INT (FK)          | ID usera koji je kreirao task      |
| created_at  | TIMESTAMP         | Datum kreiranja                    |
| updated_at  | TIMESTAMP         | Datum poslednjeg update-a          |

**Indeksi:**
- PRIMARY KEY (id)
- INDEX (userId)
- INDEX (created_at)
- FOREIGN KEY (userId) → users(id) ON DELETE CASCADE

---

### Relacije

- Jedan user može imati više taskova (1:N)
- Ako se user obriše, svi njegovi taskovi se automatski brišu (CASCADE)

---

## Environment Variables

`.env` fajl sadrži osetljive podatke i ne sme biti commit-ovan na GitHub.

### Struktura .env fajla

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=task_api
DB_PORT=3306

# JWT Configuration
JWT_SECRET=<random_string>
JWT_EXPIRES_IN=24h
```

### Generisanje JWT_SECRET

Možeš koristiti bilo koji random string (minimum 32 karaktera).

---

## Troubleshooting

### Problem: "Database connection failed"

**Rešenje:**
1. Proveri da li je MySQL server pokrenut
2. Proveri kredencijale u `.env` fajlu (`DB_USER`, `DB_PASSWORD`)
3. Proveri da li baza `task_api` postoji

---

### Problem: "Access denied for user 'root'@'localhost'"

**Rešenje:**
- Dodaj MySQL password u `.env`: `DB_PASSWORD=tvoj_password`

---

### Problem: "Invalid token" ili "Token expired"

**Rešenje:**
- Token-i ekspiraju nakon 24h
- Login-uj se ponovo i sačuvaj novi token

---

### Problem: "Port 3000 is already in use"

**Rešenje:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID_NUMBER>
```

Ili promeni port u `.env` fajlu: `PORT=3001`

---

### Problem: Request-i u Postman-u ne rade

**Rešenje:**
1. Proveri da je environment aktivan (gornji desni ugao)
2. Proveri da `base_url` ima vrednost `http://localhost:3000`
3. Proveri da su token-i sačuvani
4. Restartuj server: `npm run dev`

---

## Licence

Ovaj projekat je razvijen za potrebe tehničkog zadatka i ne sadrži eksplicitnu licencu.

---

## Autor

**Uroš**

---

**Hvala što koristite Yettel Task API!**
