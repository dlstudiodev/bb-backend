# Guide d'Implémentation - Backend SaaS Workflows

## 🎯 État Actuel du Projet

### ✅ Implémenté
- **Hono API** : Routes health et workflows
- **trigger.dev** : Workflow principal fonctionnel
- **TypeScript** : Types et interfaces complètes
- **Structure** : Architecture YAGNI respectée

### 🔄 En Cours / À Faire
- **Supabase** : Configuration et connexion
- **Steps atomiques** : find-inactive-users, send-notifications
- **Domain layer** : Services métier
- **Anti-spam** : Table notifications_log

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
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│    STEP 1           │    │    STEP 2           │    │    STEP 3           │
│                     │    │                     │    │                     │
│ find-inactive-      │    │ apply-antispam      │    │ send-notifications  │
│ users.step          │    │ rules.step          │    │ .step               │
│                     │    │                     │    │                     │
└─────────┬───────────┘    └─────────┬───────────┘    └─────────┬───────────┘
          │                          │                          │
          ▼                          ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ DOMAIN SERVICES     │    │ DOMAIN SERVICES     │    │ INFRASTRUCTURE      │
│                     │    │                     │    │                     │
│ UserService         │    │ AntiSpamService     │    │ EmailService        │
│ UserRepository      │    │ NotificationLog     │    │ PushService         │
│        ↕            │    │        ↕            │    │                     │
│ INFRASTRUCTURE      │    │ INFRASTRUCTURE      │    │                     │
│ SupabaseAdapter     │    │ SupabaseAdapter     │    │                     │
│                     │    │ EmailClient         │    │                     │
│                     │    │ PushClient          │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
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
   API/Cron        Orchestration        Anti-spam      Supabase/Email
                   Step by Step         Logic          Services
```

### 3.1 Séquence Détaillée
1. **Déclenchement** (API ou Cron) → trigger.dev job
2. **Étape 1** : Récupération des utilisateurs inactifs
3. **Étape 2** : Application des règles anti-spam
4. **Étape 3** : Envoi des notifications (email + in-app)

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
│   │   ├── daily.scheduler.ts       # Jobs quotidiens (inactive users, cleanup...)
│   │   ├── weekly.scheduler.ts      # Jobs hebdomadaires
│   │   └── monthly.scheduler.ts     # Jobs mensuels
│   └── steps/                       # Briques réutilisables
│       ├── find-inactive-users.ts
│       ├── apply-antispam.ts
│       └── send-notifications.ts
├── domain/                          # Logique métier pure
│   ├── users/
│   │   ├── user.types.ts           # Interfaces & types
│   │   ├── user.service.ts         # Logique métier Users
│   │   └── user.repository.ts      # Interface repository
│   └── notifications/
│       ├── notification.types.ts   # Types Notifications
│       ├── notification.service.ts # Logique anti-spam & notifications
│       └── notification.repository.ts # Interface repository
└── infrastructure/                  # Adapters & clients externes
    ├── database/
    │   ├── supabase-user.adapter.ts     # User repository impl
    │   └── supabase-notification.adapter.ts # Notification repository impl
    ├── email/
    │   └── email.client.ts              # Client API email (Gmail, Sendgrid...)
    └── messaging/
        └── push-notification.client.ts  # Client push (Firebase, Apple...)
```

## 5. Flux d'Exécution - Cas "Relance Utilisateurs Inactifs"

### 5.1 Déclenchement
```
[POST /workflows/inactive-users] → [inactive-users.job.ts]
```

### 5.2 Orchestration trigger.dev
```
inactive-users.job.ts
├── Step 1: find-inactive-users.job.ts
├── Step 2: apply-antispam.job.ts
└── Step 3: send-notifications.job.ts
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