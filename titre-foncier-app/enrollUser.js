const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function enrollUser() {
    try {
        // Charger le profil de connexion
        const ccpPath = path.resolve(__dirname, 'connection.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Configurer le wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Vérifier si l'utilisateur est déjà enregistré
        const userIdentity = await wallet.get('user1');
        if (userIdentity) {
            console.log('Identité "user1" déjà enregistrée dans le wallet.');
            return;
        }

        // Se connecter à l'autorité de certification (CA)
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Enregistrer un nouvel utilisateur
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('user1', x509Identity);
        console.log('Identité "user1" enregistrée avec succès dans le wallet.');
    } catch (error) {
        console.error(`Erreur lors de l'enregistrement de l'utilisateur : ${error}`);
        process.exit(1);
    }
}

enrollUser();