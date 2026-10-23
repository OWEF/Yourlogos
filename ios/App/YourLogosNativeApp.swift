import SwiftUI

@main
struct YourLogosNativeApp: App {
    @State private var deepLink: URL?

    var body: some Scene {
        WindowGroup {
            YourLogosWebView(deepLink: $deepLink)
                .ignoresSafeArea()
                .preferredColorScheme(.dark)
                .onOpenURL { url in
                    guard url.scheme?.lowercased() == "yourlogos" else { return }
                    deepLink = url
                }
        }
    }
}
