const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000

const admin = require("firebase-admin");

const serviceAccount = require("./travel-ease-d61e9-firebase-adminsdk-fbsvc-6eb5a25a25.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


// Middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xksrcg5.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Middleware
const verifyFirebaseToken = async (req, res, next) => {
    const authorization = req.headers.authorization
    if (!authorization) {
        return res.status(401).send({ message: 'Unauthorized access!' })
    }
    const token = authorization.split(' ')[1]
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized access!' })
    }

    // Verify token
    try {
        const decoded = await admin.auth().verifyIdToken(token)
        req.token_email= decoded.email
        next()
    }
    catch {
        return res.status(401).send({message: 'Unauthorized access!'})
    }

}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // -----------------------------
        const db = client.db('travel_ease')
        const carCollection = db.collection('cars')
        const bookingCollection = db.collection('bookings')

        // Get data
        app.get('/cars', async (req, res) => {
            const result = await carCollection.find().toArray()
            res.send(result)
        })

        // Latest Vehicle get
        app.get('/latestVehicle', async (req, res) => {
            const result = await carCollection.find().sort({ createdAt: 'desc' }).limit(6).toArray()

            res.send(result)
        })

        // Particuler car get
        app.get('/viewDetails/:id', verifyFirebaseToken, async (req, res) => {
            const { id } = req.params
            const objectId = new ObjectId(id)
            const result = await carCollection.findOne({ _id: objectId })
            res.send(result)
        })

        // Car booking
        app.post('/bookings',verifyFirebaseToken, async (req, res) => {
            const bookingData = req.body;

            const existingBooking = await bookingCollection.findOne({
                carId: bookingData.carId,
                userEmail: bookingData.userEmail,
                status: { $in: ['pending', 'confirmed'] }
            })

            if (existingBooking) {
                return res.status(400).send({
                    success: false,
                    message: 'You already booked this car.'
                })
            }

            const result = await bookingCollection.insertOne({
                ...bookingData,
                createdAt: new Date().toISOString()
            });
            res.send(result);

        });

        app.get('/bookings',verifyFirebaseToken, async (req, res) => {
            const result = await bookingCollection.find().toArray()
            res.send(result)
        })

        // Get bookings filtered by user email
        app.get('/my-bookings/:email',verifyFirebaseToken, async (req, res) => {
            try {
                const { email } = req.params;

                if (!email) {
                    return res.status(400).send({ error: 'Email is required' });
                }

                const result = await bookingCollection.find({ userEmail: email }).toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching user bookings:', error);
                res.status(500).send({ error: 'Failed to fetch bookings' });
            }
        });

        // My vehicle filter by email
        app.get('/my-vehicle/:email',verifyFirebaseToken, async (req, res) => {
            try {
                const { email } = req.params;

                if (!email) {
                    return res.status(400).send({ error: 'Email is required' });
                }

                const result = await carCollection.find({ userEmail: email }).toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching user vehicles:', error);
                res.status(500).send({ error: 'Failed to fetch vehicles' });
            }
        });

        // Delete vehicle 
        app.delete('/cars/:id',verifyFirebaseToken, async (req, res) => {
            try {
                const { id } = req.params;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).send({ error: 'Invalid vehicle ID' });
                }

                const objectId = new ObjectId(id);
                const result = await carCollection.deleteOne({ _id: objectId });

                if (result.deletedCount === 0) {
                    return res.status(404).send({ error: 'Vehicle not found' });
                }

                res.send({
                    success: true,
                    message: 'Vehicle deleted successfully'
                });
            } catch (error) {
                console.error('Error deleting vehicle:', error);
                res.status(500).send({ error: 'Failed to delete vehicle' });
            }
        });

        // Cancel booking
        app.delete('/bookings/:id',verifyFirebaseToken, async (req, res) => {
            try {
                const { id } = req.params;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).send({ error: 'Invalid booking ID' });
                }

                const objectId = new ObjectId(id);
                const result = await bookingCollection.deleteOne({ _id: objectId });

                if (result.deletedCount === 0) {
                    return res.status(404).send({ error: 'Booking not found' });
                }

                res.send({ success: true, message: 'Booking cancelled successfully' });
            } catch (error) {
                console.error('Error cancelling booking:', error);
                res.status(500).send({ error: 'Failed to cancel booking' });
            }
        });

        // Add vehicle
        app.post('/cars',verifyFirebaseToken, async (req, res) => {
            try {
                const vehicleData = req.body;

                // Validate required fields
                const requiredFields = ['vehicleName', 'owner', 'category', 'pricePerDay', 'location', 'description', 'userEmail'];
                for (const field of requiredFields) {
                    if (!vehicleData[field]) {
                        return res.status(400).send({ error: `Missing required field: ${field}` });
                    }
                }

                const result = await carCollection.insertOne({
                    ...vehicleData,
                    createdAt: new Date().toISOString(),
                    availability: vehicleData.availability || 'Available'
                });

                res.send({
                    success: true,
                    insertedId: result.insertedId,
                    message: 'Vehicle added successfully'
                });
            } catch (error) {
                console.error('Error adding vehicle:', error);
                res.status(500).send({
                    success: false,
                    error: 'Failed to add vehicle'
                });
            }
        });

        // Update vehicle
        // Get
        app.get(`/updateVehicle/:id`,verifyFirebaseToken, async (req, res) => {
            const { id } = req.params
            const objectId = new ObjectId(id)
            const result = await carCollection.findOne({ _id: objectId })
            res.send(result)
        })

        // Put
        app.put('/cars/:id',verifyFirebaseToken, async (req, res) => {
            const { id } = req.params
            const data = req.body
            console.log(id, data)

            const objectId = new ObjectId(id)
            const filter = { _id: objectId }
            const update = {
                $set: data
            }

            const result = await carCollection.updateOne(filter, update)

            res.send({
                success: true,
                result
            })
        })





        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");





    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is running')
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
