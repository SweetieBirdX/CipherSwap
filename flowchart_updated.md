flowchart TB
    style Header fill:#1e3a8a,stroke:#1e40af,color:#fff
    style Footer fill:#1e3a8a,stroke:#1e40af,color:#fff
    style Hero fill:#3b82f6,stroke:#2563eb,color:#fff
    style Features fill:#60a5fa,stroke:#3b82f6,color:#fff
    style Prices fill:#93c5fd,stroke:#60a5fa,color:#fff
    style Stats fill:#dbeafe,stroke:#93c5fd,color:#1e3a8a

    subgraph Header[""]
      direction LR
      Logo[Logo]
      Nav[(Nav Menü)]
      Spacer1[( )]
      CtaBtn[Go App Butonu]
    end

    subgraph Hero["Hero Bölümü"]
      HeroBG[(Arka Plan Gradyan)]
      HeroTitle[**Secure DeFi Trading**]
      HeroDesc[Enterprise-grade OTC swaps...]
      HeroActions[Start Trading | Learn More]
    end

    subgraph Features["Özellikler (3 Kolon)"]
      MEV[🔰 MEV Protection<br/>Front-running koruması]
      Split[⚡ Split Routing<br/>Optimizasyon]
      Slippage[🔒 Zero Slippage<br/>Minimum fiyat sapması]
    end

    subgraph Prices["Canlı Fiyat Tablosu"]
      Filters[Filtreler (→ Ağ, Token ...)]
      PriceTable{{| Token | Ağı | Fiyat | Zaman |}}
    end

    subgraph Stats["Anahtar Metrikler"]
      Volume[**$50M+**<br/>Total Volume]
      SlippageAvg[**0.1%**<br/>Avg Slippage]
      Success[**99.9%**<br/>Success Rate]
      Uptime[**24/7**<br/>Uptime]
    end

    subgraph Footer[""]
      Links[(Footer Bağlantıları)]
      Social[(Sosyal Medya İkonları)]
    end

    Header --> Hero
    Hero --> Features
    Features --> Prices
    Prices --> Stats
    Stats --> Footer

## 🎨 **Renk Şeması:**

1. **Header & Footer** - Koyu mavi (#1e3a8a) - Beyaz metin
2. **Hero** - Orta mavi (#3b82f6) - Beyaz metin  
3. **Features** - Açık mavi (#60a5fa) - Beyaz metin
4. **Live Prices** - Daha açık mavi (#93c5fd) - Beyaz metin
5. **Stats** - En açık mavi (#dbeafe) - Koyu mavi metin

Bu renk geçişi resimdeki görsel hiyerarşiyi mükemmel şekilde yansıtıyor! 