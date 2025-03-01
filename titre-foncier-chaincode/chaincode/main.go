package main

import (
	"encoding/json"
	"fmt"
	"time"
	"bytes"
    "io/ioutil"
    "net/http"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	ipfs "github.com/ipfs/go-ipfs-api"
)

// TitreFoncier représente la structure du titre foncier
type TitreFoncier struct {
    ID          string `json:"id"`
    Proprietaire string `json:"proprietaire"`
    Description string `json:"description"`
    DocumentHash string `json:"documentHash"`
}


// SmartContract fournit les fonctions pour le chaincode
type SmartContract struct {
	contractapi.Contract
}

// InitLedger initialise le ledger avec des titres fonciers de démonstration
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	titres := []TitreFoncier{
		{ID: "1", Proprietaire: "Alice", Description: "Maison à Paris", DocumentHash: ""},
		{ID: "2", Proprietaire: "Bob", Description: "Appartement à Lyon", DocumentHash: ""},
	}

	for _, titre := range titres {
		titreJSON, err := json.Marshal(titre)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(titre.ID, titreJSON)
		if err != nil {
			return fmt.Errorf("échec de la mise à jour du ledger. %v", err)
		}
	}

	return nil
}


func (s *SmartContract) ListerTitresFonciers(ctx contractapi.TransactionContextInterface) ([]*TitreFoncier, error) {
    // Définir la plage de clés pour récupérer tous les titres fonciers
    startKey := ""
    endKey := ""

    // Récupérer tous les enregistrements dans la plage de clés
    resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)
    if err != nil {
        return nil, fmt.Errorf("erreur lors de la récupération des titres fonciers: %v", err)
    }
    defer resultsIterator.Close()

    var titres []*TitreFoncier
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return nil, fmt.Errorf("erreur lors de la lecture d'un titre foncier: %v", err)
        }

        // Désérialiser le titre foncier
        var titre TitreFoncier
        err = json.Unmarshal(queryResponse.Value, &titre)
        if err != nil {
            return nil, fmt.Errorf("erreur lors de la désérialisation du titre foncier: %v", err)
        }

        // Ajouter le titre foncier à la liste
        titres = append(titres, &titre)
    }

    return titres, nil
}


// LireTitreFoncier retourne le titre foncier stocké dans le ledger avec l'ID donné
func (s *SmartContract) LireTitreFoncier(ctx contractapi.TransactionContextInterface, id string) (*TitreFoncier, error) {
    titreJSON, err := ctx.GetStub().GetState(id)
    if err != nil {
        return nil, fmt.Errorf("Échec de la lecture du titre foncier: %v", err)
    }
    if titreJSON == nil {
        return nil, fmt.Errorf("Le titre foncier %s n'existe pas", id)
    }

    var titre TitreFoncier
    err = json.Unmarshal(titreJSON, &titre)
    if err != nil {
        return nil, err
    }

    // S'assurer que DocumentHash est bien défini
    if titre.DocumentHash == "" {
        titre.DocumentHash = ""
    }

    return &titre, nil
}


func (s *SmartContract) CreerTitreFoncier(ctx contractapi.TransactionContextInterface, id string, proprietaire string, description string, documentHash string) error {
    // Vérifie si le document existe sur IPFS
    exists, err := VerifyDocumentOnIPFS(documentHash)
    if err != nil {
        return fmt.Errorf("erreur lors de la vérification du document sur IPFS: %v", err)
    }
    if exists == "" {
        return fmt.Errorf("le document avec le hash %s n'existe pas sur IPFS", documentHash)
    }

    // Vérifie si le titre foncier existe déjà
    alreadyExists, err := s.TitreFoncierExists(ctx, id)
    if err != nil {
        return err
    }
    if alreadyExists {
        return fmt.Errorf("le titre foncier %s existe déjà", id)
    }

    // Création du titre foncier
    titre := TitreFoncier{
        ID:           id,
        Proprietaire: proprietaire,
        Description:  description,
        DocumentHash: documentHash,
    }
    
    // Enregistrement dans le ledger
    titreJSON, err := json.Marshal(titre)
    if err != nil {
        return err
    }
    return ctx.GetStub().PutState(id, titreJSON)
}


