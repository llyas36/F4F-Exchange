# F4F Exchange

A small side project I built to experiment with Flask + Next.js.
It’s basically a “follow-for-follow” directory where users can log in with Twitter (X), see others, and follow/unfollow them.

# Features

Twitter login (via OAuth)

Browse users in a simple directory

Follow / unfollow with mutual follow detection

Basic profile + stats page

# Stack

Frontend: Next.js + Tailwind

Backend: Flask + PostgreSQL

Auth: Twitter OAuth

Getting Started

  ```        
  # clone the repo
git clone https://github.com/llyas36/f4f-exchange.git
cd f4f-exchange

# backend
cd backend
pip install -r requirements.txt
flask run

# frontend
cd frontend
npm install
npm run dev


```
Notes

This is a side project — not production-ready.

I built it in public, sharing progress on Twitter.
