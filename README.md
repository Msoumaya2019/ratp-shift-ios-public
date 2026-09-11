# RATP Shift iOS
Application iOS avec import Selfservice par connexion Synapse dans une WKWebView. Le bouton Importer lit le mois affiché, ouvre les détails de service sans activer Réceptionner, et conserve les résultats localement. Tableau est réservé aux futures fiches de travail.

Validation : les sélecteurs et l’extraction des horaires ont été contrôlés sur la page connectée dans le navigateur. La compilation web passe. La connexion WKWebView et le code Swift restent non vérifiés sur iPhone : GitHub Actions refuse de lancer le runner à cause de la facturation/plafond du compte.

Limites : import explicite du mois affiché ; pas encore de synchronisation automatique en arrière-plan. Les données absentes ne sont jamais remplacées par des horaires fictifs. Une nouvelle authentification peut être nécessaire. Aucun identifiant, mot de passe ou planning personnel n’est inclus dans ce dépôt.

Compilation iPhone ARM64 sans signature par GitHub Actions. L’IPA doit être signé avant installation.
