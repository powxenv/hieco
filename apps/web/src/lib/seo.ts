import heroImg from "../assets/hero.jpeg";
import { env } from "#/env";

type SeoInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
};

function toAbsoluteUrl(value: string): string {
  return new URL(value, env.VITE_APP_URL).toString();
}

export function createSeo(input: SeoInput) {
  const title = `${input.title} | Hieco`;
  const canonical = toAbsoluteUrl(input.path);
  const image = toAbsoluteUrl(input.image ?? heroImg);

  return {
    meta: [
      { title },
      { name: "description", content: input.description },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: input.description },
      { property: "og:type", content: input.type ?? "website" },
      { property: "og:url", content: canonical },
      { property: "og:image", content: image },
      { property: "og:site_name", content: "Hieco" },
      { property: "og:image:alt", content: title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: input.description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}
