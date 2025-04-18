var http = require('http');
const fs = require('fs');

var server = http.createServer((req, res) => {
    console.log("Méthode : " + req.method);
    const url = req.url.split('/');
    let body = '';
    // on récupère le contenu de la requete
    req.on('data', chunk => {
        body += chunk.toString();
    });
    // une fois le contenu récupéré on fait le traitement voulu
    req.on('end', () => {
        // on regarde le chemin de l'url
        switch (url[1]) {
            case 'taches':
                // on regarde la méthode pour le traitement
                switch (req.method) {
                    case 'GET':
                        // utilisation de stream pour la lecture du fichier
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        const stream = fs.createReadStream('./taches.json', 'utf-8');

                        stream.on('data', (chunk) => {
                            res.write(chunk);
                        });
                        stream.on('end', () => {
                            res.end();
                        });
                        stream.on('error', (err) => {
                            console.error('Erreur lors de la lecture du fichier :', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.write(JSON.stringify({ error: 'Erreur interne du serveur' }));
                            res.end();
                        });
                        break;
                    case 'POST':
                        // Ajouter une nouvelle tâche dans le fichier
                        fs.readFile('./taches.json', 'utf-8', (err, data) => {
                            if (err) {
                                console.error('Erreur lors de la lecture du fichier :', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.write(JSON.stringify({ error: 'Erreur interne du serveur' }));
                                res.end();
                                return;
                            }

                            const liste = JSON.parse(data || '[]'); // Charger les tâches existantes
                            const newTask = JSON.parse(body);
                            newTask.id = liste.length ? liste[liste.length - 1].id + 1 : 1; // Générer un nouvel ID
                            liste.push(newTask);

                            fs.writeFile('./taches.json', JSON.stringify(liste, null, 2), (err) => {
                                if (err) {
                                    console.error('Erreur lors de l\'écriture du fichier :', err);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.write(JSON.stringify({ error: 'Erreur interne du serveur' }));
                                    res.end();
                                    return;
                                }

                                res.writeHead(201, { 'Content-Type': 'application/json' });
                                res.write(JSON.stringify(newTask));
                                res.end();
                            });
                        });
                        break;

                    case 'PUT':
                        // Mettre à jour une tâche existante
                        fs.readFile('./taches.json', 'utf-8', (err, data) => {
                            if (err) {
                                console.error('Erreur lors de la lecture du fichier :', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.write(JSON.stringify({ error: 'Erreur interne du serveur' }));
                                res.end();
                                return;
                            }

                            const liste = JSON.parse(data || '[]');
                            const updatedTask = JSON.parse(body);

                            if (!updatedTask.id) {
                                res.writeHead(400, { 'Content-Type': 'application/json' });
                                res.write(JSON.stringify({ error: 'ID invalide' }));
                                res.end();
                                return;
                            }

                            const taskIndex = liste.findIndex(task => task.id === updatedTask.id);
                            if (taskIndex !== -1) {
                                liste[taskIndex] = { ...liste[taskIndex], ...updatedTask };

                                fs.writeFile('./taches.json', JSON.stringify(liste, null, 2), (err) => {
                                    if (err) {
                                        console.error('Erreur lors de l\'écriture du fichier :', err);
                                        res.writeHead(500, { 'Content-Type': 'application/json' });
                                        res.write(JSON.stringify({ error: 'Erreur interne du serveur' }));
                                        res.end();
                                        return;
                                    }

                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.write(JSON.stringify(liste[taskIndex]));
                                    res.end();
                                });
                            } else {
                                res.writeHead(404, { 'Content-Type': 'application/json' });
                                res.write(JSON.stringify({ error: 'Tâche non trouvée' }));
                                res.end();
                            }
                        });
                        break;

                    case 'DELETE':
                        // Supprimer une tâche existante
                        fs.readFile('./taches.json', 'utf-8', (err, data) => {
                            if (err) {
                                console.error('Erreur lors de la lecture du fichier :', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.write(JSON.stringify({ error: 'Erreur interne du serveur' }));
                                res.end();
                                return;
                            }

                            const liste = JSON.parse(data || '[]');
                            const deleteTask = JSON.parse(body);

                            if (!deleteTask.id) {
                                res.writeHead(400, { 'Content-Type': 'application/json' });
                                res.write(JSON.stringify({ error: 'ID invalide' }));
                                res.end();
                                return;
                            }

                            const taskIndex = liste.findIndex(task => task.id === deleteTask.id);
                            if (taskIndex !== -1) {
                                const deletedTask = liste.splice(taskIndex, 1);

                                fs.writeFile('./taches.json', JSON.stringify(liste, null, 2), (err) => {
                                    if (err) {
                                        console.error('Erreur lors de l\'écriture du fichier :', err);
                                        res.writeHead(500, { 'Content-Type': 'application/json' });
                                        res.write(JSON.stringify({ error: 'Erreur interne du serveur' }));
                                        res.end();
                                        return;
                                    }

                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.write(JSON.stringify(deletedTask[0]));
                                    res.end();
                                });
                            } else {
                                res.writeHead(404, { 'Content-Type': 'application/json' });
                                res.write(JSON.stringify({ error: 'Tâche non trouvée' }));
                                res.end();
                            }
                        });
                        break;
                    default:
                        break;
                }
                break;
            default:
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ error: 'Route non trouvée' }));
                res.end();
                break;
        }
    });

});

server.listen(3000, function () {
    console.log('Le serveur est en marche sur http://localhost:3000/');
});