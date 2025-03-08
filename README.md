# Blockchain
Évaluation du Stockage Off-Chain avec Hyperledger et IPFS dans Hyperledger Fabric

# Titre Foncier - Hyperledger Fabric

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants :

- [Hyperledger Fabric](https://hyperledger-fabric.readthedocs.io/en/latest/install.html)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Node.js & npm](https://nodejs.org/)
- [Go](https://go.dev/dl/)
- [IPFS](https://docs.ipfs.io/install/) (et démarrer le daemon avec `ipfs daemon`)

## Installation

### Organisation des fichiers

Une fois Hyperledger Fabric installé, placez les fichiers comme suit :

```
- fabric-samples/
    - titre-foncier-chaincode/
    - titre-foncier-app/
- test-network/
    - python/
    - executionTime-Memoire.sh
```

### Déploiement du réseau Hyperledger Fabric

1. Accédez au dossier `test-network` :
   ```sh
   cd fabric-samples/test-network
   ```
2. Démarrez le réseau Fabric :
   ```sh
   ./network.sh up
   ```
3. Créez un channel :
   ```sh
   ./network.sh up createChannel
   ```

### Configuration des variables d'environnement

Exécutez les commandes suivantes pour configurer l'environnement :

```sh
source ../titre-foncier-chaincode/scripts/setConfig.sh
source ../titre-foncier-chaincode/scripts/setOrg1Env.sh
source ../titre-foncier-chaincode/scripts/ipfsConfig.sh  # Si IPFS est installé sur Ubuntu
```

### Déploiement du chaincode

```sh
source ../titre-foncier-chaincode/scripts/deploy.sh
```

Tous ces scripts ont été écrits pour automatiser certaines tâches.

## Exécution de l'application

1. Accédez au dossier de l'application :
   ```sh
   cd fabric-samples/titre-foncier-app/
   ```
2. Lancez le serveur Node.js :
   ```sh
   node server.js
   ```
3. Accédez à l'application via : [https://localhost:3443](https://localhost:3443)

## Utilisation de l'application

- Au premier lancement, la liste des titres fonciers sera vide.
- Cliquez sur **Ajouter un titre foncier** pour enregistrer un titre foncier en fournissant un **DocumentHash** valide.
- Vous pourrez ensuite **modifier** ou **supprimer** les titres fonciers.

## Auteur

Projet réalisé dans le cadre d'un travail sur Hyperledger Fabric.




