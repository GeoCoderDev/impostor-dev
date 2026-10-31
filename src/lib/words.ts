export type Entry = { word: string; hint?: string };

export type Pack = {
  id: string;
  name: string;
  emoji: string;
  entries: Entry[];
  custom?: boolean;
};

const e = (words: string[]): Entry[] => words.map((word) => ({ word }));

export const BUILTIN_PACKS: Pack[] = [
  {
    id: "comida",
    name: "Comida",
    emoji: "🍽️",
    entries: e([
      "Ceviche", "Lomo saltado", "Pizza", "Hamburguesa", "Arroz con leche", "Anticuchos",
      "Papa a la huancaína", "Tacos", "Sushi", "Empanada", "Chifa", "Pollo a la brasa",
      "Helado", "Chocolate", "Tamal", "Causa limeña", "Ají de gallina", "Salchipapa",
      "Panetón", "Mazamorra morada", "Tequeños", "Pan con chicharrón", "Sopa a la minuta",
      "Aguadito", "Choclo con queso", "Ensalada de frutas", "Palta", "Mango",
    ]),
  },
  {
    id: "animales",
    name: "Animales",
    emoji: "🦙",
    entries: e([
      "Llama", "Cóndor", "Delfín", "Pingüino", "Jirafa", "Elefante", "Tiburón", "Perro",
      "Gato", "Loro", "Mono", "Oso de anteojos", "Vicuña", "Cuy", "Tortuga", "Pulpo",
      "Murciélago", "Cocodrilo", "Camaleón", "Colibrí", "Zorro", "Rana", "Abeja",
      "Hormiga", "Búho", "Caballo", "Canguro", "Foca",
    ]),
  },
  {
    id: "lugares",
    name: "Lugares",
    emoji: "📍",
    entries: e([
      "Machu Picchu", "Playa", "Aeropuerto", "Hospital", "Universidad", "Cine", "Mercado",
      "Biblioteca", "Estadio", "Gimnasio", "Iglesia", "Banco", "Discoteca", "Zoológico",
      "Lago Titicaca", "Desierto", "Selva", "Montaña", "Supermercado", "Cárcel",
      "Terminal de buses", "Parque de diversiones", "Cementerio", "Hotel", "Peluquería",
      "Comisaría", "Museo", "Farmacia",
    ]),
  },
  {
    id: "futbol",
    name: "Fútbol",
    emoji: "⚽",
    entries: e([
      "Penal", "Tarjeta roja", "Árbitro", "Arquero", "Hinchada", "Offside", "Córner",
      "Mundial", "Copa Libertadores", "DT", "Camiseta", "Barra brava", "Gol olímpico",
      "Tiro libre", "VAR", "Delantero", "Defensa", "Cancha", "Pelota", "Remate",
      "Hat-trick", "Clásico", "Campeón", "Descenso", "Fichaje", "Banca", "Chalaca",
    ]),
  },
  {
    id: "profesiones",
    name: "Profesiones",
    emoji: "🧑‍🔧",
    entries: e([
      "Doctor", "Profesor", "Policía", "Bombero", "Chef", "Piloto", "Ingeniero", "Abogado",
      "Arquitecto", "Electricista", "Mecánico", "Taxista", "Cantante", "Fotógrafo",
      "Programador", "Carpintero", "Enfermera", "Astronauta", "Panadero", "Periodista",
      "Veterinario", "Cajero", "Dentista", "Pescador", "Agricultor", "Payaso",
    ]),
  },
  {
    id: "objetos",
    name: "Objetos",
    emoji: "🎒",
    entries: e([
      "Celular", "Paraguas", "Mochila", "Llaves", "Espejo", "Reloj", "Audífonos",
      "Cargador", "Lentes", "Cuaderno", "Linterna", "Cuchara", "Almohada", "Tijeras",
      "Silla", "Televisor", "Bicicleta", "Control remoto", "Billetera", "Escoba",
      "Microondas", "Sombrero", "Candado", "Calculadora", "Termo", "Ventilador",
    ]),
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    emoji: "💻",
    entries: e([
      "WiFi", "Bluetooth", "Servidor", "Base de datos", "Inteligencia artificial", "Hacker",
      "Bug", "Contraseña", "Nube", "Algoritmo", "Teclado", "Pantalla", "Dron", "Robot",
      "Videojuego", "Streaming", "Aplicación", "Código QR", "Antivirus", "Pixel",
      "Pull request", "Deploy", "API", "Firewall", "Batería", "Memoria RAM",
    ]),
  },
];

export const MIX_PACK_ID = "mezcla";

export function mixPack(packs: Pack[]): Pack {
  return {
    id: MIX_PACK_ID,
    name: "Mezcla total",
    emoji: "🎲",
    entries: packs.flatMap((p) =>
      p.entries.map((en) => ({ word: en.word, hint: en.hint ?? p.name })),
    ),
  };
}

/** Pista vaga para el impostor: la del propio entry o, si no hay, el nombre del pack. */
export function hintFor(entry: Entry, pack: Pack): string {
  return entry.hint?.trim() || pack.name;
}
