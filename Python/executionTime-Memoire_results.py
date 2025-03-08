import pandas as pd
import matplotlib.pyplot as plt

# Chemin du fichier CSV d'entrée et de sortie
input_file = "../executionTime-Memoire_results.csv"
output_file = "executionTime-Memoire_results_cleaned.csv"

# Lire le fichier CSV ligne par ligne
with open(input_file, "r") as infile, open(output_file, "w") as outfile:
    # Écrire l'en-tête du fichier CSV nettoyé
    outfile.write("Run,Real_Time(s),User_Time(s),Sys_Time(s),Max_Memory(KB)\n")

    # Variables temporaires pour stocker les données
    current_run = None
    current_data = None

    for line in infile:
        line = line.strip()  # Supprimer les espaces et sauts de ligne

        # Si la ligne commence par "1-", c'est une ligne de Run
        if line.startswith("1-"):
            current_run = line.split(",")[0]  # Extraire le Run (par exemple, "1-1")

        # Si la ligne contient des données (temps et mémoire)
        elif "," in line and current_run:
            current_data = line  # Stocker les données
            outfile.write(f"{current_run},{current_data}\n")  # Écrire dans le fichier nettoyé
            current_run = None  # Réinitialiser pour la prochaine exécution

print(f"Fichier nettoyé enregistré sous : {output_file}")

# Charger le fichier nettoyé avec pandas
try:
    df = pd.read_csv(output_file)
    print("Données nettoyées chargées avec succès :")
    print(df)

    # Convertir la mémoire en mégaoctets (MB)
    df["Max_Memory(MB)"] = df["Max_Memory(KB)"] / 1024

    # Tracer un graphique
    plt.figure(figsize=(10, 6))

    # Graphique pour le temps de traitement
    plt.subplot(2, 1, 1)  # 2 lignes, 1 colonne, premier graphique
    plt.bar(df["Run"], df["Real_Time(s)"], color="blue")
    plt.title("Temps de traitement par Run")
    plt.xlabel("Run")
    plt.ylabel("Temps de traitement (s)")

    # Graphique pour la consommation mémoire
    plt.subplot(2, 1, 2)  # 2 lignes, 1 colonne, deuxième graphique
    plt.bar(df["Run"], df["Max_Memory(MB)"], color="green")
    plt.title("Consommation mémoire par Run")
    plt.xlabel("Run")
    plt.ylabel("Consommation mémoire (MB)")

    # Ajuster l'espacement entre les graphiques
    plt.tight_layout()

    # Afficher le graphique
    plt.show()

except Exception as e:
    print(f"Erreur lors de la lecture du fichier CSV nettoyé : {e}")