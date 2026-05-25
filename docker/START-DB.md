# Démarrer la base de données en local

Ce guide explique comment démarrer uniquement le service PostgreSQL défini dans `docker/docker-compose.yml`.

## Étapes

1. Copier le fichier d'exemple d'environnement

```powershell
cd docker
copy .env.example .env
```

2. Vérifier/ajuster les variables nécessaires dans `.env`

Les variables de base à vérifier sont :

- `ENVIRONMENT`
- `DATABASE`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `DATABASE_PORT`

3. Démarrer le service PostgreSQL

```powershell
docker compose up -d db
```

4. Vérifier que le conteneur est en bonne santé

```powershell
docker compose ps
```

Le service `db` utilise l'image `postgres:17` et monte la donnée dans `docker/data/postgres`.

## Notes

- Le conteneur `db` est configuré avec un `healthcheck` et des dépendances de service.
- Le volume de données persiste sous `docker/data/postgres`.
- Un fichier d'initialisation SQL est monté depuis `docker/db/myDB.sql`.
