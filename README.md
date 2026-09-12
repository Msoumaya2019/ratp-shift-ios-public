# RATP Shift iOS
Application iOS avec import Selfservice par connexion Synapse dans une WKWebView. Le bouton Importer lit le mois affiché, ouvre les détails de service sans activer Réceptionner, et conserve les résultats localement. Tableau est réservé aux futures fiches de travail.

Validation : les sélecteurs, l’endpoint interne et l’extraction des horaires ont été contrôlés sur la page connectée dans le navigateur. La compilation iPhone ARM64 sans signature passe sur GitHub Actions. La connexion Synapse dans WKWebView reste à vérifier sur un iPhone réel.

L’import lit immédiatement le résumé du mois affiché puis récupère les détails par l’endpoint interne en quatre requêtes authentifiées simultanées. Il ne simule plus un clic sur chaque journée.

Limites : import explicite du mois affiché ; pas encore de synchronisation automatique en arrière-plan. Les données absentes ne sont jamais remplacées par des horaires fictifs. Une nouvelle authentification peut être nécessaire. Aucun identifiant, mot de passe ou planning personnel n’est inclus dans ce dépôt.

Compilation iPhone ARM64 sans signature par GitHub Actions. L’IPA doit être signé avant installation.
