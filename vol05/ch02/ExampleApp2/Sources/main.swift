import JavaScriptKit

@JSClass struct Document {
    @JSFunction func getElementById(_ id: String) throws(JSException)
        -> HTMLElement
    @JSFunction func createElement(_ tagName: String) throws(JSException)
        -> HTMLElement
}
@JSGetter(from: .global) nonisolated(unsafe) var document: Document

@JSClass struct HTMLElement {
    @JSSetter func setInnerText(_ newValue: String) throws(JSException)
    @JSFunction func appendChild(_ child: HTMLElement) throws(JSException)
}

@JS func run() throws(JSException) {
    let app = try document.getElementById("app")
    let ul = try document.createElement("ul")
    for i in 1...15 {
        let li = try document.createElement("li")
        if i % 15 == 0 {
            try li.setInnerText("FizzBuzz")
        } else if i % 3 == 0 {
            try li.setInnerText("Fizz")
        } else if i % 5 == 0 {
            try li.setInnerText("Buzz")
        } else {
            try li.setInnerText(String(i))
        }
        try ul.appendChild(li)
    }
    try app.appendChild(ul)
}
