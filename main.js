class Book {
  constructor(title, author, pages, read) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
  }
}

class Observable {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(...args));
    }
  }
}

class Library extends Observable {
  constructor(books) {
    super();
    this.books = books;
  }

  addBook(book) {
    this.books.push(book);
    this.emit("libraryUpdated");
  }

  removeBook(bookId) {
    const index = books.findIndex((book) => book.id === bookId);
    if (index !== -1) {
      this.books.splice(index, 1);
    }
    this.emit("libraryUpdated");
  }

  updateReadStatus(bookId, readStatus) {
    const book = this.books.find((book) => book.id === bookId);
    if (book) {
      book.read = readStatus;
    }
    this.emit("libraryUpdated");
  }
}

class Renderer {
  constructor(library) {
    this.library = library;
  }

  createBookCard(book) {
    const card = document.createElement("div");
    card.className = "card";

    card.dataset.id = book.id;

    const topRow = document.createElement("div");
    topRow.className = "card-top-row";

    const textContainer = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = book.title.toUpperCase();
    const author = document.createElement("p");
    author.textContent = book.author;

    textContainer.appendChild(title);
    textContainer.appendChild(author);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("icon", "x-icon", "remove-card-icon");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("role", "button");
    svg.setAttribute("aria-label", "Remove book");
    svg.setAttribute("tabindex", "0");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M5.1716 8.00003L1.08582 3.91424L3.91424 1.08582L8.00003 5.1716L12.0858 1.08582L14.9142 3.91424L10.8285 8.00003L14.9142 12.0858L12.0858 14.9142L8.00003 10.8285L3.91424 14.9142L1.08582 12.0858L5.1716 8.00003Z"
    );

    svg.appendChild(path);

    svg.addEventListener("click", () => {
      const removeEvent = new CustomEvent("removeBook", {
        bubbles: true,
        detail: { bookId: book.id },
      });
      card.dispatchEvent(removeEvent);
    });

    topRow.appendChild(textContainer);
    topRow.appendChild(svg);

    const bookStats = document.createElement("div");
    bookStats.className = "book-stats";

    const pages = document.createElement("span");
    pages.textContent = `${book.pages} PAGES`;

    const readStatus = document.createElement("div");
    readStatus.className = "read-status";

    const label = document.createElement("label");
    label.htmlFor = `read-status-${book.id}`;
    const labelText = document.createElement("span");
    labelText.textContent = "READ";
    label.appendChild(labelText);

    const checkbox = document.createElement("input");
    checkbox.id = `read-status-${book.id}`;
    checkbox.type = "checkbox";
    checkbox.name = "read-status";
    checkbox.checked = book.read;
    checkbox.addEventListener("change", () => {
      const removeEvent = new CustomEvent("updateReadStatus", {
        bubbles: true,
        detail: { bookId: book.id, read: book.read },
      });
      card.dispatchEvent(removeEvent);
    });

    readStatus.appendChild(label);
    readStatus.appendChild(checkbox);

    bookStats.appendChild(pages);
    bookStats.appendChild(readStatus);

    card.appendChild(topRow);
    card.appendChild(bookStats);

    return card;
  }

  displayBooks() {
    const cardGrid = document.getElementById("card-grid");
    this.library.books.forEach((book) => {
      cardGrid.appendChild(this.createBookCard(book));
    });
  }
}

// Not the best solution to stats updating, would prefer to be event based
function updateStats() {
  const totalBooks = myLibrary.length;
  const booksRead = myLibrary.filter((book) => book.read).length;
  const totalPages = myLibrary.reduce((sum, book) => sum + book.pages, 0);
  const pagesRead = myLibrary.reduce((sum, book) => {
    return book.read ? sum + book.pages : sum;
  }, 0);

  document.getElementById("books-read").textContent = booksRead;
  document.getElementById("total-books").textContent = totalBooks;
  document.getElementById("pages-read").textContent = pagesRead;
  document.getElementById("total-pages").textContent = totalPages;
}

function setupEventListeners(library) {
  // Dialog
  const dialog = document.querySelector("dialog");
  const newBookButton = document.getElementById("new-book");
  const closeDialogButton = document.querySelector("#modal-top-row button");
  const confirmBtn = dialog.querySelector("#confirm-button");

  newBookButton.addEventListener("click", () => {
    dialog.showModal();
  });

  closeDialogButton.addEventListener("click", () => {
    dialog.returnValue = "cancel";
    dialog.close();
  });

  confirmBtn.addEventListener("click", (e) => {
    const form = dialog.querySelector("form");

    if (!form.checkValidity()) {
      return;
    }

    e.preventDefault();

    const titleInput = dialog.querySelector("#book-title");
    const authorInput = dialog.querySelector("#book-author");
    const pagesInput = dialog.querySelector("#book-pages");
    const readInput = dialog.querySelector("#book-read");

    addBookToLibrary(
      library,
      titleInput.value,
      authorInput.value,
      parseInt(pagesInput.value),
      readInput.checked
    );

    const cardGrid = document.getElementById("card-grid");
    const newBook = library[library.length - 1];
    cardGrid.appendChild(createBookCard(newBook));

    updateStats();
    form.reset();
    dialog.close("confirmed");
  });

  // Cards
  const cardGrid = document.getElementById("card-grid");

  cardGrid.addEventListener("removeBook", (e) => {
    const bookId = e.detail.bookId;
    removeBookFromLibrary(library, bookId);

    const card = document.querySelector(`.card[data-id="${bookId}"]`);
    if (card) card.remove();
    updateStats();
  });

  cardGrid.addEventListener("updateReadStatus", (e) => {
    const bookId = e.detail.bookId;
    const read = e.detail.read;
    const newReadStatus = !read;
    updateReadStatus(library, bookId, newReadStatus);
    updateStats();
  });
}

const myLibrary = new Library([]);
const renderer = new Renderer(myLibrary);
myLibrary.on("libraryUpdated", () => {
  renderer.displayBooks();
});

myLibrary.addBook(
  new Book("Vertical Leap for Dummies", "Dr. Air Jordan", 290, true)
);
myLibrary.addBook(
  new Book(
    "Crying in My Championship Champagne",
    'Michael "Air Soreness" Jordan',
    412,
    false
  )
);
myLibrary.addBook(
  new Book("I Promise School Lunch Recipes", "Chef LeBron", 310, true)
);
myLibrary.addBook(
  new Book(
    "Space Jam 3: Revenge of the Monstars",
    "Warner Bros. Ghostwriter",
    476,
    true
  )
);
myLibrary.addBook(
  new Book(
    "How to Dunk on Feelings: Emotional Alley-Oops",
    "Dr. Phil Jackson",
    304,
    false
  )
);
myLibrary.addBook(
  new Book("The Taco Tuesday Manifesto", 'Taco "Tuesday" James', 271, true)
);
myLibrary.addBook(
  new Book("Hairline Management for Champions", "Dr. Transplant", 255, true)
);
myLibrary.addBook(
  new Book("The GOAT Debate: Why Bron > MJ", "King James Press", 311, true)
);

setupEventListeners(myLibrary);
updateStats();
