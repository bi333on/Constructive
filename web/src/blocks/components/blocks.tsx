import { cn } from "@/lib/utils";
import { bool, col, num, str } from "../types";
import { BlockButton, BlockImage, Container, Section, type BlockRenderProps } from "./common";

export function HeaderBlock({ props }: BlockRenderProps) {
  const showButton = bool(props, "showButton", true);
  return (
    <header
      className="w-full"
      style={{
        backgroundColor: col(props, "bg", "#ffffff"),
        color: col(props, "textColor", "#111827"),
      }}
    >
      <Container className="flex items-center justify-between gap-3 py-4">
        <span className="min-w-0 truncate text-lg font-bold">{str(props, "logo", "Логотип")}</span>
        {showButton && (
          <BlockButton bg={col(props, "buttonColor", "#2563eb")} fg={col(props, "buttonTextColor", "#ffffff")}>
            {str(props, "buttonText", "Начать")}
          </BlockButton>
        )}
      </Container>
    </header>
  );
}

export function HeroBlock({ props }: BlockRenderProps) {
  const align = str(props, "align", "center");
  const accent = col(props, "accent", "#2563eb");
  const textColor = col(props, "textColor", "#ffffff");
  const paddingY = num(props, "paddingY", 96);
  const showSecondary = bool(props, "showSecondary", true);
  const showImage = bool(props, "showImage", false);

  return (
    <section
      className="w-full"
      style={{
        backgroundColor: col(props, "bg", "#111827"),
        color: textColor,
        paddingTop: paddingY,
        paddingBottom: paddingY,
      }}
    >
      <Container
        className={cn(
          "max-w-3xl text-center",
          align === "left" && "text-left",
          align === "right" && "text-right",
        )}
      >
        {str(props, "eyebrow") && (
          <div className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: accent }}>
            {str(props, "eyebrow")}
          </div>
        )}
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">{str(props, "title")}</h1>
        <p className="mt-5 text-lg opacity-80">{str(props, "subtitle")}</p>
        <div
          className={cn(
            "mt-8 flex flex-wrap gap-4",
            align === "center" && "justify-center",
            align === "right" && "justify-end",
          )}
        >
          <BlockButton bg={accent} fg="#ffffff">
            {str(props, "primaryText", "Начать")}
          </BlockButton>
          {showSecondary && (
            <BlockButton bg="transparent" fg={textColor} outline>
              {str(props, "secondaryText", "Подробнее")}
            </BlockButton>
          )}
        </div>
        {showImage && (
          <div className="mt-10">
            <BlockImage src={str(props, "image")} alt={str(props, "title")} aspect="video" />
          </div>
        )}
      </Container>
    </section>
  );
}

