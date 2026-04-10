// swift-tools-version: 6.1

import PackageDescription

let package = Package(
    name: "ExampleApp1",
    dependencies: [
        .package(
            url: "https://github.com/swiftwasm/JavaScriptKit",
            branch: "main"
        )
    ],
    targets: [
        .executableTarget(
            name: "ExampleApp1",
            dependencies: ["JavaScriptKit"],
            swiftSettings: [
                .enableExperimentalFeature("Extern")
            ],
            plugins: [
                .plugin(name: "BridgeJS", package: "JavaScriptKit")
            ]
        )
    ]
)
