interface GenerateFakeNewsInput {
  originalText: string;
  changesPrompt: string;
}

export interface GeneratedNewsContent {
  title: string;
  summary: string;
  body: string;
}

function getOpenRouterConfig() {
  const apiKey = process.env.OPENAI_ROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Define OPENAI_ROUTER_API_KEY en .env para generar noticias con IA.",
    );
  }

  const model =
    process.env.OPENROUTER_MODEL?.trim() || "google/gemini-2.5-flash-lite";

  return { apiKey, model };
}

function buildSystemPrompt(): string {
  return `Eres un redactor de noticias. Recibirás el texto de una noticia original y los detalles puntuales que debes cambiar.

Objetivo principal: la noticia resultante debe leerse como la original. Copia el texto tal cual en todo lo que no esté directamente afectado por los cambios.

Reglas estrictas:
- Conserva el mismo estilo, tono, longitud, estructura, orden de párrafos y voz periodística del original.
- Reutiliza las mismas frases y palabras del original siempre que sea posible. No reescribas por reescribir.
- Los cambios solicitados deben integrarse de forma orgánica y sutil: como si la noticia original ya hubiera sido escrita así desde el principio.
- Modifica solo lo mínimo indispensable para reflejar cada cambio (nombre, vehículo, lugar, cifra, etc.) y ajusta únicamente las palabras o frases que queden inconsistentes por ese cambio.
- No agregues información nueva, contexto extra, adjetivos, dramatismo ni conclusiones que no estén en el original.
- No elimines datos, citas, fechas, lugares ni hechos del original, salvo que el cambio lo exija de forma inevitable.
- El titular y la bajada deben reflejar los cambios con la misma sutileza: mínima intervención sobre el original.
- Escribe en el mismo idioma que la noticia original.
- Responde ÚNICAMENTE con un JSON válido, sin markdown ni texto extra, con esta forma:
{"title":"...","summary":"...","body":"..."}
- "title": titular casi idéntico al original, con el cambio integrado de forma natural.
- "summary": bajada o entradilla breve (1-2 oraciones), fiel al original.
- "body": cuerpo completo de la noticia con párrafos separados por \\n\\n, lo más parecido posible al original.`;
}

function buildUserPrompt(input: GenerateFakeNewsInput): string {
  return `CAMBIOS A APLICAR:
${input.changesPrompt.trim()}

NOTICIA ORIGINAL:
${input.originalText.trim()}`;
}

function parseGeneratedContent(raw: string): GeneratedNewsContent {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("La IA no devolvió un JSON válido.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("No se pudo interpretar la respuesta de la IA.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("title" in parsed) ||
    !("body" in parsed)
  ) {
    throw new Error("La respuesta de la IA no incluye título ni cuerpo.");
  }

  const record = parsed as Record<string, unknown>;
  const title = String(record.title ?? "").trim();
  const body = String(record.body ?? "").trim();
  const summary = String(record.summary ?? "").trim();

  if (!title || !body) {
    throw new Error("La IA generó una noticia incompleta.");
  }

  return { title, summary, body };
}

export async function generateFakeNewsWithAI(
  input: GenerateFakeNewsInput,
): Promise<GeneratedNewsContent> {
  const { apiKey, model } = getOpenRouterConfig();
  const referer =
    process.env.NGROK_URL?.trim() ??
    process.env.APP_URL?.trim() ??
    "http://localhost:3001";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": referer,
      "X-Title": "Notipip Fake News",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(input) },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `OpenRouter respondió con error ${response.status}${errorText ? `: ${errorText.slice(0, 200)}` : "."}`,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content?.trim()) {
    throw new Error("OpenRouter no devolvió contenido.");
  }

  return parseGeneratedContent(content);
}
