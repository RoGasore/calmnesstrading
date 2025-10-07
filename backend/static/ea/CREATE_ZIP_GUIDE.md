# 📦 Guide de Création du ZIP pour l'EA

## 🎯 Objectif

Créer le fichier `CalmnessFi_EA.zip` qui contient :
- Le script Expert Advisor (`.mq4`)
- Le guide d'installation (PDF ou MD)

## 📁 Fichiers à inclure

```
CalmnessFi_EA.zip
├── CalmnessFi_EA.mq4          (Script EA MetaTrader)
└── README_INSTALLATION.pdf     (Guide d'installation)
```

## 🔧 Étapes

### Option 1 : Création Manuelle

1. **Convertir le README en PDF** (optionnel mais recommandé)
   - Ouvrir `README_INSTALLATION.md` dans un éditeur Markdown
   - Exporter en PDF
   - OU utiliser un convertisseur en ligne : https://www.markdowntopdf.com/

2. **Créer le ZIP**
   - Windows : Sélectionner les fichiers → Clic droit → Envoyer vers → Dossier compressé
   - Mac : Sélectionner les fichiers → Clic droit → Compresser
   - Linux : `zip CalmnessFi_EA.zip CalmnessFi_EA.mq4 README_INSTALLATION.pdf`

3. **Placer le ZIP**
   - Copier `CalmnessFi_EA.zip` dans `backend/static/ea/`
   - Le lien de téléchargement sera : `https://calmnesstrading.onrender.com/static/ea/CalmnessFi_EA.zip`

### Option 2 : Script Python

```python
import zipfile
import os

# Créer le ZIP
with zipfile.ZipFile('CalmnessFi_EA.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipf.write('CalmnessFi_EA.mq4', 'CalmnessFi_EA.mq4')
    zipf.write('README_INSTALLATION.md', 'README_INSTALLATION.md')
    # ou
    # zipf.write('README_INSTALLATION.pdf', 'README_INSTALLATION.pdf')

print("✅ ZIP créé avec succès!")
```

### Option 3 : Commande

**Windows PowerShell** :
```powershell
Compress-Archive -Path CalmnessFi_EA.mq4,README_INSTALLATION.md -DestinationPath CalmnessFi_EA.zip
```

**Linux/Mac** :
```bash
zip CalmnessFi_EA.zip CalmnessFi_EA.mq4 README_INSTALLATION.md
```

## ✅ Vérification

Après création, vérifiez que :
1. Le ZIP fait environ 5-10 KB
2. Il contient bien 2 fichiers
3. Les fichiers s'ouvrent correctement après extraction

## 🚀 Déploiement

### Sur Render (Production)

1. **Commit** le ZIP dans Git :
   ```bash
   git add backend/static/ea/CalmnessFi_EA.zip
   git commit -m "feat: Ajouter ZIP téléchargeable de l'EA"
   git push
   ```

2. **Vérifier** que le fichier est accessible :
   ```
   https://calmnesstrading.onrender.com/static/ea/CalmnessFi_EA.zip
   ```

3. Le bouton de téléchargement dans le dashboard fonctionnera automatiquement !

## 📝 Note

Le fichier README peut être :
- `.md` (Markdown) - Plus léger, lisible dans n'importe quel éditeur
- `.pdf` (PDF) - Plus professionnel, meilleure présentation

**Recommandation** : Fournir les deux formats !

```
CalmnessFi_EA.zip
├── CalmnessFi_EA.mq4
├── README_INSTALLATION.md
└── README_INSTALLATION.pdf
```

---

✅ Une fois le ZIP créé, il sera téléchargeable directement depuis le dashboard !

