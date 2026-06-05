# PhishGuard Login Awareness Demo: Fishbook

PhishGuard Login Awareness Demo is a local-only school cybersecurity awareness project. It demonstrates how a realistic-looking fake social login page can trick users while keeping the demo safe, contained, and educational.

## Purpose

This project demonstrates phishing awareness without stealing credentials. The login page is a fictional ocean-themed social platform called "Fishbook" with the tagline "Connect safely. Think before you click."

Fishbook is created only for cybersecurity awareness training and is not related to any real social media company.

## Safety Rules

- Run this project only on your own computer for training or classroom use.
- Do not use this project to collect, steal, or test real credentials.
- Do not copy any real company login page.
- Do not use real social media logos, platform names, or copied layouts.
- Do not connect this project to webhooks, emails, chat apps, external APIs, or remote servers.
- Passwords are hashed with bcrypt before they are stored.
- Passwords are never saved in plaintext.
- Passwords are masked as `********` in login logs and terminal output.
- Login failures always use the generic message: `Invalid username or password.`
- The server binds to `127.0.0.1`, so it runs only on localhost.

## Install

```bash
npm install
```

## Run The Web Server

```bash
npm start
```

Then open:

```text
http://127.0.0.1:3000
```

## Run The Admin Terminal

```bash
npm run terminal
```

## Demo Accounts

```text
admin / admin123
student / student123
```

The first time the server or admin terminal runs, `data/users.json` is created or filled with these demo accounts using bcrypt password hashes.

## What This Demonstrates

This project shows how phishing pages can appear polished and trustworthy. It also shows safer handling for a classroom demo:

- Passwords are compared using bcrypt.
- Plaintext passwords are not printed in the terminal.
- Plaintext passwords are not stored in JSON files.
- Login attempts store only `********` in the password field.
- The login page uses the fictional Fishbook brand instead of copying a real service.

Use this demo to teach students to verify website URLs before entering account information.
