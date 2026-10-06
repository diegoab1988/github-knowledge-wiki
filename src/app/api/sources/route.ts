import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { getSources, getStats } from "@/lib/wiki";

const execFileAsync = promisify(execFile);

export async function GET() {
  try {
    const sources = getSources();
    const stats = getStats();
    return NextResponse.json({ sources, stats });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao consultar fontes." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body?.url?.trim();

    if (!url) {
      return NextResponse.json(
        { error: "A URL do repositório GitHub é obrigatória." },
        { status: 400 }
      );
    }

    const projectRoot = process.cwd();

    // Executa a adição e ingestão da fonte via Python
    const { stdout, stderr } = await execFileAsync(
      "python",
      ["-m", "scripts.wiki.add", url],
      {
        cwd: projectRoot,
        timeout: 60000,
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      }
    );

    // Carrega dados atualizados após a sincronização
    const sources = getSources();
    const stats = getStats();

    return NextResponse.json({
      success: true,
      message: "Repositório conectado e conhecimento ingerido com sucesso!",
      stdout,
      sources,
      stats,
    });
  } catch (error: any) {
    console.error("Erro na ingestão:", error);
    const errorMessage = error?.stderr || error?.message || "Erro durante a sincronização da fonte.";
    return NextResponse.json(
      {
        success: false,
        error: `Falha ao processar repositório: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
