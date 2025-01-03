let posts = [];
let messageCount = 0;
let debugLines = [];
let wsConnection = null;

let updateInterval; // for time interval

const JETSTREAM_WS_URL =
  "wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post";
const MAX_DEBUG_LINES = 100;
const CLOUD_UPDATE_INTERVAL = 5000;
const CLOUD_SIZE = 100;

const statusEl = document.getElementById("status");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const wordCloudEl = document.getElementById("wordCloud");
const messageCountEl = document.getElementById("messageCount");
const lastUpdateEl = document.getElementById("lastUpdate");
const debugLog = document.getElementById("debug");

function log(message) {
  let timestamp = new Date().toLocaleTimeString();
  if (debugLines.length > MAX_DEBUG_LINES) {
    debugLines.pop();
  }
  debugLines.unshift(`${timestamp}: ${message}`);
  debugLog.textContent = debugLines.join("\n");
}

const commonWords = new Set([
  "a",
  "able",
  "about",
  "above",
  "abst",
  "accordance",
  "according",
  "accordingly",
  "across",
  "act",
  "actually",
  "added",
  "adj",
  "affected",
  "affecting",
  "affects",
  "after",
  "afterwards",
  "again",
  "against",
  "ah",
  "all",
  "almost",
  "alone",
  "along",
  "already",
  "also",
  "although",
  "always",
  "am",
  "among",
  "amongst",
  "an",
  "and",
  "announce",
  "another",
  "any",
  "anybody",
  "anyhow",
  "anymore",
  "anyone",
  "anything",
  "anyway",
  "anyways",
  "anywhere",
  "apparently",
  "approximately",
  "are",
  "aren",
  "arent",
  "arise",
  "around",
  "as",
  "aside",
  "ask",
  "asking",
  "at",
  "auth",
  "available",
  "away",
  "awfully",
  "b",
  "back",
  "be",
  "became",
  "because",
  "become",
  "becomes",
  "becoming",
  "been",
  "before",
  "beforehand",
  "begin",
  "beginning",
  "beginnings",
  "begins",
  "behind",
  "being",
  "believe",
  "below",
  "beside",
  "besides",
  "between",
  "beyond",
  "biol",
  "both",
  "brief",
  "briefly",
  "but",
  "by",
  "c",
  "ca",
  "came",
  "can",
  "cannot",
  "can't",
  "cant",
  "cause",
  "causes",
  "certain",
  "certainly",
  "co",
  "com",
  "come",
  "comes",
  "contain",
  "containing",
  "contains",
  "could",
  "couldnt",
  "d",
  "date",
  "did",
  "didnt",
  "didn't",
  "different",
  "do",
  "does",
  "doesn't",
  "doesnt",
  "doing",
  "done",
  "don't",
  "don’t",
  "dont",
  "down",
  "downwards",
  "due",
  "during",
  "e",
  "each",
  "ed",
  "edu",
  "effect",
  "eg",
  "eight",
  "eighty",
  "either",
  "else",
  "elsewhere",
  "end",
  "ending",
  "enough",
  "especially",
  "et",
  "et-al",
  "etc",
  "even",
  "ever",
  "every",
  "everybody",
  "everyone",
  "everything",
  "everywhere",
  "ex",
  "except",
  "f",
  "far",
  "few",
  "ff",
  "fifth",
  "first",
  "five",
  "fix",
  "followed",
  "following",
  "follows",
  "for",
  "former",
  "formerly",
  "forth",
  "found",
  "four",
  "from",
  "further",
  "furthermore",
  "g",
  "gave",
  "get",
  "gets",
  "getting",
  "give",
  "given",
  "gives",
  "giving",
  "go",
  "goes",
  "gone",
  "got",
  "gotten",
  "h",
  "had",
  "happens",
  "hardly",
  "has",
  "hasn't",
  "have",
  "haven't",
  "having",
  "he",
  "hed",
  "hence",
  "her",
  "here",
  "hereafter",
  "hereby",
  "herein",
  "heres",
  "hereupon",
  "hers",
  "herself",
  "hes",
  "hi",
  "hid",
  "him",
  "himself",
  "his",
  "hither",
  "home",
  "how",
  "howbeit",
  "however",
  "hundred",
  "i",
  "id",
  "ie",
  "if",
  "i'll",
  "im",
  "immediate",
  "immediately",
  "importance",
  "important",
  "in",
  "inc",
  "indeed",
  "index",
  "information",
  "instead",
  "into",
  "invention",
  "inward",
  "is",
  "isn't",
  "it",
  "itd",
  "it'll",
  "it's",
  "its",
  "itself",
  "i've",
  "j",
  "just",
  "k",
  "keep	keeps",
  "kept",
  "kg",
  "km",
  "know",
  "known",
  "knows",
  "l",
  "largely",
  "last",
  "lately",
  "later",
  "latter",
  "latterly",
  "least",
  "less",
  "lest",
  "let",
  "lets",
  "like",
  "liked",
  "likely",
  "line",
  "little",
  "'ll",
  "look",
  "looking",
  "looks",
  "ltd",
  "m",
  "made",
  "mainly",
  "make",
  "makes",
  "many",
  "may",
  "maybe",
  "me",
  "mean",
  "means",
  "meantime",
  "meanwhile",
  "merely",
  "mg",
  "might",
  "million",
  "miss",
  "ml",
  "more",
  "moreover",
  "most",
  "mostly",
  "mr",
  "mrs",
  "much",
  "mug",
  "must",
  "my",
  "myself",
  "n",
  "na",
  "name",
  "namely",
  "nay",
  "nd",
  "near",
  "nearly",
  "necessarily",
  "necessary",
  "need",
  "needs",
  "neither",
  "never",
  "nevertheless",
  "new",
  "next",
  "nine",
  "ninety",
  "no",
  "nobody",
  "non",
  "none",
  "nonetheless",
  "noone",
  "nor",
  "normally",
  "nos",
  "not",
  "noted",
  "nothing",
  "now",
  "nowhere",
  "o",
  "obtain",
  "obtained",
  "obviously",
  "of",
  "off",
  "often",
  "oh",
  "ok",
  "okay",
  "old",
  "omitted",
  "on",
  "once",
  "one",
  "ones",
  "only",
  "onto",
  "or",
  "ord",
  "other",
  "others",
  "otherwise",
  "ought",
  "our",
  "ours",
  "ourselves",
  "out",
  "outside",
  "over",
  "overall",
  "owing",
  "own",
  "p",
  "page",
  "pages",
  "part",
  "particular",
  "particularly",
  "past",
  "per",
  "perhaps",
  "placed",
  "please",
  "plus",
  "poorly",
  "possible",
  "possibly",
  "potentially",
  "pp",
  "predominantly",
  "present",
  "previously",
  "primarily",
  "probably",
  "promptly",
  "proud",
  "provides",
  "put",
  "q",
  "que",
  "quickly",
  "quite",
  "qv",
  "r",
  "ran",
  "rather",
  "rd",
  "re",
  "readily",
  "really",
  "recent",
  "recently",
  "ref",
  "refs",
  "regarding",
  "regardless",
  "regards",
  "related",
  "relatively",
  "research",
  "respectively",
  "resulted",
  "resulting",
  "results",
  "right",
  "run",
  "s",
  "said",
  "same",
  "saw",
  "say",
  "saying",
  "says",
  "sec",
  "section",
  "see",
  "seeing",
  "seem",
  "seemed",
  "seeming",
  "seems",
  "seen",
  "self",
  "selves",
  "sent",
  "seven",
  "several",
  "shall",
  "she",
  "shed",
  "she'll",
  "shes",
  "should",
  "shouldn't",
  "show",
  "showed",
  "shown",
  "showns",
  "shows",
  "significant",
  "significantly",
  "similar",
  "similarly",
  "since",
  "six",
  "slightly",
  "so",
  "some",
  "somebody",
  "somehow",
  "someone",
  "somethan",
  "something",
  "sometime",
  "sometimes",
  "somewhat",
  "somewhere",
  "soon",
  "sorry",
  "specifically",
  "specified",
  "specify",
  "specifying",
  "still",
  "stop",
  "strongly",
  "sub",
  "substantially",
  "successfully",
  "such",
  "sufficiently",
  "suggest",
  "sup",
  "sure	t",
  "take",
  "taken",
  "taking",
  "tell",
  "tends",
  "th",
  "than",
  "thank",
  "thanks",
  "thanx",
  "that",
  "that'll",
  "thats",
  "that've",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "thence",
  "there",
  "thereafter",
  "thereby",
  "thered",
  "therefore",
  "therein",
  "there'll",
  "thereof",
  "therere",
  "theres",
  "thereto",
  "thereupon",
  "there've",
  "these",
  "they",
  "theyd",
  "they'll",
  "theyre",
  "they've",
  "think",
  "this",
  "those",
  "thou",
  "though",
  "thoughh",
  "thousand",
  "throug",
  "through",
  "throughout",
  "thru",
  "thus",
  "til",
  "tip",
  "to",
  "together",
  "too",
  "took",
  "toward",
  "towards",
  "tried",
  "tries",
  "truly",
  "try",
  "trying",
  "ts",
  "twice",
  "two",
  "u",
  "un",
  "under",
  "unfortunately",
  "unless",
  "unlike",
  "unlikely",
  "until",
  "unto",
  "up",
  "upon",
  "ups",
  "us",
  "use",
  "used",
  "useful",
  "usefully",
  "usefulness",
  "uses",
  "using",
  "usually",
  "v",
  "value",
  "various",
  "'ve",
  "very",
  "via",
  "viz",
  "vol",
  "vols",
  "vs",
  "w",
  "want",
  "wants",
  "was",
  "wasnt",
  "way",
  "we",
  "wed",
  "welcome",
  "we'll",
  "went",
  "were",
  "werent",
  "we've",
  "what",
  "whatever",
  "what'll",
  "whats",
  "when",
  "whence",
  "whenever",
  "where",
  "whereafter",
  "whereas",
  "whereby",
  "wherein",
  "wheres",
  "whereupon",
  "wherever",
  "whether",
  "which",
  "while",
  "whim",
  "whither",
  "who",
  "whod",
  "whoever",
  "whole",
  "who'll",
  "whom",
  "whomever",
  "whos",
  "whose",
  "why",
  "widely",
  "will",
  "willing",
  "wish",
  "with",
  "within",
  "without",
  "wont",
  "words",
  "world",
  "would",
  "wouldnt",
  "www",
  "x",
  "y",
  "yes",
  "yet",
  "you",
  "youd",
  "you'll",
  "your",
  "you're",
  "youre",
  "yours",
  "yourself",
  "yourselves",
  "you've",
  "z",
  "zero",

  "a",
  "acerca",
  "adeus",
  "agora",
  "ainda",
  "alem",
  "algmas",
  "algo",
  "algumas",
  "alguns",
  "ali",
  "além",
  "ambas",
  "ambos",
  "ano",
  "anos",
  "antes",
  "ao",
  "aonde",
  "aos",
  "apenas",
  "apoio",
  "apontar",
  "apos",
  "após",
  "aquela",
  "aquelas",
  "aquele",
  "aqueles",
  "aqui",
  "aquilo",
  "as",
  "assim",
  "através",
  "atrás",
  "até",
  "aí",
  "baixo",
  "bastante",
  "bem",
  "boa",
  "boas",
  "bom",
  "bons",
  "breve",
  "cada",
  "caminho",
  "catorze",
  "cedo",
  "cento",
  "certamente",
  "certeza",
  "cima",
  "cinco",
  "coisa",
  "com",
  "como",
  "comprido",
  "conhecido",
  "conselho",
  "contra",
  "contudo",
  "corrente",
  "cuja",
  "cujas",
  "cujo",
  "cujos",
  "custa",
  "cá",
  "da",
  "daquela",
  "daquelas",
  "daquele",
  "daqueles",
  "dar",
  "das",
  "de",
  "debaixo",
  "dela",
  "delas",
  "dele",
  "deles",
  "demais",
  "dentro",
  "depois",
  "desde",
  "desligado",
  "dessa",
  "dessas",
  "desse",
  "desses",
  "desta",
  "destas",
  "deste",
  "destes",
  "deve",
  "devem",
  "deverá",
  "dez",
  "dezanove",
  "dezasseis",
  "dezassete",
  "dezoito",
  "dia",
  "diante",
  "direita",
  "dispoe",
  "dispoem",
  "diversa",
  "diversas",
  "diversos",
  "diz",
  "dizem",
  "dizer",
  "do",
  "dois",
  "dos",
  "doze",
  "duas",
  "durante",
  "dá",
  "dão",
  "dúvida",
  "e",
  "ela",
  "elas",
  "ele",
  "eles",
  "em",
  "embora",
  "enquanto",
  "entao",
  "entre",
  "então",
  "era",
  "eram",
  "essa",
  "essas",
  "esse",
  "esses",
  "esta",
  "estado",
  "estamos",
  "estar",
  "estará",
  "estas",
  "estava",
  "estavam",
  "este",
  "esteja",
  "estejam",
  "estejamos",
  "estes",
  "esteve",
  "estive",
  "estivemos",
  "estiver",
  "estivera",
  "estiveram",
  "estiverem",
  "estivermos",
  "estivesse",
  "estivessem",
  "estiveste",
  "estivestes",
  "estivéramos",
  "estivéssemos",
  "estou",
  "está",
  "estás",
  "estávamos",
  "estão",
  "eu",
  "exemplo",
  "falta",
  "fará",
  "favor",
  "faz",
  "fazeis",
  "fazem",
  "fazemos",
  "fazer",
  "fazes",
  "fazia",
  "faço",
  "fez",
  "fim",
  "final",
  "foi",
  "fomos",
  "for",
  "fora",
  "foram",
  "forem",
  "forma",
  "formos",
  "fosse",
  "fossem",
  "foste",
  "fostes",
  "fui",
  "fôramos",
  "fôssemos",
  "geral",
  "grande",
  "grandes",
  "grupo",
  "ha",
  "haja",
  "hajam",
  "hajamos",
  "havemos",
  "havia",
  "hei",
  "hoje",
  "hora",
  "horas",
  "houve",
  "houvemos",
  "houver",
  "houvera",
  "houveram",
  "houverei",
  "houverem",
  "houveremos",
  "houveria",
  "houveriam",
  "houvermos",
  "houverá",
  "houverão",
  "houveríamos",
  "houvesse",
  "houvessem",
  "houvéramos",
  "houvéssemos",
  "há",
  "hão",
  "iniciar",
  "inicio",
  "ir",
  "irá",
  "isso",
  "ista",
  "iste",
  "isto",
  "já",
  "lado",
  "lhe",
  "lhes",
  "ligado",
  "local",
  "logo",
  "longe",
  "lugar",
  "lá",
  "maior",
  "maioria",
  "maiorias",
  "mais",
  "mal",
  "mas",
  "me",
  "mediante",
  "meio",
  "menor",
  "menos",
  "meses",
  "mesma",
  "mesmas",
  "mesmo",
  "mesmos",
  "meu",
  "meus",
  "mil",
  "minha",
  "minhas",
  "momento",
  "muito",
  "muitos",
  "máximo",
  "mês",
  "na",
  "nada",
  "nao",
  "naquela",
  "naquelas",
  "naquele",
  "naqueles",
  "nas",
  "nem",
  "nenhuma",
  "nessa",
  "nessas",
  "nesse",
  "nesses",
  "nesta",
  "nestas",
  "neste",
  "nestes",
  "no",
  "noite",
  "nome",
  "nos",
  "nossa",
  "nossas",
  "nosso",
  "nossos",
  "nova",
  "novas",
  "nove",
  "novo",
  "novos",
  "num",
  "numa",
  "numas",
  "nunca",
  "nuns",
  "não",
  "nível",
  "nós",
  "número",
  "o",
  "obra",
  "obrigada",
  "obrigado",
  "oitava",
  "oitavo",
  "oito",
  "onde",
  "ontem",
  "onze",
  "os",
  "ou",
  "outra",
  "outras",
  "outro",
  "outros",
  "para",
  "parece",
  "parte",
  "partir",
  "paucas",
  "pegar",
  "pela",
  "pelas",
  "pelo",
  "pelos",
  "perante",
  "perto",
  "pessoas",
  "pode",
  "podem",
  "poder",
  "poderá",
  "podia",
  "pois",
  "ponto",
  "pontos",
  "por",
  "porque",
  "porquê",
  "portanto",
  "posição",
  "possivelmente",
  "posso",
  "possível",
  "pouca",
  "pouco",
  "poucos",
  "povo",
  "primeira",
  "primeiras",
  "primeiro",
  "primeiros",
  "promeiro",
  "propios",
  "proprio",
  "própria",
  "próprias",
  "próprio",
  "próprios",
  "próxima",
  "próximas",
  "próximo",
  "próximos",
  "puderam",
  "pôde",
  "põe",
  "põem",
  "quais",
  "qual",
  "qualquer",
  "quando",
  "quanto",
  "quarta",
  "quarto",
  "quatro",
  "que",
  "quem",
  "quer",
  "quereis",
  "querem",
  "queremas",
  "queres",
  "quero",
  "questão",
  "quieto",
  "quinta",
  "quinto",
  "quinze",
  "quáis",
  "quê",
  "relação",
  "sabe",
  "sabem",
  "saber",
  "se",
  "segunda",
  "segundo",
  "sei",
  "seis",
  "seja",
  "sejam",
  "sejamos",
  "sem",
  "sempre",
  "sendo",
  "ser",
  "serei",
  "seremos",
  "seria",
  "seriam",
  "será",
  "serão",
  "seríamos",
  "sete",
  "seu",
  "seus",
  "sexta",
  "sexto",
  "sim",
  "sistema",
  "sob",
  "sobre",
  "sois",
  "somente",
  "somos",
  "sou",
  "sua",
  "suas",
  "são",
  "sétima",
  "sétimo",
  "só",
  "tal",
  "talvez",
  "tambem",
  "também",
  "tanta",
  "tantas",
  "tanto",
  "tarde",
  "te",
  "tem",
  "temos",
  "tempo",
  "tendes",
  "tenha",
  "tenham",
  "tenhamos",
  "tenho",
  "tens",
  "tentar",
  "tentaram",
  "tente",
  "tentei",
  "ter",
  "terceira",
  "terceiro",
  "terei",
  "teremos",
  "teria",
  "teriam",
  "terá",
  "terão",
  "teríamos",
  "teu",
  "teus",
  "teve",
  "tinha",
  "tinham",
  "tipo",
  "tive",
  "tivemos",
  "tiver",
  "tivera",
  "tiveram",
  "tiverem",
  "tivermos",
  "tivesse",
  "tivessem",
  "tiveste",
  "tivestes",
  "tivéramos",
  "tivéssemos",
  "toda",
  "todas",
  "todo",
  "todos",
  "trabalhar",
  "trabalho",
  "treze",
  "três",
  "tu",
  "tua",
  "tuas",
  "tudo",
  "tão",
  "tém",
  "têm",
  "tínhamos",
  "um",
  "uma",
  "umas",
  "uns",
  "usa",
  "usar",
  "vai",
  "vais",
  "valor",
  "veja",
  "vem",
  "vens",
  "ver",
  "verdade",
  "verdadeiro",
  "vez",
  "vezes",
  "viagem",
  "vindo",
  "vinte",
  "você",
  "vocês",
  "vos",
  "vossa",
  "vossas",
  "vosso",
  "vossos",
  "vários",
  "vão",
  "vêm",
  "vós",
  "zero",
  "à",
  "às",
  "área",
  "é",
  "éramos",
  "és",
  "último",

  "der",
  "las",
  "pas",
  "har",
  "der",
  "een",
  "ich",
]);

