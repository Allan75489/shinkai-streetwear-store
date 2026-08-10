/* ==========================================================================
   SHINKAI — data.js
   Fonte única de verdade para produtos, categorias, estações e posts do blog.
   Toda página (home, catálogo, produto, busca) lê daqui — nada duplicado.
   ========================================================================== */

/**
 * Estrutura de um produto:
 * id            {string}  slug único, usado na URL produto.html?id=...
 * name          {string}  nome de exibição
 * anime         {string}  franquia/anime
 * category      {string}  "Camiseta" | "Moletom" | "Regata"
 * season        {string}  "verao" | "inverno" | "outono" | "primavera" | "todas"
 * price         {number}  preço atual em R$
 * oldPrice      {number|null} preço "de" (riscado) — null se não houver desconto
 * bestSeller    {boolean} exibe selo "Mais vendida" e entra na home
 * isNew         {boolean} exibe selo "Novo"
 * stock         {number}  unidades disponíveis (usado pra "últimas unidades")
 * sizes         {string[]}
 * image         {string}  imagem principal
 * gallery       {string[]} imagens adicionais (mesma imagem repetida se não houver)
 * description   {string}  texto da página de produto
 * sold          {number}  contador de vendas, usado para ordenar "mais vendidos"
 */
const ASSET = (file) => window.location.pathname.includes("/pages/") ? `../assets/${file}` : `assets/${file}`;

