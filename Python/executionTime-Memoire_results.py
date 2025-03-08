import pandas as pd
import matplotlib.pyplot as plt

input_file = "../executionTime-Memoire_results.csv"
output_file = "executionTime-Memoire_results_cleaned.csv"

with open(input_file, "r") as infile, open(output_file, "w") as outfile:
    outfile.write("Run,Real_Time(s),User_Time(s),Sys_Time(s),Max_Memory(KB)\n")

    current_run = None
    current_data = None

    for line in infile:
        line = line.strip()  

        if line.startswith("1-"):
            current_run = line.split(",")[0]  

        elif "," in line and current_run:
            current_data = line  
            outfile.write(f"{current_run},{current_data}\n")  
            current_run = None 

print(f"Fichier nettoyé enregistré sous : {output_file}")

try:
    df = pd.read_csv(output_file)
    print("Données nettoyées chargées avec succès :")
    print(df)

    df["Max_Memory(MB)"] = df["Max_Memory(KB)"] / 1024

    plt.figure(figsize=(10, 6))

    plt.subplot(2, 1, 1)  
    plt.bar(df["Run"], df["Real_Time(s)"], color="blue")
    plt.title("Temps de traitement par Run")
    plt.xlabel("Run")
    plt.ylabel("Temps de traitement (s)")

    plt.subplot(2, 1, 2)  
    plt.bar(df["Run"], df["Max_Memory(MB)"], color="green")
    plt.title("Consommation mémoire par Run")
    plt.xlabel("Run")
    plt.ylabel("Consommation mémoire (MB)")

    plt.tight_layout()

    plt.show()

except Exception as e:
    print(f"Erreur lors de la lecture du fichier CSV nettoyé : {e}")