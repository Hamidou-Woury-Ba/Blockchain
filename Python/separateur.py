import pandas as pd

# Charger le fichier CSV avec l'ancien séparateur (ex : point-virgule)
df = pd.read_csv('../executionTime-Memoire_results.csv', sep=';')  # Remplacez ';' par le séparateur actuel de votre fichier

# Sauvegarder le fichier CSV avec une virgule comme séparateur
df.to_csv('executionTime-Memoire_results_format.csv', index=False)  # Le fichier sera sauvegardé avec une virgule comme séparateur
