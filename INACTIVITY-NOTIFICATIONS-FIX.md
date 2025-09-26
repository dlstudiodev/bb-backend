# Fix: Système de Notifications d'Inactivité

## Problème Identifié

Le système de notifications d'inactivité envoyait plusieurs notifications le même jour à un utilisateur très inactif, causant du spam.

### Exemple du problème
- User inactif depuis 8 jours
- Recevait 3 notifications le même jour :
  - Template 1j (cooldown de 7j passé ✅)
  - Template 3j (cooldown de 7j passé ✅)
  - Template 7j (cooldown de 7j passé ✅)

## Solution Implémentée

### Logique Modifiée
Au lieu de vérifier le cooldown pour chaque template individuellement, la nouvelle logique vérifie s'il y a eu une notification récente **de seuil supérieur ou égal** au template actuel.

### Changement dans `detect_user_inactivity()`

**AVANT :**
```sql
SELECT MAX(created_at) INTO last_notification
FROM user_notifications
WHERE user_id = inactive_user.user_id
  AND template_id = template.id;  -- Juste CE template
```

**APRÈS :**
```sql
SELECT MAX(un.created_at) INTO last_notification
FROM user_notifications un
JOIN notification_templates nt ON un.template_id = nt.id
WHERE un.user_id = inactive_user.user_id
  AND nt.type = 'inactivity'
  AND (nt.metadata->>'days_threshold')::INTEGER >= days_threshold;  -- Templates de seuil ≥ actuel
```

### Ordre de Traitement
Les templates sont maintenant traités par ordre décroissant de seuil :
```sql
ORDER BY COALESCE((metadata->>'days_threshold')::INTEGER, 3) DESC
```

## Résultats

### Tests Effectués

**User 1 (36j d'inactivité) :**
- ✅ Reçoit **uniquement** template 14j
- ❌ Ne reçoit plus templates 7j, 3j, 1j

**User 2 (6j d'inactivité) :**
- ✅ Reçoit **uniquement** template 3j
- ❌ Ne reçoit plus template 1j

### Scénarios Futurs

**Relance demain (1j après) :**
- ❌ AUCUNE notification (cooldown 7j actif)
- ✅ Pas de spam quotidien

**Relance dans 30j :**
- ✅ User 1 (66j) : template 14j approprié
- ✅ User 2 (36j) : upgrade vers template 14j
- ✅ 1 notification appropriée chacun

## Templates de Notifications

| Seuil | Template | Utilisation |
|-------|----------|-------------|
| 1j    | bd9d8aaa-b88e-4d1f-8796-feb0609c5429 | Users très récents |
| 3j    | 24acdc2c-438b-4c4f-9e52-4e2ecd07d00f | Users modérément inactifs |
| 7j    | 3d1f20b5-42bb-4892-ad15-c8ab10d90138 | Users inactifs |
| 14j   | c43a474b-9f9d-4832-ad98-0c38533a76f0 | Users très inactifs |

## Algorithme Final

1. **Parcourir templates par seuil décroissant** (14j → 7j → 3j → 1j)
2. **Pour chaque user éligible** (jours d'inactivité ≥ seuil)
3. **Vérifier cooldown intelligent** (pas de notification ≥ seuil dans les 7 derniers jours)
4. **Envoyer 1 seule notification** (la plus appropriée au niveau d'inactivité)

## Migration

La fonction `detect_user_inactivity()` a été mise à jour directement en base de données.

**Statut :** ✅ **Déployé et testé**

**Date :** 26 septembre 2025

## Impact

- ✅ **Élimination du spam** de notifications
- ✅ **Cooldown intelligent** par niveau
- ✅ **1 notification appropriée** par user
- ✅ **Évolutivité** automatique des templates