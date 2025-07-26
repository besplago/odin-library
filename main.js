const myLibrary = []

class Book {
  constructor (title, author, pages, read) {
    this.id = crypto.randomUUID()
    this.title = title
    this.author = author
    this.pages = pages
    this.read = read
  }
}

function addBookToLibrary (title, author, pages, read) {
  const newBook = new Book(title, author, pages, read)
  myLibrary.push(newBook)
}

addBookToLibrary('Three Body Problem', 'Cixin Liu', 290, true)
addBookToLibrary('Dune', 'Frank Herbert', 412, true)
addBookToLibrary('The Hobbit', 'J.R.R. Tolkien', 310, false)
addBookToLibrary('Project Hail Mary', 'Andy Weir', 476, true)
addBookToLibrary('The Left Hand of Darkness', 'Ursula K. Le Guin', 304, true)
addBookToLibrary('Neuromancer', 'William Gibson', 271, false)
