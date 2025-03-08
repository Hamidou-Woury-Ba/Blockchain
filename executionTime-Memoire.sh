#!/bin/bash

# Nombre de répétitions
N=1

# Fichier de sortie CSV
OUTPUT_FILE="executionTime-Memoire_results.csv"

# Écrire l'en-tête du fichier CSV
echo "Run,Real_Time(s),User_Time(s),Sys_Time(s),Max_Memory(KB)" > $OUTPUT_FILE

echo "Démarrage des tests..."

# Boucle pour exécuter plusieurs tests
for i in $(seq 1 $N)
do
    echo "Exécution $i..."

    # Définir les données uniques pour chaque titre foncier
    TITLES=(
        "ID:10|Nom:Mamadou Koné|Description:Villa à Ziguinchor|DocumentHash:QmTwonFRj5FxVmoCMJCWoFhjkAdh8idHuzPC8acXBdfkYN"
        "ID:11|Nom:Saliou Ndiaye|Description:Maison à Dakar|DocumentHash:QmRpvMRsijuo4jFAF4xUq3TWb1ZLthpcr2SuK966GJ521a"
        "ID:12|Nom:Sokhna Aida|Description:Appartement à Saint-Louis|DocumentHash:QmcVKg8XAexg6uXvVgnM57Z3UdtSgXZkvSgM1RkV9fpugf"
    )

    # Boucle pour créer 3 titres fonciers différents avec des ID, noms, descriptions et hachages uniques
    for j in {0..2}
    do
        # Extraire les informations de chaque titre foncier (ID, Nom, Description, DocumentHash)
        IFS="|" read -r ID Nom Description DocumentHash <<< "${TITLES[$j]}"
        ID=$(echo "$ID" | cut -d':' -f2)
        Nom=$(echo "$Nom" | cut -d':' -f2)
        Description=$(echo "$Description" | cut -d':' -f2)
        DocumentHash=$(echo "$DocumentHash" | cut -d':' -f2)

        # Exécuter la commande et mesurer le temps + mémoire pour chaque titre foncier
        RESULT=$( { /usr/bin/time -f "%e,%U,%S,%M" peer chaincode invoke \
          -o localhost:7050 \
          --ordererTLSHostnameOverride orderer.example.com \
          --tls \
          --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
          -C mychannel \
          -n titre-foncier \
          --peerAddresses localhost:7051 \
          --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
          --peerAddresses localhost:9051 \
          --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
          -c "{\"function\":\"CreerTitreFoncier\",\"Args\":[\"$ID\", \"$Nom\", \"$Description\", \"$DocumentHash\"]}" ; } 2>&1 )

        # Ajouter les résultats au fichier CSV pour chaque titre foncier
        echo "$i-$((j+1)),$RESULT" >> $OUTPUT_FILE

        # Pause de 5 secondes entre les tests (facultatif)
        sleep 5
    done
done

echo "Tests terminés ! Résultats enregistrés dans $OUTPUT_FILE"