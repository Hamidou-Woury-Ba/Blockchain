document.getElementById('titreForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('id').value;
    const proprietaire = document.getElementById('proprietaire').value;
    const description = document.getElementById('description').value;
    const documentHash = document.getElementById('documentHash').value;

    const responseMessage = document.getElementById('responseMessage');

    try {
        const response = await fetch('/creerTitreFoncier', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, proprietaire, description, documentHash }),
        });

        const result = await response.json();
        if (response.ok) {
            responseMessage.textContent = 'Titre foncier créé avec succès !';
            responseMessage.style.color = 'green';
        } else {
            responseMessage.textContent = `Erreur : ${result.error}`;
            responseMessage.style.color = 'red';
        }
    } catch (error) {
        responseMessage.textContent = `Erreur : ${error.message}`;
        responseMessage.style.color = 'red';
    }
});