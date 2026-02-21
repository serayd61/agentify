import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";

const dailyTips = [
  {
    id: "tip-1",
    title: "Mikro tasarruf",
    body: "Bugün kahveni dışarıda değil evde yap, yılda 450 CHF tasarruf edebilirsin.",
    tag: "Finans",
  },
  {
    id: "tip-2",
    title: "2 dakikalık nefes",
    body: "Derin nefes al, 4 saniye tut, 4 saniye ver. Stressi düşürür.",
    tag: "Wellness",
  },
];

const events = [
  {
    id: "event-1",
    title: "Startup Afterwork @Zürich",
    time: "18:00",
    place: "The Cube",
    description: "Network + free mocktail + guest speaker finansal planlama.",
  },
  {
    id: "event-2",
    title: "Holistic Walk & Chat",
    time: "08:30",
    place: "Rieterpark",
    description: "15 kişi limitli hızlandırılmış yürüyüş + mindfulness sözleri.",
  },
];

const spotlight = {
  title: "Spotlight: Zurich Wellness Club",
  description: "Üyeliğe özel 3 seans ücretsiz. Rezervasyon linki ile %20 indirim.",
  btn: "Rezervasyon",
};

export default function IndexScreen() {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}> 
        <View style={styles.header}>
          <Text style={styles.subTitle}>Pulse Locale</Text>
          <Text style={styles.headline}>Bugün ne kazanmak istersin?</Text>
          <Text style={styles.meta}>Zürich · günün özeti · 08°C</Text>
        </View>

        <Text style={styles.sectionTitle}>Daily Tips</Text>
        {dailyTips.map((tip) => (
          <View key={tip.id} style={styles.card}>
            <View style={styles.tag}><Text style={styles.tagText}>{tip.tag}</Text></View>
            <Text style={styles.cardTitle}>{tip.title}</Text>
            <Text style={styles.cardBody}>{tip.body}</Text>
            <Pressable style={styles.cta} android_ripple={{ color: "#ccc" }}>
              <Text style={styles.ctaText}>Detaylı oku</Text>
            </Pressable>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Bugünkü Etkinlikler</Text>
        {events.map((event) => (
          <View key={event.id} style={[styles.card, styles.eventCard]}>
            <Text style={styles.eventTime}>{event.time} · {event.place}</Text>
            <Text style={styles.cardTitle}>{event.title}</Text>
            <Text style={styles.cardBody}>{event.description}</Text>
            <View style={styles.eventMetaRow}>
              <Pressable style={styles.ctaOutline}>
                <Text style={styles.ctaText}>Spotlight</Text>
              </Pressable>
              <Text style={styles.eventMeta}>Reklam</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Spotlight</Text>
        <View style={[styles.card, styles.spotlightCard]}>
          <Text style={styles.cardTitle}>{spotlight.title}</Text>
          <Text style={styles.cardBody}>{spotlight.description}</Text>
          <Pressable style={styles.ctaFilled}>
            <Text style={styles.ctaText}>{spotlight.btn}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#030712" },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  subTitle: {
    color: "#ffb347",
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 6,
  },
  headline: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  meta: {
    color: "#cdd1e0",
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,179,71,0.18)",
    marginBottom: 8,
  },
  tagText: {
    color: "#ffb347",
    fontSize: 10,
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 6,
  },
  cardBody: {
    color: "#cdd1e0",
    fontSize: 14,
    marginBottom: 10,
  },
  cta: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  ctaOutline: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  ctaFilled: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#ff3b30",
    alignSelf: "flex-start",
  },
  ctaText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  eventCard: {
    borderColor: "rgba(255,255,255,0.12)",
  },
  eventTime: {
    color: "#7bd1ff",
    fontSize: 12,
    marginBottom: 6,
  },
  eventMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  eventMeta: {
    color: "#fff",
    fontSize: 12,
  },
  spotlightCard: {
    borderColor: "rgba(255,59,48,0.4)",
    backgroundColor: "rgba(255,59,48,0.08)",
  },
});
