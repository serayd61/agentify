# 🇨🇭 Agentify.ch - Swiss Agent Network Platform

Die Schweizer Plattform für branchenspezifische KI-Assistenten. Automatisieren Sie Ihre Kundenanfragen mit vorkonfigurierten Agents für verschiedene Branchen.

![Agentify.ch](https://agentify.ch/og-image.png)

## 🚀 Features

- **40+ Branchenspezifische Agents** - Treuhand, Handwerk, Gesundheit, Gastronomie und mehr
- **Marketplace** - Durchsuchen und kaufen Sie fertige Agent-Templates
- **Builder Bot** - Erstellen Sie Ihren eigenen Agent im Gespräch
- **Dashboard** - Verwalten Sie Ihre Agents und sehen Sie Statistiken
- **Embed Widget** - Ein Skript für Ihre Website
- **Swiss Hosting** - DSG-konform, Daten in der Schweiz
- **Multi-Channel** - Website, WhatsApp, E-Mail

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **AI:** OpenAI GPT-4
- **Deployment:** Vercel

## 📁 Projektstruktur

\`\`\`
agentify-ch/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth Seiten (Login, Register)
│   │   ├── dashboard/         # Customer Dashboard
│   │   ├── marketplace/       # Agent Marketplace
│   │   │   └── [slug]/       # Agent Detail Seite
│   │   ├── pricing/          # Pricing Seite
│   │   └── page.tsx          # Landing Page
│   ├── components/
│   │   ├── ui/               # UI Komponenten (Button, Card, etc.)
│   │   ├── layout/           # Layout Komponenten (Header, Footer)
│   │   ├── builder/          # Builder Bot Komponenten
│   │   └── widget/           # Chat Widget Komponenten
│   ├── lib/
│   │   ├── data/            # Statische Daten (Agents, Categories)
│   │   └── utils.ts         # Utility Funktionen
│   └── types/               # TypeScript Typen
├── public/
│   └── widget.js            # Embed Widget Script
├── supabase/
│   └── schema.sql           # Database Schema
└── ...
\`\`\`

## 🚀 Installation

### 1. Repository klonen

\`\`\`bash
git clone https://github.com/yourusername/agentify-ch.git
cd agentify-ch
\`\`\`

### 2. Dependencies installieren

\`\`\`bash
npm install
\`\`\`

### 3. Umgebungsvariablen konfigurieren

\`\`\`bash
cp .env.example .env.local
\`\`\`

Dann die Variablen in \`.env.local\` ausfüllen.

### 4. Supabase Setup

1. Erstellen Sie ein Projekt auf [supabase.com](https://supabase.com)
2. Führen Sie das Schema aus: \`supabase/schema.sql\`
3. Kopieren Sie die URL und Keys in \`.env.local\`

### 5. Development Server starten

\`\`\`bash
npm run dev
\`\`\`

Die App ist unter [http://localhost:3000](http://localhost:3000) erreichbar.

## 📱 Widget Integration

Fügen Sie diesen Code auf Ihrer Website ein:

\`\`\`html
<script 
  src="https://cdn.agentify.ch/widget.js" 
  data-agent-id="YOUR_AGENT_ID"
  data-position="bottom-right"
  data-color="#DC2626">
</script>
\`\`\`

## 💰 Preismodell

| Plan | Preis | Agents | Nachrichten |
|------|-------|--------|-------------|
| Starter | CHF 199/Mo | 1 | 2'500/Mo |
| Business | CHF 399/Mo | 3 | 10'000/Mo |
| Enterprise | CHF 899/Mo | Unbegrenzt | 50'000/Mo |

## 🔒 Sicherheit

- Swiss Hosting (Daten in der Schweiz)
- DSG-konform
- DSGVO-ready
- Ende-zu-Ende Verschlüsselung
- SOC 2 Type II (Supabase)

## 📊 Unterstützte Branchen

- 📊 Büro & Dienstleistungen (Treuhand, Anwalt, Steuerberater)
- 🔧 Handwerk & Bau (Elektro, Sanitär, Maler, Schreiner)
- 🏥 Gesundheit & Wellness (Arztpraxis, Zahnarzt, Physio)
- 🍽️ Gastronomie & Hotellerie (Restaurant, Hotel, Café)
- 🏠 Immobilien & Verwaltung
- 🚗 Auto & Mobilität
- 💻 Tech & Digital
- 🛒 Handel & Retail
- 📚 Bildung & Kurse

## 🛣️ Roadmap

- [ ] WhatsApp Business Integration
- [ ] Voice-to-Text Support
- [ ] Multi-Tenant Dashboard
- [ ] Custom Agent Training
- [ ] API für Entwickler
- [ ] Mobile App

## 📄 Lizenz

Proprietary - © 2024 Agentify.ch

## 🤝 Kontakt

- **Email:** kontakt@agentify.ch
- **Website:** [agentify.ch](https://agentify.ch)
- **Support:** support@agentify.ch
