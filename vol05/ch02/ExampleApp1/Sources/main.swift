import JavaScriptKit

@JS public func greet(name: String) -> String {
    "Hello, \(name)!"
}

@JS class Bookshelf {
    private var books: [(title: String, author: String)] = []

    @JS init() {}

    @JS public func addBook(title: String, author: String) {
        books.append((title, author))
    }

    @JS public func getTitles() -> [String] {
        books.map { $0.title }
    }

    @JS public func getAuthors() -> [String] {
        books.map { $0.author }
    }

    @JS public func getCount() -> Int {
        books.count
    }
}
