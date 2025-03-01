const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route pour créer un titre foncier
app.post('/creerTitreFoncier', async (req, res) => {
    const { id, proprietaire, description, documentHash } = req.body;

    try {
        // Charger le profil de connexion
        const ccpPath = path.resolve(__dirname, 'connection.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Configurer le wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Vérifier si l'utilisateur est déjà enregistré
        const identity = await wallet.get('user1');
        if (!identity) {
            throw new Error('Identité "user1" introuvable dans le wallet.');
        }

        // Se connecter au réseau Fabric
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'user1',
            discovery: { enabled: true, asLocalhost: true },
        });

        // Accéder au canal et au chaincode
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('titre-foncier');

        // Invoker la transaction
        await contract.submitTransaction('CreerTitreFoncier', id, proprietaire, description, documentHash);
        await gateway.disconnect();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour lister les titres fonciers
app.get('/listerTitresFonciers', async (req, res) => {
    try {
        // Charger le profil de connexion
        const ccpPath = path.resolve(__dirname, 'connection.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Configurer le wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Vérifier si l'utilisateur est déjà enregistré
        const identity = await wallet.get('user1');
        if (!identity) {
            throw new Error('Identité "user1" introuvable dans le wallet.');
        }

        // Se connecter au réseau Fabric
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'user1',
            discovery: { enabled: true, asLocalhost: true },
        });

        // Accéder au canal et au chaincode
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('titre-foncier');

        // Évaluer la transaction pour lister les titres fonciers
        const result = await contract.evaluateTransaction('ListerTitresFonciers');
        const titres = JSON.parse(result.toString());

        await gateway.disconnect();

        res.json(titres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour modifier un titre foncier
app.post('/modifierTitreFoncier', async (req, res) => {
    const { id, proprietaire, description, documentHash } = req.body;

    try {
        // Charger le profil de connexion
        const ccpPath = path.resolve(__dirname, 'connection.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Configurer le wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Vérifier si l'utilisateur est déjà enregistré
        const identity = await wallet.get('user1');
        if (!identity) {
            throw new Error('Identité "user1" introuvable dans le wallet.');
        }

        // Se connecter au réseau Fabric
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'user1',
            discovery: { enabled: true, asLocalhost: true },
        });

        // Accéder au canal et au chaincode
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('titre-foncier');

        // Invoker la transaction de modification
        await contract.submitTransaction('ModifierTitreFoncier', id, proprietaire, description, documentHash);
        await gateway.disconnect();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour récupérer un titre foncier
app.get('/recupererTitreFoncier', async (req, res) => {
    const { id } = req.query;

    try {
        // Charger le profil de connexion
        const ccpPath = path.resolve(__dirname, 'connection.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Configurer le wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Vérifier si l'utilisateur est déjà enregistré
        const identity = await wallet.get('user1');
        if (!identity) {
            throw new Error('Identité "user1" introuvable dans le wallet.');
        }

        // Se connecter au réseau Fabric
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'user1',
            discovery: { enabled: true, asLocalhost: true },
        });

        // Accéder au canal et au chaincode
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('titre-foncier');

        // Évaluer la transaction pour récupérer le titre foncier
        const result = await contract.evaluateTransaction('LireTitreFoncier', id);
        const titre = JSON.parse(result.toString());

        await gateway.disconnect();

        res.json(titre);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});