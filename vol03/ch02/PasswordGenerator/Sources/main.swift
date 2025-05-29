import JavaScriptKit

let document = JSObject.global.document

let generateButton = document.getElementById("generateButton")
_ = generateButton.addEventListener("click", JSClosure { _ in
    let passwordLength = Int(
        document.getElementById("passwordLength").value.string!
    )!
    let generatedPassword = generatePassword(passwordLength)
    document.getElementById("generatedPassword").value =
        generatedPassword.jsValue
    return .undefined
})

func generatePassword(_ length: Int) -> String {
    let alphanumerics =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return String((0..<length).map { _ in alphanumerics.randomElement()! })
}