function updateStatus(status) {
  if (status === "connecting") {
    log("🟠 Attempting to connect to WebSocket...");
    statusEl.textContent = "Connecting...";
    statusEl.style.background = "orange";
  } else if (status === "connected") {
    log("🟢 WebSocket connected successfully");
    statusEl.textContent = "Connected";
    statusEl.style.background = "green";
  } else if (status === "disconnected") {
    log(`🔴 WebSocket disconnected`);
    statusEl.textContent = "Disconnected";
    statusEl.style.background = "red";
  } else if (status === "error") {
    log(`🚫 WebSocket error: ${error}`);
    statusEl.textContent = "Error";
    statusEl.style.background = "red";
  }
}

function connectWebSocket() {
  // disconnect if already connected
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }

  updateStatus("connecting");
  wsConnection = new WebSocket(JETSTREAM_WS_URL);

  wsConnection.onopen = () => updateStatus("connected");
  wsConnection.onclose = (event) => updateStatus("disconnected");
  wsConnection.onerror = (error) => updateStatus("error");

  wsConnection.onmessage = (event) => {
    try {
      messageCount++;
      messageCountEl.textContent = messageCount;

      const data = JSON.parse(event.data);

      // Check if the message is a post and has text
      if (
        data.commit?.collection === "app.bsky.feed.post" &&
        data.commit?.record?.text
      ) {
        posts.push({
          text: data.commit.record.text,
          timestamp: Date.now(),
        });

        // keep the posts collection to under 10000 and within the last CLOUD_UPDATE_INTERVAL seconds
        const oldestPostOlderThanInterval =
          Date.now() - posts[0].timestamp >= CLOUD_UPDATE_INTERVAL;
        if (posts.length > 10000 || oldestPostOlderThanInterval) posts.shift();

        log(`💬 ${data.commit.record.text.substring(0, 50)}...`);
      }
    } catch (error) {
      log(`🚫 Error processing message: ${error.message}`);
      console.error("Full error:", error);
    }
  };

  return wsConnection;
}

