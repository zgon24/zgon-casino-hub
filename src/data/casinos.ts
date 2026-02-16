import stakeLogo from "@/assets/stake-logo.png";
import flagmanLogo from "@/assets/flagman-logo.png";
import lebullLogo from "@/assets/lebull-logo.png";
import legzoBanner from "@/assets/legzo-banner.png";
import flagmanBanner from "@/assets/flagman-banner.png";
import oneGoBanner from "@/assets/1go-banner.png";

export interface Casino {
  name: string;
  url: string;
  image: string;
  code?: string;
  codeHelp?: string;
  note?: string;
  freeSpins?: number;
  highlight?: string;
}

export const casinos: Casino[] = [
  {
    name: "Stake",
    url: "https://stake.com/?c=r4QBeW03",
    image: stakeLogo,
    code: "zgonstake",
    codeHelp: "Esqueceste de inserir o código? Podes adicionar até 24h após o registo: Ícone de utilizador → Settings → Offers → Welcome Code",
    note: "(Necessário VPN para aceder)",
    highlight: "Código exclusivo ZGON",
  },
  {
    name: "LeBull",
    url: "https://www.lebull.pt/?partner=p71175p72532p7138&utm_source=aff&utm_medium=affiliate&utm_campaign=2026&utm_content=reg-page#registration",
    image: lebullLogo,
    highlight: "Casino PT licenciado",
  },
  {
    name: "Legzo",
    url: "https://legzo133.casino/?stag=238310_699379f303fa62b2c7e3e647",
    image: legzoBanner,
    freeSpins: 50,
    highlight: "🎰 50 Free Spins",
  },
  {
    name: "Flagman",
    url: "https://casinoflagman27.com/registration?stag=238310_69937a810bc39d9889c93223&affb_id=97&al_id=546cf128de5df31eafb67fc98352820e&cmp=1325484&prm=250316&tr_src=streamer",
    image: flagmanBanner,
    freeSpins: 50,
    highlight: "🎰 50 Free Spins",
  },
  {
    name: "1Go",
    url: "https://1gocasino62.com/registration?stag=238310_69937a980bc39d9889c93260&affb_id=91&al_id=1e17b6c0b5f25a37a11a616f2d40d59d&cmp=1325487&prm=250319&tr_src=streamer&vredir=2",
    image: oneGoBanner,
    freeSpins: 50,
    highlight: "🎰 50 Free Spins",
  },
];
