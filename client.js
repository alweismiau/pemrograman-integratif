const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const PORT = process.env.PORT || "3000";

const bookSchema = protoLoader.loadSync("./proto.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const firestoreProto = grpc.loadPackageDefinition(bookSchema).firestore;

const client = new firestoreProto.Firestore(
  `localhost:${PORT}`,
  grpc.credentials.createInsecure()
);

function createBook() {
  readline.question("Enter book id: ", (id) => {
    readline.question("Enter book title: ", (title) => {
      readline.question("Enter book author: ", (author) => {
        readline.question("Enter book year: ", (year) => {
          client.CreateBook({ id, title, author, year }, (error, response) => {
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

function readBook(id) {
  client.ReadBook({ id }, (error, response) => {
    if (error) {
      console.error(error);
    } else {
      console.log(response);
    }
    readline.close();
  });
}

function updateBook(id, title, author, year) {
  client.UpdateBook({ id, title, author, year }, (error, response) => {
    if (error) {
      console.error(error);
    } else {
      console.log(response);
    }
    readline.close();
  });
}

function deleteBook(id) {
  client.DeleteBook({ id }, (error, response) => {
    if (error) {
      console.error(error);
    } else {
      console.log(response);
    }
    readline.close();
  });
}

function listBooks() {
  const call = client.ListBooks({});
  call.on("data", (book) => {
    console.log(book);
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
  console.log("==== Books App ====");
  console.log("1. Create Book");
  console.log("2. Read Book");
  console.log("3. Update Book");
  console.log("4. Delete Book");
  console.log("5. List Books");
  console.log("6. Exit");

  readline.question("Choose an option: ", (option) => {
    switch (option) {
      case "1":
        createBook();
        break;
      case "2":
        readline.question("Enter book id: ", (id) => {
          readBook(id);
        });
        break;
      case "3":
        readline.question("Enter book id: ", (id) => {
          readline.question("Enter book title: ", (title) => {
            readline.question("Enter book author: ", (author) => {
              readline.question("Enter book year: ", (year) => {
                updateBook(id, title, author, year);
              });
            });
          });
        });
        break;
      case "4":
        readline.question("Enter book id: ", (id) => {
          deleteBook(id);
        });
        break;
      case "5":
        listBooks();
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
