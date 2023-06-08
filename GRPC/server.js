const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const admin = require('firebase-admin');

const PORT = process.env.PORT || '3000';

// Inisialisasi Firebase Admin dengan service account key
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Inisialisasi Firestore
const db = admin.firestore();

const server = new grpc.Server();

const songSchema = protoLoader.loadSync('./proto.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const firestoreProto = grpc.loadPackageDefinition(songSchema).firestore;

server.addService(firestoreProto.Firestore.service, {
  CreateSong: (call, callback) => {
    const { id, title, author, year } = call.request;
    const songRef = db.collection('songs').doc(id);
    songRef.set({ id, title, author, year })
      .then(() => callback(null, { id, title, author, year }))
      .catch((error) => callback(error));
  },
  ReadSong: (call, callback) => {
    const { id } = call.request;
    const songRef = db.collection('songs').doc(id);
    songRef.get()
      .then((doc) => {
        if (!doc.exists) {
          throw new Error('Song not found');
        }
        const { id, title, author, year } = doc.data();
        callback(null, { id, title, author, year });
      })
      .catch((error) => callback(error));
  },
  UpdateSong: (call, callback) => {
    const { id, title, author, year } = call.request;
    const songRef = db.collection('songs').doc(id);
    songRef.update({ title, author, year })
      .then(() => callback(null, { id, title, author, year }))
      .catch((error) => callback(error));
  },
  DeleteSong: (call, callback) => {
    const { id } = call.request;
    const songRef = db.collection('songs').doc(id);
    songRef.delete()
      .then(() => callback(null, { id }))
      .catch((error) => callback(error));
  },
  ListSongs: (call) => {
    const stream = db.collection('songs').stream();
    stream.on('data', (doc) => {
      const { id, title, author, year } = doc.data();
      call.write({ id, title, author, year });
    });
    stream.on('end', () => call.end());
    stream.on('error', (error) => call.emit('error', error));
  },
});

server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Server running at http://0.0.0.0:${port}`);
      server.start();
    }
  });
  
