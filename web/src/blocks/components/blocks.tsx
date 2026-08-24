import { cn } from "@/lib/utils";
import { richTextToHtml } from "@/lib/rich";
import { Inline } from "@/editor/inline";
import { bool, col, num, str } from "../types";
import { BlockButton, BlockImage, Container, Section, type BlockRenderProps } from "./common";

export function HeaderBlock({ props, interactive }: BlockRenderProps) {
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
        <Inline as="span" fieldKeys={["logo"]} className="min-w-0 truncate text-lg font-bold">
          {str(props, "logo", "Логотип")}
        </Inline>
        {showButton && (
          <Inline fieldKeys={["buttonText", "buttonUrl", "buttonColor", "buttonTextColor"]}>
            <BlockButton
              bg={col(props, "buttonColor", "#2563eb")}
              fg={col(props, "buttonTextColor", "#ffffff")}
              href={str(props, "buttonUrl")}
              interactive={interactive}
            >
              {str(props, "buttonText", "Начать")}
            </BlockButton>
          </Inline>
        )}
      </Container>
    </header>
  );
}

export function HeroBlock({ props, interactive }: BlockRenderProps) {
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
          <Inline
            as="div"
            fieldKeys={["eyebrow"]}
            className="mb-3 text-sm font-semibold uppercase tracking-widest"
            style={{ color: accent }}
          >
            {str(props, "eyebrow")}
          </Inline>
        )}
        <Inline as="h1" fieldKeys={["title"]} className="text-4xl font-bold leading-tight md:text-5xl">
          {str(props, "title")}
        </Inline>
        <Inline as="p" fieldKeys={["subtitle"]} className="mt-5 text-lg opacity-80">
          {str(props, "subtitle")}
        </Inline>
        <div
          className={cn(
            "mt-8 flex flex-wrap gap-4",
            align === "center" && "justify-center",
            align === "right" && "justify-end",
          )}
        >
          <Inline fieldKeys={["primaryText", "primaryUrl", "accent"]}>
            <BlockButton bg={accent} fg="#ffffff" href={str(props, "primaryUrl")} interactive={interactive}>
              {str(props, "primaryText", "Начать")}
            </BlockButton>
          </Inline>
          {showSecondary && (
            <Inline fieldKeys={["secondaryText", "secondaryUrl"]}>
              <BlockButton
                bg="transparent"
                fg={textColor}
                outline
                href={str(props, "secondaryUrl")}
                interactive={interactive}
              >
                {str(props, "secondaryText", "Подробнее")}
              </BlockButton>
            </Inline>
          )}
        </div>
        {showImage && (
          <Inline as="div" fieldKeys={["image"]} className="mt-10">
            <BlockImage src={str(props, "image")} alt={str(props, "title")} aspect="video" />
          </Inline>
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
        <Inline as="h2" fieldKeys={["title"]} className="text-center text-3xl font-bold">
          {str(props, "title")}
        </Inline>
        <Inline as="p" fieldKeys={["subtitle"]} className="mt-3 text-center opacity-70">
          {str(props, "subtitle")}
        </Inline>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="rounded-2xl p-7" style={{ backgroundColor: `${accent}14` }}>
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg text-base font-bold"
                style={{ backgroundColor: accent, color: "#ffffff" }}
              >
                {i + 1}
              </div>
              <Inline as="h3" fieldKeys={[`f${i + 1}Title`]} className="text-lg font-semibold">
                {it.title}
              </Inline>
              <Inline as="p" fieldKeys={[`f${i + 1}Text`]} className="mt-2 text-sm opacity-75">
                {it.text}
              </Inline>
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
          <Inline as="h2" fieldKeys={["title"]} className="text-3xl font-bold">
            {str(props, "title")}
          </Inline>
          <div className="mt-4 h-1 w-12 rounded-full" style={{ backgroundColor: accent }} />
          <Inline as="p" fieldKeys={["text"]} className="mt-5 whitespace-pre-line opacity-80">
            {str(props, "text")}
          </Inline>
        </div>
        <Inline as="div" fieldKeys={["image"]} className={cn(reverse && "md:order-1")}>
          <BlockImage src={str(props, "image")} alt={str(props, "title")} aspect="square" />
        </Inline>
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
        <Inline
          as="h2"
          fieldKeys={["title"]}
          className={cn(
            "text-3xl font-bold",
            align === "center" && "text-center",
            align === "right" && "text-right",
          )}
        >
          {str(props, "title")}
        </Inline>
        <Inline
          as="p"
          fieldKeys={["text"]}
          className={cn(
            "mt-4 whitespace-pre-line opacity-80",
            align === "center" && "text-center",
            align === "right" && "text-right",
          )}
        >
          {str(props, "text")}
        </Inline>
      </Container>
    </section>
  );
}