const PRODUCTS = [
  {
    id: "aot-survey-corps",
    name: "Camiseta SHINKAI Survey Corps",
    anime: "Attack on Titan",
    category: "Camiseta",
    season: "outono",
    price: 89.9,
    oldPrice: 109.9,
    bestSeller: true,
    isNew: false,
    stock: 14,
    sizes: ["P", "M", "G", "GG"],
    image: ASSET("PRODUTO 1.png"),
    gallery: [ASSET("PRODUTO 1.png")],
    description:
      "Estampa DTF em alta definição do emblema da Legião de Reconhecimento. Tecido 100% algodão penteado 180g/m², corte streetwear levemente oversized.",
    sold: 312,
  },
  {
    id: "demon-slayer-nezuko",
    name: "Camiseta SHINKAI Nezuko Edition",
    anime: "Demon Slayer",
    category: "Camiseta",
    season: "primavera",
    price: 89.9,
    oldPrice: null,
    bestSeller: true,
    isNew: true,
    stock: 22,
    sizes: ["P", "M", "G", "GG"],
    image: ASSET("PRODUTO 2.png"),
    gallery: [ASSET("PRODUTO 2.png")],
    description:
      "Edição especial com arte exclusiva da Nezuko. Estampa resistente a rachaduras mesmo após dezenas de lavagens.",
    sold: 287,
  },
  {
    id: "demon-slayer-rengoku",
    name: "Camiseta SHINKAI Rengoku Flame",
    anime: "Demon Slayer",
    category: "Camiseta",
    season: "verao",
    price: 79.9,
    oldPrice: 99.9,
    bestSeller: false,
    isNew: false,
    stock: 9,
    sizes: ["P", "M", "G", "GG"],
    image: ASSET("Produto 4.png"),
    gallery: [ASSET("Produto 4.png")],
    description:
      "Estampa inspirada na chama do Hashira das Chamas. Tecido leve, ideal para dias quentes.",
    sold: 154,
  },
  {
    id: "dragon-ball-ultra-instinct",
    name: "Camiseta SHINKAI Ultra Instinct",
    anime: "Dragon Ball",
    category: "Camiseta",
    season: "verao",
    price: 89.9,
    oldPrice: null,
    bestSeller: false,
    isNew: false,
    stock: 18,
    sizes: ["P", "M", "G", "GG"],
    image: ASSET("PRODUTO 5.png"),
    gallery: [ASSET("PRODUTO 5.png")],
    description: "Goku em Instinto Superior estampado em silk premium sobre algodão penteado.",
    sold: 198,
  },
  {
    id: "one-punch-saitama",
    name: "Camiseta SHINKAI Saitama Strength",
    anime: "One Punch Man",
    category: "Camiseta",
    season: "verao",
    price: 79.9,
    oldPrice: 99.9,
    bestSeller: false,
    isNew: false,
    stock: 6,
    sizes: ["P", "M", "G", "GG"],
    image: ASSET("PRODUTO 3.png"),
    gallery: [ASSET("PRODUTO 3.png")],
    description: "Minimalista e direta — assim como um soco só. Estampa frontal centralizada.",
    sold: 121,
  },
  {
    id: "jjk-sukuna",
    name: "Camiseta SHINKAI Sukuna King",
    anime: "Jujutsu Kaisen",
    category: "Camiseta",
    season: "inverno",
    price: 94.9,
    oldPrice: null,
    bestSeller: true,
    isNew: false,
    stock: 27,
    sizes: ["P", "M", "G", "GG"],
    image: ASSET("PRODUTO 1.png"),
    gallery: [ASSET("PRODUTO 1.png")],
    description:
      "Estampa costas-inteiras do Rei das Maldições. Peça de maior formato do catálogo, corte boxy.",
    sold: 341,
  },
  {
    id: "jjk-gojo",
    name: "Camiseta SHINKAI Gojo Infinity",
    anime: "Jujutsu Kaisen",
    category: "Camiseta",
    season: "inverno",
    price: 94.9,
    oldPrice: null,
    bestSeller: false,
    isNew: true,
    stock: 15,
    sizes: ["P", "M", "G", "GG"],
    image: ASSET("PRODUTO 2.png"),
    gallery: [ASSET("PRODUTO 2.png")],
    description: "Estampa do Domínio Infinito com efeito degradê exclusivo SHINKAI.",
    sold: 176,
  },
  {
    id: "chainsaw-man-denji",
    name: "Camiseta SHINKAI Chainsaw Man",
    anime: "Chainsaw Man",
    category: "Camiseta",
    season: "outono",
    price: 89.9,
    oldPrice: 109.9,
    bestSeller: false,
    isNew: true,
    stock: 11,
    sizes: ["P", "M", "G", "GG"],
    image: ASSET("Produto 4.png"),
    gallery: [ASSET("Produto 4.png")],
    description: "Arte gráfica pesada, tecido reforçado nas costuras para uso diário intenso.",
    sold: 143,
  },
  {
    id: "naruto-uzumaki",
    name: "Camiseta SHINKAI Naruto Uzumaki",
    anime: "Naruto",
    category: "Camiseta",
    season: "primavera",
    price: 84.9,
    oldPrice: null,
    bestSeller: true,
    isNew: false,
    stock: 20,
    sizes: ["P", "M", "G", "GG"],
    image: ASSET("PRODUTO 5.png"),
    gallery: [ASSET("PRODUTO 5.png")],
    description: "Clássico atemporal. Estampa central do símbolo de Konoha com Naruto em ação.",
    sold: 402,
  },
  {
    id: "death-note-l",
    name: "Camiseta SHINKAI Death Note",
    anime: "Death Note",
    category: "Camiseta",
    season: "outono",
    price: 84.9,
    oldPrice: null,
    bestSeller: false,
    isNew: false,
    stock: 13,
    sizes: ["P", "M", "G", "GG"],
    image: ASSET("PRODUTO 3.png"),
    gallery: [ASSET("PRODUTO 3.png")],
    description: "Tipografia inspirada nas páginas do caderno. Corte reto, gola reforçada.",
    sold: 132,
  },
  {
    id: "moletom-shinkai-ocean",
    name: "Moletom SHINKAI Ocean",
    anime: "Original SHINKAI",
    category: "Moletom",
    season: "inverno",
    price: 169.9,
    oldPrice: 199.9,
    bestSeller: true,
    isNew: false,
    stock: 8,
    sizes: ["P", "M", "G", "GG"],
    image: ASSET("PRODUTO 1.png"),
    gallery: [ASSET("PRODUTO 1.png")],
    description: "Moletom flanelado, kanji bordado no peito. Peça de inverno mais vendida da loja.",
    sold: 256,
  },
  {
    id: "regata-shinkai-essence",
    name: "Regata SHINKAI Essence",
    anime: "Original SHINKAI",
    category: "Regata",
    season: "verao",
    price: 59.9,
    oldPrice: 74.9,
    bestSeller: false,
    isNew: true,
    stock: 30,
    sizes: ["P", "M", "G", "GG"],
    image: ASSET("PRODUTO 2.png"),
    gallery: [ASSET("PRODUTO 2.png")],
    description: "Regata leve para treino ou verão intenso, tecido dry-fit com logo minimalista.",
    sold: 98,
  },
];

/** Estações do ano — usado em filtros e badges */
const SEASONS = [
  { id: "verao", label: "Verão", icon: "fa-sun" },
  { id: "outono", label: "Outono", icon: "fa-leaf" },
  { id: "inverno", label: "Inverno", icon: "fa-snowflake" },
  { id: "primavera", label: "Primavera", icon: "fa-spa" },
];

