const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const PORT = process.env.PORT || "3000";

const songSchema = protoLoader.loadSync("./proto.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const firestoreProto = grpc.loadPackageDefinition(songSchema).firestore;

const client = new firestoreProto.Firestore(
  `localhost:${PORT}`,
  grpc.credentials.createInsecure()
);

function createSong() {
  readline.question("Enter song id: ", (id) => {
    readline.question("Enter song title: ", (title) => {
      readline.question("Enter song author: ", (author) => {
        readline.question("Enter song year: ", (year) => {
          client.CreateSong({ id, title, author, year }, (error, response) => {
            if (error) {
              console.error(error);
            } else {
              console.log(response);
            }
            readline.close();
          });
        });
      });
    });
  });
}

function readSong(id) {
  client.ReadSong({ id }, (error, response) => {
    if (error) {
      console.error(error);
    } else {
      console.log(response);
    }
    readline.close();
  });
}

function updateSong(id, title, author, year) {
  client.UpdateSong({ id, title, author, year }, (error, response) => {
    if (error) {
      console.error(error);
    } else {
      console.log(response);
    }
    readline.close();
  });
}

function deleteSong(id) {
  client.DeleteSong({ id }, (error, response) => {
    if (error) {
      console.error(error);
    } else {
      console.log(response);
    }
    readline.close();
  });
}

function listSongs() {
  const call = client.ListSongs({});
  call.on("data", (song) => {
    console.log(song);
  });
  call.on("end", () => {
    readline.close();
  });
  call.on("error", (error) => {
    console.error(error);
    readline.close();
  });
}

function mainMenu() {
  console.log("Halo Apa kabar!");
  console.log("Hari ini mau ngapain?");
  console.log("1. Create Song");
  console.log("2. Read Song");
  console.log("3. Update Song");
  console.log("4. Delete Song");
  console.log("5. List Songs");
  console.log("6. Exit");

  readline.question("Choose an option: ", (option) => {
    switch (option) {
      case "1":
        createSong();
        break;
      case "2":
        readline.question("Enter song id: ", (id) => {
          readSong(id);
        });
        break;
      case "3":
        readline.question("Enter song id: ", (id) => {
          readline.question("Enter song title: ", (title) => {
            readline.question("Enter song author: ", (author) => {
              readline.question("Enter song year: ", (year) => {
                updateSong(id, title, author, year);
              });
            });
          });
        });
        break;
      case "4":
        readline.question("Enter song id: ", (id) => {
          deleteSong(id);
        });
        break;
      case "5":
        listSongs();
        break;
      case "6":
        console.log("Exiting...");
        process.exit(0);
      default:
        console.log("Invalid option. Please try again.");
        mainMenu();
        break;
    }
  });
}

mainMenu();
