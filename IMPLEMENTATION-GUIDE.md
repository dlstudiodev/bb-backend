# Guide d'Implémentation - Backend SaaS Workflows

## 🎯 État Actuel du Projet

### ✅ Implémenté (Dernière mise à jour : 26 sept 2025)
- **Hono API** : Routes health et workflows
- **trigger.dev v4** : Workflow complet fonctionnel optimisé (single step processing)
- **Supabase** : Configuration, connexion et fonction PostgreSQL anti-spam intégrée
- **Domain layer** : User types enrichis avec email, services complets
- **Step 1** : find-inactive-users avec vraies données Supabase
- **Step 2** : send-external-notifications avec Resend email service + filtrage mockMode
- **Email Service** : Resend API intégré avec templates HTML personnalisés français
- **CRON Scheduler** : daily-email-reminder déployé automatiquement (test: 3min, prod: 8AM)
- **Anti-spam Logic** : Timing CRON (Supabase midnight + email 8AM) + cooldown SQL function
- **Data Accuracy** : Calculs d'inactivité vérifiés et fonctionnels (30j confirmé)

---

## 1. Architecture Fonctionnelle

```
┌─────────────────────┐
│   HONO API ROUTE    │
│                     │
│ POST /workflows/    │
│ remind-inactive-    │
│     users           │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ ORCHESTRATEUR       │
│ trigger.dev         │
│                     │
│ remindInactiveUsers │
│ Task (CHEF)         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐    ┌─────────────────────┐
│    STEP 1           │    │    STEP 2           │
│                     │    │                     │
│ find-inactive-      │    │ send-external-      │
│ users.step          │    │ notifications.step  │
│ (avec anti-spam)    │    │ (avec enrichissement│
│                     │    │  emails)            │
└─────────┬───────────┘    └─────────┬───────────┘
          │                          │
          ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐
│ DOMAIN SERVICES     │    │ INFRASTRUCTURE      │
│                     │    │                     │
│ UserService         │    │ EmailService        │
│ UserRepository      │    │ (Resend API)        │
│        ↕            │    │                     │
│ INFRASTRUCTURE      │    │                     │
│ SupabaseAdapter     │    │                     │
│ (fonction SQL       │    │                     │
│  anti-spam)         │    │                     │
└─────────────────────┘    └─────────────────────┘
```

## 2. Principes de Conception

### 2.1 Séparation des Responsabilités
- **Déclencheurs** : Points d'entrée (API, scheduling)
- **Orchestrateur** : Gestion du flow via trigger.dev
- **Règles Métier** : Logique pure, testable
- **Infrastructure** : Accès aux données et services externes

### 2.2 Indépendance de la Base de Données
- Utilisation du pattern Repository
- Interfaces abstraites pour les opérations de données
- Implémentations concrètes pour Supabase

### 2.3 Architecture Hexagonale Simplifiée
```
Application Core (Règles Métier)
├── Ports (Interfaces)
└── Adapters (Implémentations)
    ├── Database (Supabase)
    ├── Email Service
    └── Notifications
```

## 3. Flux de Données - Workflow "Relance Utilisateurs Inactifs"

```
[Déclencheur] → [trigger.dev Job] → [Business Logic] → [Infrastructure]
      │                │                    │                │
     CRON          Orchestration         Steps          Supabase/Email
   (8AM UTC)       Step by Step        (2 steps)         Services
```

### 3.1 Séquence Détaillée (Implémentée)
1. **Déclenchement** : CRON daily-email-reminder (8AM UTC) → trigger.dev workflow
2. **Step 1** : find-inactive-users → Supabase query avec fonction PostgreSQL anti-spam
3. **Enrichissement** : getUserEmailsFromIds() dans le workflow principal
4. **Step 2** : send-external-notifications → Resend API avec mock mode/filtrage hello@d-l.studio

## 4. Structure de Projet Hono - YAGNI & Scalable

```
src/
├── app.ts                           # Point d'entrée Hono
├── routes/
│   └── workflows.ts                 # POST /workflows/* endpoints
├── trigger/
│   ├── workflows/                   # Workflows principaux
│   │   └── remind-inactive-users.ts # Workflow complet orchestration
│   ├── schedulers/                  # CRON schedulers par fréquence
│   │   └── daily-email-reminder.ts # Email quotidien utilisateurs inactifs (8AM UTC)
│   └── steps/                       # Briques réutilisables
│       ├── find-inactive-users.ts
│       └── send-external-notifications.ts
├── domain/                          # Logique métier pure
│   ├── users/
│   │   ├── user.types.ts           # Interfaces & types
│   │   ├── user.service.ts         # Logique métier Users
│   │   └── user.repository.ts      # Interface repository
└── infrastructure/                  # Adapters & clients externes
    ├── database/
    │   └── supabase-user.adapter.ts     # User repository impl
    └── email/
        └── resend-email.service.ts      # Resend API service
```

## 5. Flux d'Exécution - Cas "Relance Utilisateurs Inactifs"

### 5.1 Déclenchement
```
[POST /workflows/remind-inactive-users] → [remind-inactive-users.ts]
[CRON daily-email-reminder (8AM UTC)] → [remind-inactive-users.ts]
```

### 5.2 Orchestration trigger.dev
```
remind-inactive-users.ts
├── Step 1: find-inactive-users.ts (avec anti-spam SQL intégré)
└── Step 2: send-external-notifications.ts (avec enrichissement emails)
```

### 5.3 Steps → Domain → Infrastructure
```
Step → Domain Service → Infrastructure Adapter
```

## 6. Avantages de cette Architecture

- ✅ **YAGNI** : Structure simple, pas de sur-ingénierie
- ✅ **Évolutivité** : Ajout facile de nouveaux workflows
- ✅ **Réutilisabilité** : Steps partagés entre workflows
- ✅ **Testabilité** : Business logic isolée
- ✅ **Maintenabilité** : Responsabilités clairement séparées
- ✅ **Flexibilité** : Changement de DB possible sans impact métier
- ✅ **Observabilité** : Monitoring via trigger.dev