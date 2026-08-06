# Personal Book Manager

A full-stack reading list app built with the MERN stack and Next.js. Users can sign up, log in, and manage a personal collection of books — tracking what they're reading, what they've finished, and what's next.

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS
- **Backend:** Next.js API Routes (Node.js)
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT stored in httpOnly cookies
- **Deploy:** Vercel + MongoDB Atlas

---

## Features

- Sign up and log in securely — passwords hashed with bcrypt, sessions via JWT
- Add books with title, author, tags, and reading status
- Update status per book (Want to Read / Reading / Completed)
- Filter collection by status or tag
- Dashboard showing total, currently reading, and completed counts
- Fully protected routes — each user sees only their own books
- Logout clears the session cookie

---

## Running Locally

**1. Clone the repo**

```bash
git clone https://github.com/YOUR_USERNAME/book-manager.git
cd book-manager
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```
MONGODB_URI= # your MongoDB Atlas connection string (non-SRV format)
MONGODB_USER= # database username
MONGODB_PASS= # database password
JWT_SECRET= # random 32-byte hex string

To generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**4. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).