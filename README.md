# PreclinicalTrials.eu

The register of preclinical animal study protocols: a Laravel 13 backend with an Inertia 3 + React 19 frontend (TypeScript, Tailwind 4, Vite).

- Plan and status of the modernization: [docs/modernization/PLAN.md](docs/modernization/PLAN.md)
- Frontend structure and the A2 design system: [docs/modernization/FRONTEND.md](docs/modernization/FRONTEND.md)
- Running the tests (PHP and end-to-end): [docs/modernization/TESTING.md](docs/modernization/TESTING.md)
- Deploying: [docs/modernization/DEPLOY.md](docs/modernization/DEPLOY.md)

## Local setup

```bash
composer install
npm install
cp .env.example .env && php artisan key:generate
php artisan migrate --seed
npm run dev        # Vite
php artisan serve  # in a second terminal
```
