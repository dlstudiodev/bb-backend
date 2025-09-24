# Backend SaaS Workflows

Plateforme backend pour l'exécution de workflows automatisés avec Hono et trigger.dev.

## 🚀 Quick Start

### Prérequis
- Node.js 18+
- pnpm

### Installation
```bash
cd backend
pnpm install
```

### Variables d'environnement
```bash
# Dans backend/.env.local
TRIGGER_SECRET_KEY=tr_dev_your_key_here
```

## 💻 Développement

### Lancer l'environnement de dev

**Terminal 1 - Backend Hono :**
```bash
cd backend
pnpm run dev
```

**Terminal 2 - Trigger.dev :**
```bash
cd backend
pnpm run trigger:dev
```

### Tests API

**Health check :**
```bash
curl http://localhost:3000/health
```

**Déclencher le workflow :**
```bash
curl -X POST http://localhost:3000/workflows/remind-inactive-users
```

## 📁 Architecture

```
backend/src/
├── routes/               # API Hono
├── trigger/
│   ├── workflows/        # Workflows principaux
│   ├── schedulers/       # CRON jobs
│   └── steps/           # Steps réutilisables
├── domain/              # Logique métier
└── infrastructure/      # Adapters externes
```

## 📚 Documentation

- [Guide d'implémentation](./IMPLEMENTATION-GUIDE.md)
- [trigger.dev Dashboard](https://cloud.trigger.dev)