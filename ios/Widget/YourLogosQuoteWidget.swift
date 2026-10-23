import WidgetKit
import SwiftUI
import Foundation

private struct Quote: Decodable {
    let id: Int
    let text: String
    let author: String
    let theme: String
    let source: String
}
private struct Catalogue: Decodable {
    let quotes: [Quote]
    let order: [Int]
}
private enum DailyQuote {
    static let catalogue: Catalogue = {
        guard let url = Bundle.main.url(forResource: "widget-quotes", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let decoded = try? JSONDecoder().decode(Catalogue.self, from: data) else {
            return Catalogue(quotes: [Quote(id: 0, text: "A thought is an invitation, not a task.", author: "YourLogos", theme: "Curiosity", source: "")], order: [0])
        }
        return decoded
    }()

    static func quote(on date: Date) -> Quote {
        let calendar = Calendar.current
        let parts = calendar.dateComponents([.year, .month, .day], from: date)
        var utcCalendar = Calendar(identifier: .gregorian)
        utcCalendar.timeZone = TimeZone(secondsFromGMT: 0)!
        let epoch = utcCalendar.date(from: DateComponents(year: 2026, month: 1, day: 1))!
        let anchor = utcCalendar.date(from: DateComponents(year: parts.year, month: parts.month, day: parts.day)) ?? epoch
        let days = Int((anchor.timeIntervalSince(epoch) / 86400).rounded(.down))
        let sequence = catalogue.order
        guard !sequence.isEmpty else { return catalogue.quotes[0] }
        let position = ((days % sequence.count) + sequence.count) % sequence.count
        let id = sequence[position]
        return catalogue.quotes.first(where: { $0.id == id }) ?? catalogue.quotes[0]
    }
}

private struct Entry: TimelineEntry {
    let date: Date
    let quote: Quote
}
private struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> Entry {
        Entry(date: Date(), quote: DailyQuote.quote(on: Date()))
    }
    func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) {
        completion(Entry(date: Date(), quote: DailyQuote.quote(on: Date())))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
        let now = Date()
        let midnight = Calendar.current.startOfDay(for: now)
        let nextDay = Calendar.current.date(byAdding: .day, value: 1, to: midnight) ?? now.addingTimeInterval(86400)
        let entry = Entry(date: now, quote: DailyQuote.quote(on: now))
        // WidgetKit decides when the scheduled refresh actually occurs. Exact
        // minute-of-midnight delivery isn't guaranteed.
        completion(Timeline(entries: [entry], policy: .after(nextDay.addingTimeInterval(25))))
    }
}

private struct ThoughtView: View {
    @Environment(\.widgetFamily) private var family
    let entry: Entry

    private var isSmall: Bool { family == .systemSmall }
    private let ivory = Color(red: 0.953, green: 0.925, blue: 0.873)
    private let gold = Color(red: 0.836, green: 0.734, blue: 0.565)

    var body: some View {
        VStack(alignment: .leading, spacing: isSmall ? 6 : 9) {
            HStack(spacing: 4) {
                Text("YOURLOGOS").tracking(1.7)
                Text("✳")
                Spacer()
                Image(systemName: "sparkle")
            }
            .font(.system(size: isSmall ? 8 : 9, weight: .semibold, design: .rounded))
            .foregroundStyle(gold)

            Spacer(minLength: 1)

            Text("“\(entry.quote.text)”")
                .font(.system(size: isSmall ? 17 : 21, weight: .regular, design: .serif))
                .foregroundStyle(ivory)
                .lineSpacing(1.4)
                .lineLimit(isSmall ? 4 : 3)
                .minimumScaleFactor(0.76)

            Text("— \(entry.quote.author)")
                .font(.system(size: 10, weight: .medium, design: .serif))
                .foregroundStyle(Color(red: 0.74, green: 0.70, blue: 0.65))
                .lineLimit(1)

            Spacer(minLength: 1)

            HStack {
                Link(destination: URL(string: "yourlogos://save?quote=\(entry.quote.id)")!) {
                    HStack(spacing: 4) {
                        Image(systemName: "bookmark")
                        Text("Keep")
                    }
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(gold)
                    .padding(.horizontal, 11)
                    .padding(.vertical, 7)
                    .background(gold.opacity(0.13), in: Capsule())
                    .overlay(Capsule().stroke(gold.opacity(0.28), lineWidth: 0.7))
                }
                Spacer()
                if !isSmall {
                    Text("A THOUGHT FOR TODAY")
                        .font(.system(size: 8, weight: .medium))
                        .tracking(1.0)
                        .foregroundStyle(Color.gray)
                }
            }
        }
        .padding(isSmall ? 11 : 16)
        .containerBackground(for: .widget) {
            LinearGradient(colors: [
                Color(red: 0.105, green: 0.117, blue: 0.145),
                Color(red: 0.049, green: 0.061, blue: 0.08)
            ], startPoint: .topLeading, endPoint: .bottomTrailing)
        }
        .widgetURL(URL(string: "yourlogos://open?quote=\(entry.quote.id)")!)
    }
}

private struct YourLogosQuote: Widget {
    let kind = "YourLogosThought"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            ThoughtView(entry: entry)
        }
        .configurationDisplayName("Thought of the Day")
        .description("A philosophical encounter, quietly waiting for you.")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

@main
struct YourLogosWidgetBundle: WidgetBundle {
    var body: some Widget { YourLogosQuote() }
}