export function FeaturesBlock({ props }: BlockRenderProps) {
  const accent = col(props, "accent", "#2563eb");
  const items = [1, 2, 3].map((i) => ({
    title: str(props, `f${i}Title`),
    text: str(props, `f${i}Text`),
  }));

  return (
    <Section props={props} className="py-20">
      <Container>
        <h2 className="text-center text-3xl font-bold">{str(props, "title")}</h2>
        <p className="mt-3 text-center opacity-70">{str(props, "subtitle")}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="rounded-2xl p-7" style={{ backgroundColor: `${accent}14` }}>
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg text-base font-bold"
                style={{ backgroundColor: accent, color: "#ffffff" }}
              >
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm opacity-75">{it.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function TextImageBlock({ props }: BlockRenderProps) {
  const reverse = bool(props, "reverse", false);
  const accent = col(props, "accent", "#2563eb");

  return (
    <Section props={props} className="py-20">
      <Container className="grid items-center gap-12 md:grid-cols-2">
        <div className={cn(reverse && "md:order-2")}>
          <h2 className="text-3xl font-bold">{str(props, "title")}</h2>
          <div className="mt-4 h-1 w-12 rounded-full" style={{ backgroundColor: accent }} />
          <p className="mt-5 whitespace-pre-line opacity-80">{str(props, "text")}</p>
        </div>
        <div className={cn(reverse && "md:order-1")}>
          <BlockImage src={str(props, "image")} alt={str(props, "title")} aspect="square" />
        </div>
      </Container>
    </Section>
  );
}

export function TextBlock({ props }: BlockRenderProps) {
  const align = str(props, "align", "left");
  const paddingY = num(props, "paddingY", 64);

  return (
    <section
      className="w-full"
      style={{
        backgroundColor: col(props, "bg", "#ffffff"),
        color: col(props, "textColor", "#111827"),
        paddingTop: paddingY,
        paddingBottom: paddingY,
      }}
    >
      <Container className="max-w-3xl">
        <h2
          className={cn(
            "text-3xl font-bold",
            align === "center" && "text-center",
            align === "right" && "text-right",
          )}
        >
          {str(props, "title")}
        </h2>
        <p
          className={cn(
            "mt-4 whitespace-pre-line opacity-80",
            align === "center" && "text-center",
            align === "right" && "text-right",
          )}
        >
          {str(props, "text")}
        </p>
      </Container>
    </section>
  );
}

export function GalleryBlock({ props }: BlockRenderProps) {
  const cols = str(props, "columns", "3");
  const images = [1, 2, 3, 4, 5, 6].map((i) => str(props, `img${i}`)).filter(Boolean);

  return (
    <Section props={props} className="py-20">
      <Container>
        <h2 className="text-center text-3xl font-bold">{str(props, "title")}</h2>
        {images.length > 0 ? (
          <div
            className={cn(
              "mt-10 grid gap-4",
              cols === "2" && "grid-cols-2",
              cols === "4" && "grid-cols-2 md:grid-cols-4",
              (cols === "3" || !cols) && "grid-cols-2 md:grid-cols-3",
            )}
          >
            {images.map((src, i) => (
              <BlockImage key={i} src={src} alt="" aspect="square" />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-sm text-neutral-400">
            Добавьте изображения в настройках блока
          </div>
        )}
      </Container>
    </Section>
  );
}

export function PricingBlock({ props }: BlockRenderProps) {
  const accent = col(props, "accent", "#2563eb");
  const plans = [1, 2, 3].map((i) => ({
    name: str(props, `p${i}Name`),
    price: str(props, `p${i}Price`),
    features: str(props, `p${i}Features`)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  }));

  return (
    <Section props={props} className="py-20">
      <Container>
        <h2 className="text-center text-3xl font-bold">{str(props, "title")}</h2>
        <p className="mt-3 text-center opacity-70">{str(props, "subtitle")}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="rounded-2xl border p-7"
              style={{ borderColor: `${accent}44` }}
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-2 text-3xl font-bold" style={{ color: accent }}>
                {plan.price}
              </div>
              <ul className="mt-5 space-y-2 text-sm opacity-80">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span style={{ color: accent }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <BlockButton bg={accent} fg="#ffffff">
                  {str(props, "buttonText", "Выбрать")}
                </BlockButton>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function FaqBlock({ props }: BlockRenderProps) {
  const items = [1, 2, 3].map((i) => ({
    q: str(props, `q${i}`),
    a: str(props, `a${i}`),
  }));

  return (
    <Section props={props} className="py-20">
      <Container className="max-w-3xl">
        <h2 className="text-center text-3xl font-bold">{str(props, "title")}</h2>
        <div className="mt-8 space-y-3">
          {items.map((it, i) => (
            <details key={i} className="rounded-xl border border-neutral-200 p-5">
              <summary className="cursor-pointer list-none font-semibold">{it.q}</summary>
              <p className="mt-2 text-sm opacity-80">{it.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function CtaBlock({ props }: BlockRenderProps) {
  return (
    <Section props={props} className="py-20 text-center">
      <Container>
        <h2 className="text-3xl font-bold">{str(props, "title")}</h2>
        <p className="mt-3 opacity-80">{str(props, "subtitle")}</p>
        <div className="mt-8">
          <BlockButton bg={col(props, "buttonColor", "#ffffff")} fg={col(props, "buttonTextColor", "#2563eb")}>
            {str(props, "buttonText", "Связаться")}
          </BlockButton>
        </div>
      </Container>
    </Section>
  );
}

export function FooterBlock({ props }: BlockRenderProps) {
  return (
    <footer
      className="w-full py-12"
      style={{
        backgroundColor: col(props, "bg", "#111827"),
        color: col(props, "textColor", "#9ca3af"),
      }}
    >
      <Container>
        <div className="max-w-sm">
          <div className="text-lg font-bold" style={{ color: "#ffffff" }}>
            {str(props, "brand", "Логотип")}
          </div>
          <p className="mt-2 text-sm">{str(props, "text")}</p>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-sm">{str(props, "copyright")}</div>
      </Container>
    </footer>
  );
}

export function StatsBlock({ props }: BlockRenderProps) {
  const accent = col(props, "accent", "#2563eb");
  const items = [1, 2, 3].map((i) => ({
    value: str(props, `s${i}Value`),
    label: str(props, `s${i}Label`),
  }));

  return (
    <Section props={props} className="py-16 text-center">
      <Container>
        <h2 className="text-3xl font-bold">{str(props, "title")}</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {items.map((it, i) => (
            <div key={i}>
              <div className="text-4xl font-bold" style={{ color: accent }}>
                {it.value}
              </div>
              <div className="mt-2 text-sm opacity-75">{it.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function TestimonialsBlock({ props }: BlockRenderProps) {
  const accent = col(props, "accent", "#2563eb");
  const items = [1, 2, 3].map((i) => ({
    text: str(props, `t${i}Text`),
    name: str(props, `t${i}Name`),
    role: str(props, `t${i}Role`),
  }));

  return (
    <Section props={props} className="py-20">
      <Container>
        <h2 className="text-center text-3xl font-bold">{str(props, "title")}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 p-6">
              <div className="text-2xl" style={{ color: accent }}>“</div>
              <p className="mt-2 text-sm opacity-80">{it.text}</p>
              <div className="mt-4 border-t border-neutral-200 pt-3">
                <div className="font-semibold">{it.name}</div>
                <div className="text-xs opacity-60">{it.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function TeamBlock({ props }: BlockRenderProps) {
  const accent = col(props, "accent", "#2563eb");
  const members = [1, 2, 3].map((i) => ({
    name: str(props, `m${i}Name`),
    role: str(props, `m${i}Role`),
  }));

  return (
    <Section props={props} className="py-20">
      <Container>
        <h2 className="text-center text-3xl font-bold">{str(props, "title")}</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {members.map((m, i) => (
            <div key={i} className="text-center">
              <div
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                {m.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="mt-4 font-semibold">{m.name}</div>
              <div className="mt-1 text-sm opacity-60">{m.role}</div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function StepsBlock({ props }: BlockRenderProps) {
  const accent = col(props, "accent", "#2563eb");
  const steps = [1, 2, 3].map((i) => ({
    title: str(props, `st${i}Title`),
    text: str(props, `st${i}Text`),
  }));

  return (
    <Section props={props} className="py-20">
      <Container>
        <h2 className="text-center text-3xl font-bold">{str(props, "title")}</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="relative rounded-2xl border border-neutral-200 p-6">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                {i + 1}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm opacity-75">{s.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function ContactBlock({ props }: BlockRenderProps) {
  const accent = col(props, "accent", "#2563eb");
  const rows = [
    { label: "Адрес", value: str(props, "address") },
    { label: "Телефон", value: str(props, "phone") },
    { label: "Email", value: str(props, "email") },
  ];

  return (
    <Section props={props} className="py-20">
      <Container className="max-w-3xl text-center">
        <h2 className="text-3xl font-bold">{str(props, "title")}</h2>
        <div className="mt-10 space-y-3">
          {rows.map((r) => (
            <div key={r.label} className="rounded-xl border border-neutral-200 p-4">
              <div className="text-xs uppercase tracking-wide opacity-60">{r.label}</div>
              <div className="mt-1 font-medium">{r.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <BlockButton bg={accent} fg="#ffffff">
            {str(props, "buttonText", "Написать нам")}
          </BlockButton>
        </div>
      </Container>
    </Section>
  );
}