export function GalleryBlock({ props }: BlockRenderProps) {
  const cols = str(props, "columns", "3");
  const images = [1, 2, 3, 4, 5, 6]
    .map((i) => ({ i, src: str(props, `img${i}`) }))
    .filter((x) => x.src);

  return (
    <Section props={props} className="py-20">
      <Container>
        <Inline as="h2" fieldKeys={["title"]} className="text-center text-3xl font-bold">
          {str(props, "title")}
        </Inline>
        {images.length > 0 ? (
          <div
            className={cn(
              "mt-10 grid gap-4",
              cols === "2" && "grid-cols-2",
              cols === "4" && "grid-cols-2 md:grid-cols-4",
              (cols === "3" || !cols) && "grid-cols-2 md:grid-cols-3",
            )}
          >
            {images.map(({ i, src }) => (
              <Inline as="div" key={i} fieldKeys={[`img${i}`]}>
                <BlockImage src={src} alt="" aspect="square" />
              </Inline>
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

export function PricingBlock({ props, interactive }: BlockRenderProps) {
  const accent = col(props, "accent", "#2563eb");
  const plans = [1, 2, 3].map((i) => ({
    name: str(props, `p${i}Name`),
    price: str(props, `p${i}Price`),
    features: str(props, `p${i}Features`)
      .split(/\n|<br\s*\/?>/i)
      .map((s) => s.trim())
      .filter(Boolean),
  }));

  return (
    <Section props={props} className="py-20">
      <Container>
        <Inline as="h2" fieldKeys={["title"]} className="text-center text-3xl font-bold">
          {str(props, "title")}
        </Inline>
        <Inline as="p" fieldKeys={["subtitle"]} className="mt-3 text-center opacity-70">
          {str(props, "subtitle")}
        </Inline>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="rounded-2xl border p-7"
              style={{ borderColor: `${accent}44` }}
            >
              <Inline as="h3" fieldKeys={[`p${i + 1}Name`]} className="text-lg font-semibold">
                {plan.name}
              </Inline>
              <Inline
                as="div"
                fieldKeys={[`p${i + 1}Price`]}
                className="mt-2 text-3xl font-bold"
                style={{ color: accent }}
              >
                {plan.price}
              </Inline>
              <Inline as="ul" fieldKeys={[`p${i + 1}Features`]} className="mt-5 space-y-2 text-sm opacity-80">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span style={{ color: accent }}>✓</span>
                    <span dangerouslySetInnerHTML={{ __html: richTextToHtml(f) }} />
                  </li>
                ))}
              </Inline>
              <div className="mt-6">
                <Inline fieldKeys={["buttonText", "buttonUrl", "accent"]}>
                  <BlockButton bg={accent} fg="#ffffff" href={str(props, "buttonUrl")} interactive={interactive}>
                    {str(props, "buttonText", "Выбрать")}
                  </BlockButton>
                </Inline>
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
        <Inline as="h2" fieldKeys={["title"]} className="text-center text-3xl font-bold">
          {str(props, "title")}
        </Inline>
        <div className="mt-8 space-y-3">
          {items.map((it, i) => (
            <details key={i} className="rounded-xl border border-neutral-200 p-5">
              <Inline as="summary" fieldKeys={[`q${i + 1}`]} className="cursor-pointer list-none font-semibold">
                {it.q}
              </Inline>
              <Inline as="p" fieldKeys={[`a${i + 1}`]} className="mt-2 text-sm opacity-80">
                {it.a}
              </Inline>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function CtaBlock({ props, interactive }: BlockRenderProps) {
  return (
    <Section props={props} className="py-20 text-center">
      <Container>
        <Inline as="h2" fieldKeys={["title"]} className="text-3xl font-bold">
          {str(props, "title")}
        </Inline>
        <Inline as="p" fieldKeys={["subtitle"]} className="mt-3 opacity-80">
          {str(props, "subtitle")}
        </Inline>
        <div className="mt-8">
          <Inline fieldKeys={["buttonText", "buttonUrl", "buttonColor", "buttonTextColor"]}>
            <BlockButton
              bg={col(props, "buttonColor", "#ffffff")}
              fg={col(props, "buttonTextColor", "#2563eb")}
              href={str(props, "buttonUrl")}
              interactive={interactive}
            >
              {str(props, "buttonText", "Связаться")}
            </BlockButton>
          </Inline>
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
          <Inline as="div" fieldKeys={["brand"]} className="text-lg font-bold" style={{ color: "#ffffff" }}>
            {str(props, "brand", "Логотип")}
          </Inline>
          <Inline as="p" fieldKeys={["text"]} className="mt-2 text-sm">
            {str(props, "text")}
          </Inline>
        </div>
        <Inline as="div" fieldKeys={["copyright"]} className="mt-8 border-t border-white/10 pt-6 text-sm">
          {str(props, "copyright")}
        </Inline>
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
        <Inline as="h2" fieldKeys={["title"]} className="text-3xl font-bold">
          {str(props, "title")}
        </Inline>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {items.map((it, i) => (
            <div key={i}>
              <Inline as="div" fieldKeys={[`s${i + 1}Value`]} className="text-4xl font-bold" style={{ color: accent }}>
                {it.value}
              </Inline>
              <Inline as="div" fieldKeys={[`s${i + 1}Label`]} className="mt-2 text-sm opacity-75">
                {it.label}
              </Inline>
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
        <Inline as="h2" fieldKeys={["title"]} className="text-center text-3xl font-bold">
          {str(props, "title")}
        </Inline>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 p-6">
              <div className="text-2xl" style={{ color: accent }}>“</div>
              <Inline as="p" fieldKeys={[`t${i + 1}Text`]} className="mt-2 text-sm opacity-80">
                {it.text}
              </Inline>
              <div className="mt-4 border-t border-neutral-200 pt-3">
                <Inline as="div" fieldKeys={[`t${i + 1}Name`]} className="font-semibold">
                  {it.name}
                </Inline>
                <Inline as="div" fieldKeys={[`t${i + 1}Role`]} className="text-xs opacity-60">
                  {it.role}
                </Inline>
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
        <Inline as="h2" fieldKeys={["title"]} className="text-center text-3xl font-bold">
          {str(props, "title")}
        </Inline>
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
              <Inline as="div" fieldKeys={[`m${i + 1}Name`]} className="mt-4 font-semibold">
                {m.name}
              </Inline>
              <Inline as="div" fieldKeys={[`m${i + 1}Role`]} className="mt-1 text-sm opacity-60">
                {m.role}
              </Inline>
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
        <Inline as="h2" fieldKeys={["title"]} className="text-center text-3xl font-bold">
          {str(props, "title")}
        </Inline>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="relative rounded-2xl border border-neutral-200 p-6">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                {i + 1}
              </div>
              <Inline as="h3" fieldKeys={[`st${i + 1}Title`]} className="mt-4 text-lg font-semibold">
                {s.title}
              </Inline>
              <Inline as="p" fieldKeys={[`st${i + 1}Text`]} className="mt-2 text-sm opacity-75">
                {s.text}
              </Inline>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function ContactBlock({ props, interactive }: BlockRenderProps) {
  const accent = col(props, "accent", "#2563eb");
  const rows = [
    { label: "Адрес", key: "address" },
    { label: "Телефон", key: "phone" },
    { label: "Email", key: "email" },
  ];

  return (
    <Section props={props} className="py-20">
      <Container className="max-w-3xl text-center">
        <Inline as="h2" fieldKeys={["title"]} className="text-3xl font-bold">
          {str(props, "title")}
        </Inline>
        <div className="mt-10 space-y-3">
          {rows.map((r) => (
            <div key={r.key} className="rounded-xl border border-neutral-200 p-4">
              <div className="text-xs uppercase tracking-wide opacity-60">{r.label}</div>
              <Inline as="div" fieldKeys={[r.key]} className="mt-1 font-medium">
                {str(props, r.key)}
              </Inline>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Inline fieldKeys={["buttonText", "buttonUrl", "accent"]}>
            <BlockButton bg={accent} fg="#ffffff" href={str(props, "buttonUrl")} interactive={interactive}>
              {str(props, "buttonText", "Написать нам")}
            </BlockButton>
          </Inline>
        </div>
      </Container>
    </Section>
  );
}

export function SpacerBlock({ props }: BlockRenderProps) {
  const height = num(props, "height", 48);
  return (
    <Inline as="div" fieldKeys={["height"]} className="w-full" style={{ height }}>
      {""}
    </Inline>
  );
}

export function ColumnsBlock({ props }: BlockRenderProps) {
  const n = parseInt(str(props, "columns", "2"), 10) || 2;
  const count = Math.max(2, Math.min(4, n));
  const cols = [1, 2, 3, 4].slice(0, count);

  return (
    <Section props={props} className="py-20">
      <Container>
        <div
          className={cn(
            "grid gap-8",
            count === 2 && "md:grid-cols-2",
            count === 3 && "md:grid-cols-3",
            count === 4 && "md:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {cols.map((i) => (
            <div key={i}>
              <Inline as="h3" fieldKeys={[`c${i}Title`]} className="text-lg font-semibold">
                {str(props, `c${i}Title`)}
              </Inline>
              <Inline as="p" fieldKeys={[`c${i}Text`]} className="mt-2 text-sm opacity-80">
                {str(props, `c${i}Text`)}
              </Inline>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
