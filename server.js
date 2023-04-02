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

const bookSchema = protoLoader.loadSync('./proto.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const firestoreProto = grpc.loadPackageDefinition(bookSchema).firestore;

server.addService(firestoreProto.Firestore.service, {
  CreateBook: (call, callback) => {
    const { id, title, author, year } = call.request;
    const bookRef = db.collection('books').doc(id);
    bookRef.set({ id, title, author, year })
      .then(() => callback(null, { id, title, author, year }))
      .catch((error) => callback(error));
  },
  ReadBook: (call, callback) => {
    const { id } = call.request;
    const bookRef = db.collection('books').doc(id);
    bookRef.get()
      .then((doc) => {
        if (!doc.exists) {
          throw new Error('Book not found');
        }
        const { id, title, author, year } = doc.data();
        callback(null, { id, title, author, year });
      })
      .catch((error) => callback(error));
  },
  UpdateBook: (call, callback) => {
    const { id, title, author, year } = call.request;
    const bookRef = db.collection('books').doc(id);
    bookRef.update({ title, author, year })
      .then(() => callback(null, { id, title, author, year }))
      .catch((error) => callback(error));
  },
  DeleteBook: (call, callback) => {
    const { id } = call.request;
    const bookRef = db.collection('books').doc(id);
    bookRef.delete()
      .then(() => callback(null, { id }))
      .catch((error) => callback(error));
  },
  ListBooks: (call) => {
    const stream = db.collection('books').stream();
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
  
