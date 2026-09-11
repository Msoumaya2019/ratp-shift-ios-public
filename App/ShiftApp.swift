import SwiftUI
import WebKit

@main struct ShiftApp: App {
 var body: some Scene { WindowGroup { CalendarHost().ignoresSafeArea().preferredColorScheme(.light) } }
}
struct CalendarHost: UIViewControllerRepresentable {
 func makeUIViewController(context: Context) -> CalendarController { CalendarController() }
 func updateUIViewController(_ controller: CalendarController, context: Context) {}
}
final class CalendarController: UIViewController, WKScriptMessageHandler {
 private var web: WKWebView!
 override func viewDidLoad() {
  super.viewDidLoad()
  let config = WKWebViewConfiguration()
  config.userContentController.add(self, name: "selfservice")
  web = WKWebView(frame: .zero, configuration: config)
  web.isOpaque = false
  web.backgroundColor = .systemGroupedBackground
  web.scrollView.isScrollEnabled = false
  view = web
  if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Web") {
   web.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
  }
 }
 func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
  guard message.name == "selfservice", message.frameInfo.isMainFrame, message.frameInfo.request.url?.isFileURL == true else { return }
  let portal = PortalController()
  portal.onImport = { [weak self] object in
   guard let json = try? JSONSerialization.data(withJSONObject: object),
         let text = String(data: json, encoding: .utf8) else { return }
   self?.web.evaluateJavaScript("window.receivePlanning(" + text + ")")
  }
  present(UINavigationController(rootViewController: portal), animated: true)
 }
}
final class PortalController: UIViewController, WKScriptMessageHandler, WKNavigationDelegate {
 var onImport: (([String: Any]) -> Void)?
 private var web: WKWebView!
 private var importing = false
 override func viewDidLoad() {
  super.viewDidLoad()
  title = "Selfservice"
  let config = WKWebViewConfiguration()
  config.websiteDataStore = .default()
  config.userContentController.add(self, name: "planning")
  web = WKWebView(frame: .zero, configuration: config)
  web.navigationDelegate = self
  view = web
  navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Fermer", style: .plain, target: self, action: #selector(close))
  navigationItem.rightBarButtonItem = UIBarButtonItem(title: "Importer", style: .done, target: self, action: #selector(importMonth))
  web.load(URLRequest(url: URL(string: "https://selfservice.ratp.net/Assignments")!))
 }
 @objc private func close() { dismiss(animated: true) }
 @objc private func importMonth() {
  guard !importing else { return }
  guard web.url?.scheme == "https", web.url?.host == "selfservice.ratp.net", web.url?.path == "/Assignments" else {
   showError("Connecte-toi puis ouvre Affectations avant d’importer."); return
  }
  guard let file = Bundle.main.url(forResource: "Importer", withExtension: "js"),
        let script = try? String(contentsOf: file, encoding: .utf8) else {
   showError("Module d’import indisponible."); return
  }
  importing = true
  navigationItem.rightBarButtonItem?.isEnabled = false
  web.isUserInteractionEnabled = false
  title = "Import en cours…"
  web.evaluateJavaScript(script) { [weak self] _, error in
   if let error = error { self?.showError(error.localizedDescription) }
  }
 }
 func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
  guard message.frameInfo.isMainFrame, message.frameInfo.securityOrigin.host == "selfservice.ratp.net",
        message.frameInfo.securityOrigin.protocol == "https",
        let object = message.body as? [String: Any] else { return }
  if let error = object["error"] as? String { showError(error); return }
  guard let days = object["days"] as? [[String: Any]], !days.isEmpty, days.count <= 42 else { showError("Planning non reconnu."); return }
  onImport?(object)
  dismiss(animated: true)
 }
 func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
  guard let url = navigationAction.request.url, url.scheme == "https", let host = url.host,
        host == "selfservice.ratp.net" || host == "synapse.ratp.net" else { decisionHandler(.cancel); return }
  decisionHandler(.allow)
 }
 private func showError(_ text: String) {
  importing = false
  navigationItem.rightBarButtonItem?.isEnabled = true
  web.isUserInteractionEnabled = true
  title = "Selfservice"
  guard presentedViewController == nil else { return }
  let alert = UIAlertController(title: "Import Selfservice", message: text, preferredStyle: .alert)
  alert.addAction(UIAlertAction(title: "OK", style: .default))
  present(alert, animated: true)
 }
}