function updateWordCloud() {
  if (isPaused) {
    clearInterval(updateInterval);
    return;
  }
  const now = Date.now();

  const wordCount = {};
  posts.forEach((post) => {
    const words = post.text
      .toLowerCase()
      .replace(/[\p{P}\p{S}]/gu, "") // remove punctuation and symbols, emojis
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 &&
          word.length < 25 &&
          !commonWords.has(word) &&
          !word.startsWith("http") &&
          !word.startsWith("www") &&
          !word.startsWith("#")
      );

    // construct obj with counts for each word, like {"hello": 5, "world": 10, "test": 3}
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  // sort by count and take the top cloudSize words
  const sortedWords = Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, CLOUD_SIZE);

  lastUpdateEl.textContent = new Date().toLocaleTimeString();
  log(
    `🚀 Updating word cloud with ${sortedWords.length} words from ${posts.length} posts`
  );

  const maxCount = Math.max(...sortedWords.map(([, count]) => count), 1);

  const cloudContainer = document.getElementById("wordCloud");
  cloudContainer.innerHTML = sortedWords.length ? "" : "Waiting for data...";

  sortedWords.forEach(([word, count], index) => {
    const element = document.createElement("span");
    element.className = "word";
    element.textContent = word;

    const fontSize = 1.2 + (CLOUD_SIZE - index) * 0.01;
    element.style.fontSize = `${fontSize}em`;

    const opacity = 0.3 + (count / maxCount) * 0.7;
    element.style.backgroundColor = `rgba(29, 180, 229, ${opacity})`;

    cloudContainer.appendChild(element);
  });
}

