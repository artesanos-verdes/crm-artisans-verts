#!/bin/bash
# Double-clique ce fichier pour RÉCUPÉRER la dernière version (les modifs de Jonathan).
cd "$(dirname "$0")" || exit 1
echo "🔄  Récupération de la dernière version du CRM..."
echo ""
git pull --no-edit origin main && echo "" && echo "✅  Tu as la dernière version !" || echo "" && echo "⚠️  Problème de synchro — préviens Jonathan."
echo ""
read -p "Appuie sur Entrée pour fermer."