/** Categorias de produto */
const CATEGORIES = ["Camiseta", "Moletom", "Regata"];

/** Posts do blog (estático — pronto pra virar CMS futuramente) */
const BLOG_POSTS = [
  {
    id: "como-cuidar-estampa-dtf",
    title: "Como cuidar da estampa DTF pra ela durar anos",
    excerpt:
      "Lavar do avesso, água fria e nunca passar ferro direto na estampa. Veja o passo a passo completo pra sua camiseta SHINKAI durar temporadas.",
    image: ASSET("PRODUTO 1.png"),
    category: "Cuidados",
    date: "2026-07-12",
    readTime: "4 min",
    content: [
      "Estampas DTF (Direct to Film) são mais duráveis que o silk tradicional, mas ainda pedem alguns cuidados básicos pra durarem o máximo possível.",
      "Sempre lave a peça do avesso, com água fria e sabão neutro. Evite amaciante direto na estampa e nunca torça a região estampada.",
      "Na secagem, prefira secar à sombra. Se for usar ferro de passar, sempre do avesso e sem vapor direto na estampa.",
      "Seguindo essas dicas, sua camiseta SHINKAI aguenta tranquilamente mais de 60 lavagens sem rachar ou desbotar.",
    ],
  },
  {
    id: "guia-tamanhos-oversized",
    title: "Guia de tamanhos: como escolher entre G e GG no corte oversized",
    excerpt:
      "Nosso corte streetwear é mais solto que o tradicional. Te ajudamos a acertar o tamanho ideal sem trocas.",
    image: ASSET("PRODUTO 2.png"),
    category: "Guia de compra",
    date: "2026-06-28",
    readTime: "3 min",
    content: [
      "O corte oversized SHINKAI é pensado pra caimento solto, então geralmente recomendamos um tamanho abaixo do que você usaria numa camiseta tradicional.",
      "Se você veste M em marcas comuns, provavelmente vai preferir o P ou M no nosso caimento, dependendo do quanto gosta de peça larga.",
      "Consulte sempre a tabela de medidas (largura de busto e comprimento) disponível na página de cada produto antes de comprar.",
      "Em caso de dúvida, nosso atendimento via WhatsApp ajuda a escolher o tamanho ideal sem risco de troca.",
    ],
  },
  {
    id: "top-5-animes-2026",
    title: "Os 5 animes mais pedidos em estampas neste ano",
    excerpt:
      "Jujutsu Kaisen segue na liderança, mas Chainsaw Man vem crescendo rápido nas vendas. Veja o ranking completo.",
    image: ASSET("Produto 4.png"),
    category: "Tendências",
    date: "2026-06-05",
    readTime: "5 min",
    content: [
      "Levantamos os dados de vendas dos últimos 6 meses e o resultado mostra Jujutsu Kaisen como líder absoluto, puxado pelas estampas do Sukuna e do Gojo.",
      "Chainsaw Man vem em ascensão acelerada, com crescimento de mais de 40% nas vendas no último trimestre.",
      "Clássicos como Naruto e Dragon Ball seguem firmes, provando que atemporalidade também vende.",
      "Demon Slayer e Attack on Titan completam o top 5, mantendo presença forte principalmente nas coleções sazonais.",
    ],
  },
  {
    id: "colecao-inverno-2026",
    title: "Bastidores da coleção de inverno: moletons flanelados",
    excerpt:
      "Do design ao bordado: como criamos a linha de moletons mais pedida da temporada.",
    image: ASSET("PRODUTO 5.png"),
    category: "Bastidores",
    date: "2026-05-20",
    readTime: "6 min",
    content: [
      "A coleção de inverno nasceu da vontade de trazer o universo dos animes pra peças mais robustas, ideais pros dias frios.",
      "Optamos por flanela interna e bordado no peito (ao invés de estampa) pra dar um acabamento mais premium e duradouro nos moletons.",
      "Cada peça passa por 3 etapas de controle de qualidade antes de ir pro estoque, incluindo teste de lavagem acelerado.",
      "O Moletom SHINKAI Ocean já é o mais vendido da linha de inverno — conheça na página de produto.",
    ],
  },
];

/** Configurações globais da loja */
const STORE_CONFIG = {
  whatsappNumber: "5599999999999", // TODO: trocar pelo número real da loja
  freeShippingThreshold: 199,
  storeName: "SHINKAI",
};