const toggleBtn = document.getElementById("toggle-btn");
let isPaused = false;

toggleBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  toggleBtn.textContent = isPaused ? "▶️ Resume" : "⏸️ Pause";

  if (isPaused) {
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
    }
    clearInterval(updateInterval);
  } else {
    connectWebSocket();
    updateWordCloud();
    updateInterval = setInterval(updateWordCloud, CLOUD_UPDATE_INTERVAL);
  }
});

// Initial connection
connectWebSocket();

// First update after 2 seconds
setTimeout(() => {
  updateWordCloud();
  // Then start regular 5-second updates
  updateInterval = setInterval(updateWordCloud, CLOUD_UPDATE_INTERVAL);
}, 2000);

const toggleDarkModeButton = document.getElementById("toggleDarkMode");

const applyMode = (isDarkMode) => {
  if (isDarkMode) {
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
    toggleDarkModeButton.textContent = "☀️ Light Mode";
  } else {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    toggleDarkModeButton.textContent = "🌙 Dark Mode";
  }
};

toggleDarkModeButton.addEventListener("click", () => {
  const isDarkMode = document.body.classList.contains("light-mode");
  applyMode(isDarkMode);
});

// Apply prefers-color-scheme setting initially
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
applyMode(prefersDarkScheme.matches);

// Listen for changes to the prefers-color-scheme setting
prefersDarkScheme.addEventListener("change", (e) => {
  applyMode(e.matches);
});
