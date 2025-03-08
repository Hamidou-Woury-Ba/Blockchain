const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const httpsPort = 3443;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),  
    cert: fs.readFileSync(path.join(__dirname, 'server.cert')) 
};

const httpApp = express();
httpApp.use((req, res) => {
    res.redirect(`https://${req.hostname}:${httpsPort}${req.url}`);
});
http.createServer(httpApp).listen(port, () => {
    console.log(`Serveur HTTP en écoute sur http://localhost:${port} et redirige vers HTTPS`);
});

// Route pour créer un titre foncier
app.post('/creerTitreFoncier', async (req, res) => {
    const { id, proprietaire, description, documentHash } = req.body;

    try {
        const ccpPath = path.resolve(__dirname, 'connection.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get('user1');
        if (!identity) {
            throw new Error('Identité "user1" introuvable dans le wallet.');
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'user1',
            discovery: { enabled: true, asLocalhost: true },
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('titre-foncier');

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
        const ccpPath = path.resolve(__dirname, 'connection.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get('user1');
        if (!identity) {
            throw new Error('Identité "user1" introuvable dans le wallet.');
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'user1',
            discovery: { enabled: true, asLocalhost: true },
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('titre-foncier');

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
        const ccpPath = path.resolve(__dirname, 'connection.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get('user1');
        if (!identity) {
            throw new Error('Identité "user1" introuvable dans le wallet.');
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'user1',
            discovery: { enabled: true, asLocalhost: true },
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('titre-foncier');

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
        const ccpPath = path.resolve(__dirname, 'connection.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get('user1');
        if (!identity) {
            throw new Error('Identité "user1" introuvable dans le wallet.');
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'user1',
            discovery: { enabled: true, asLocalhost: true },
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('titre-foncier');

        const result = await contract.evaluateTransaction('LireTitreFoncier', id);
        const titre = JSON.parse(result.toString());

        await gateway.disconnect();

        res.json(titre);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour supprimer un titre foncier
app.post('/supprimerTitreFoncier', async (req, res) => {
    const { id } = req.body;

    console.log('ID reçu :', id); 

    if (!id) {
        console.error('ID du titre foncier manquant');
        return res.status(400).json({ success: false, message: 'ID du titre foncier manquant' });
    }

    try {
        const ccpPath = path.resolve(__dirname, 'connection.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get('user1');
        if (!identity) {
            console.error('Identité "user1" introuvable dans le wallet');
            throw new Error('Identité "user1" introuvable dans le wallet.');
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'user1',
            discovery: { enabled: true, asLocalhost: true },
        });
        console.log('Connexion au réseau Fabric réussie');

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('titre-foncier');

        console.log('Appel de la méthode "SupprimerTitreFoncier" du chaincode');
        await contract.submitTransaction('SupprimerTitreFoncier', id);
        console.log('Titre foncier supprimé avec succès');

        await gateway.disconnect();

        res.json({ success: true, message: `Titre foncier ${id} supprimé avec succès` });
    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
        res.status(500).json({ success: false, message: `Échec de la suppression : ${error.message}` });
    }
});

https.createServer(sslOptions, app).listen(httpsPort, () => {
    console.log(`Serveur HTTPS en écoute sur https://localhost:${httpsPort}`);
});