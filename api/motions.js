const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const db = require('../index');
const geolib = require('geolib');

const app = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/create', (req, res) => {
    res.contentType('application/json');
    if (!req.body.latitude) res.json({ error: 400 });
    if (!req.body.longitude) res.json({ error: 400 });
    if (!req.body.time) res.json({ error: 400 });
    if (!req.body.vehicleId) {
        res.json({ error: 400 })
    }
    else {
        db.vehicles.findByPk(req.body.vehicleId)
            .then((vehicle) => {
                if (!vehicle) {
                    res.json({ error: 400 });
                }
                else {
                    db.motions.create
                        (
                        {
                            latitude: req.body.latitude,
                            longitude: req.body.longitude,
                            time: req.body.time,
                            vehicleId: req.body.vehicleId
                        }
                        ).then((motion) => res.json(motion));
                }
            })
    }
});

app.post('/milage', (req, res) => {
    res.contentType('application/json');
    db.motions.findAll({ where: { vehicleId: req.body.id } })
        .then(motions => {
            let milage = 0;
            if (!motions.length) {
                res.json({ error: 400 });
            }

            for (let iter = 1; iter < motions.length; iter++) {
                console.log(motions[iter].latLng);
                milage += geolib.getDistance
                    (
                    motions[iter].latLng,
                    motions[iter - 1].latLng
                    );
            }
            res.json({ motion: milage });
        })

});

module.exports = app;