func (s *SmartContract) ModifierTitreFoncier(ctx contractapi.TransactionContextInterface, id string, nouveauProprietaire string, nouvelleDescription string, nouvelleDocumentHash string) error {
    // Vérifie si le titre foncier existe
    exists, err := s.TitreFoncierExists(ctx, id)
    if err != nil {
        return err
    }
    if !exists {
        return fmt.Errorf("le titre foncier %s n'existe pas", id)
    }

    // Récupère le titre foncier actuel
    titreJSON, err := ctx.GetStub().GetState(id)
    if err != nil {
        return fmt.Errorf("échec de la lecture du titre foncier: %v", err)
    }

    var titre TitreFoncier
    err = json.Unmarshal(titreJSON, &titre)
    if err != nil {
        return err
    }

    // Vérifie si le nouveau DocumentHash existe sur IPFS avant de le mettre à jour
    if nouvelleDocumentHash != "" {
        hashExists, err := VerifyDocumentOnIPFS(nouvelleDocumentHash)
        if err != nil {
            return fmt.Errorf("erreur lors de la vérification du document sur IPFS: %v", err)
        }
        if hashExists == "" {
            return fmt.Errorf("le document avec le hash %s n'existe pas sur IPFS", nouvelleDocumentHash)
        }
        titre.DocumentHash = nouvelleDocumentHash
    }

    // Met à jour les autres champs
    titre.Proprietaire = nouveauProprietaire
    titre.Description = nouvelleDescription

    // Enregistre les modifications dans le ledger
    titreJSON, err = json.Marshal(titre)
    if err != nil {
        return err
    }

    return ctx.GetStub().PutState(id, titreJSON)
}

// VerifyDocumentOnIPFS vérifie si un document existe sur IPFS
func VerifyDocumentOnIPFS(cid string) (string, error) {
	url := fmt.Sprintf("http://host.docker.internal:5001/api/v0/cat?arg=%s", cid) 
	
	req, err := http.NewRequest("POST", url, nil) // IPFS nécessite un POST
	if err != nil {
		return "", err
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("erreur IPFS: %s", resp.Status)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}


// TransfererTitreFoncier transfère un titre foncier à un nouveau propriétaire
func (s *SmartContract) TransfererTitreFoncier(ctx contractapi.TransactionContextInterface, id string, nouveauProprietaire string) error {
	titre, err := s.LireTitreFoncier(ctx, id)
	if err != nil {
		return err
	}

	titre.Proprietaire = nouveauProprietaire
	titreJSON, err := json.Marshal(titre)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, titreJSON)
}


// TitreFoncierExists retourne true si le titre foncier avec l'ID donné existe dans le ledger
func (s *SmartContract) TitreFoncierExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	titreJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("échec de la lecture du titre foncier. %v", err)
	}

	return titreJSON != nil, nil
}



func (s *SmartContract) GetHistoryForTitreFoncier(ctx contractapi.TransactionContextInterface, id string) ([]HistoryEntry, error) {
    resultsIterator, err := ctx.GetStub().GetHistoryForKey(id)
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()

    var history []HistoryEntry
    for resultsIterator.HasNext() {
        response, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }

        var titre TitreFoncier
        if len(response.Value) > 0 {
            err = json.Unmarshal(response.Value, &titre)
            if err != nil {
                return nil, err
            }
        }

        // Convert the timestamp to a string
        timestamp := response.Timestamp.AsTime().Format(time.RFC3339)

        history = append(history, HistoryEntry{
            TxId:      response.TxId,
            Timestamp: timestamp,
            IsDelete:  response.IsDelete,
            Value:     titre,
        })
    }

    return history, nil
}

type HistoryEntry struct {
    TxId      string      `json:"txId"`
    Timestamp string      `json:"timestamp"`
    IsDelete  bool        `json:"isDelete"`
    Value     TitreFoncier `json:"value"`
}


// UploadDocumentToIPFS upload un document sur IPFS et retourne le hash
func UploadDocumentToIPFS(document []byte) (string, error) {
    sh := ipfs.NewShell("localhost:5001") // Connectez-vous au nœud IPFS local
    cid, err := sh.Add(bytes.NewReader(document)) // Convertir []byte en io.Reader
    if err != nil {
        return "", fmt.Errorf("échec de l'upload du document sur IPFS: %v", err)
    }
    return cid, nil
}



func main() {
	chaincode, err := contractapi.NewChaincode(new(SmartContract))
	if err != nil {
		fmt.Printf("Erreur lors de la création du chaincode: %v\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Erreur lors du démarrage du chaincode: %v\n", err)
	}
}
