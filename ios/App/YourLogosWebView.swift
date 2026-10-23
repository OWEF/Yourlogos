import SwiftUI
import WebKit
import UIKit

/// Native WKWebView host: the approved YourLogos web app stays the source of
/// truth for Encounter, Library, My World, accounts, and the existing fonts.
struct YourLogosWebView: UIViewRepresentable {
    @Binding var deepLink: URL?
    private let site = URL(string: "https://yourlogos-web-production.up.railway.app/")!

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        config.userContentController.add(context.coordinator, name: "yourlogosHaptics")
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.055, green: 0.065, blue: 0.078, alpha: 1)
        webView.scrollView.backgroundColor = webView.backgroundColor
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        context.coordinator.webView = webView
        webView.load(URLRequest(url: site, cachePolicy: .useProtocolCachePolicy))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        context.coordinator.parent = self
        context.coordinator.applyDeepLinkIfReady()
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        var parent: YourLogosWebView
        weak var webView: WKWebView?
        private var ready = false
        private var applying = false

        init(_ parent: YourLogosWebView) { self.parent = parent }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            ready = true
            applyDeepLinkIfReady()
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            ready = false
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "yourlogosHaptics" else { return }
            let kind = message.body as? String ?? "selection"
            switch kind {
            case "success": UINotificationFeedbackGenerator().notificationOccurred(.success)
            case "impact": UIImpactFeedbackGenerator(style: .soft).impactOccurred()
            default: UISelectionFeedbackGenerator().selectionChanged()
            }
        }

        func applyDeepLinkIfReady() {
            guard ready, !applying, let webView, let url = parent.deepLink else { return }
            guard url.scheme == "yourlogos" else { return }
            guard url.host == "save",
                  let raw = URLComponents(url: url, resolvingAgainstBaseURL: false)?
                    .queryItems?.first(where: { $0.name == "quote" })?.value,
                  let id = Int(raw), id >= 0, id < 10000 else {
                DispatchQueue.main.async { self.parent.deepLink = nil }
                return
            }
            applying = true
            // A bounded numeric ID is injected, never untrusted text.
            // Save only to the native WebView's own existing guest store.
            // Nothing is uploaded to the user's Supabase account.
            let script = """
                (function() {
                  const key='yourlogos_web_v1';
                  const state=JSON.parse(localStorage.getItem(key)||'{}');
                  if(!Array.isArray(state.saved))state.saved=[];
                  if(!state.saved.includes(\(id)))state.saved.push(\(id));
                  localStorage.setItem(key,JSON.stringify(state));
                  return true;
                })()
                """
            webView.evaluateJavaScript(script) { _, error in
                DispatchQueue.main.async {
                    self.applying = false
                    self.parent.deepLink = nil
                    if error == nil { webView.reload() }
                }
            }
        }
    }
}
