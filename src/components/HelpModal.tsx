"use client";

import { useEffect } from "react";

const STEPS: { title: string; body: string }[] = [
  {
    title: "1. Reúne al grupo",
    body: "Necesitan un solo celular y de 3 a 20 jugadores. Siéntense en círculo; el celular irá pasando de mano en mano.",
  },
  {
    title: "2. Configura la partida",
    body: "Escribe el nombre de cada jugador, elige una categoría y cuántos impostores habrá. Puedes poner 0 impostores o activar el modo sorpresa, donde la cantidad se sortea y nadie la sabe. Opcionalmente activa la pista para el impostor y el temporizador.",
  },
  {
    title: "3. Reparte los roles en secreto",
    body: "Toca «Empezar». La app dirá a quién le toca. Esa persona toma el celular, toca la tarjeta para ver su rol, lo memoriza, toca «Ocultar y pasar» y le entrega el celular al siguiente. ¡Nadie más debe mirar la pantalla!",
  },
  {
    title: "4. Lo que verás en tu tarjeta",
    body: "Si eres inocente, verás la palabra secreta. Si eres impostor, no la conoces: solo verás que eres el impostor (y una pista vaga si esa opción está activa). Si no hay impostores, todos ven la palabra, pero nadie lo sabe.",
  },
  {
    title: "5. Ronda de pistas",
    body: "Empieza la persona que indique la app y siguen en círculo. Cada uno dice una palabra o frase corta relacionada con la palabra secreta, sin decirla. Los inocentes quieren demostrar que la conocen sin regalársela al impostor; el impostor debe disimular y deducirla.",
  },
  {
    title: "6. Debatan",
    body: "Cuando todos hayan hablado, discutan quién suena sospechoso. El temporizador (si lo activaste) marca el tiempo de debate. Cuando se pongan de acuerdo, toquen «Ir a votar».",
  },
  {
    title: "7. Voten",
    body: "Voten todos al mismo tiempo señalando a alguien y toquen el nombre del más votado. También pueden elegir «Creo que no hay impostor» si sospechan que esta ronda no tenía ninguno.",
  },
  {
    title: "8. Resultado",
    body: "Los inocentes ganan si descubren a todos los impostores (o aciertan que no había ninguno). Los impostores ganan si se salvan, si quedan en mayoría o si expulsan a un inocente. Si cae el impostor, tiene una última oportunidad: adivinar la palabra. Si la dice bien, ¡gana igual!",
  },
];

export default function HelpModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Cómo jugar"
      onClick={onClose}
    >
      <div
        className="pop flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-3xl border border-[var(--line)] bg-[var(--card)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h2 className="text-xl font-extrabold">¿Cómo se juega?</h2>
          <button className="chip" onClick={onClose} aria-label="Cerrar ayuda">
            ✕
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto px-5 pb-4">
          <p className="text-sm text-zinc-400">
            Una palabra secreta, un celular y la gran pregunta: ¿quién no sabe de qué hablamos?
          </p>
          {STEPS.map((s) => (
            <section key={s.title} className="rounded-2xl bg-[var(--card-2)] p-4">
              <h3 className="mb-1 font-bold text-violet-300">{s.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-300">{s.body}</p>
            </section>
          ))}
          <section className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
            <h3 className="mb-1 font-bold text-violet-200">Consejos</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
              <li>Inocentes: no sean demasiado obvios o el impostor adivinará la palabra.</li>
              <li>Impostor: escucha primero y da pistas parecidas a las de los demás.</li>
              <li>Con pocos jugadores, el máximo de impostores es menor para que el juego sea justo.</li>
              <li>Pueden crear su propia categoría con IA desde la configuración (si está activada).</li>
            </ul>
          </section>
        </div>
        <div className="p-5 pt-2">
          <button className="btn-primary" onClick={onClose}>
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
}
