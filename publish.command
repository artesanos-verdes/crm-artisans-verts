#!/bin/bash
# Double-clique ce fichier pour ENVOYER tes changements (et te synchroniser).
cd "$(dirname "$0")" || exit 1
echo "📤  Envoi de tes changements..."
echo ""
git add -A
git commit -m "Mise à jour depuis $(whoami)" 2>/dev/null || echo "(rien de nouveau à envoyer)"
git pull --no-edit origin main
git push origin main && echo "" && echo "✅  Envoyé et synchronisé !" || echo "" && echo "⚠️  Problème — préviens Jonathan."
echo ""
read -p "Appuie sur Entrée pour fermer."
