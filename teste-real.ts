import { mock, module } from "bun:test";
import path from "path";
import fs from "fs";

// Mock pdf-pipeline para salvar localmente
mock.module("@/lib/pdf-pipeline", () => ({
  finalizarPdf: async (doc: any, opts: any) => {
    const outPath = path.join(process.cwd(), "teste-real.pdf");
    doc.save(outPath);
    console.log("PDF salvo em", outPath);
  },
}));

async function main() {
  const { gerarFolhaEfetivosOficial } = await import("@/lib/pdf-folha-efetivos-oficial");

  await gerarFolhaEfetivosOficial({
    competencia: { mes: 8, ano: 2026 },
    unidades: [
      {
        codigo_unidade: "1.18.001",
        nome_unidade: "UPA ORIXIMINÁ",
        grupos: [
          {
            codigo_setor: "001",
            nome_setor: "ENFERMAGEM",
            itens: [
              {
                profissional: {
                  id: "1",
                  matricula: "5795",
                  nome: "DAIANE SOUZA DA CUNHA",
                  cargo: "AUX. SERV. GERAIS(I)",
                  setor: "ENFERMAGEM",
                  proj: 200,
                  h_p: 0,
                  c_h: 200,
                  jorn: 200,
                  situacao: "Falta informada ao RH (PAD)",
                },
                totais: {
                  dias_trabalhados: 0,
                  dias_falta: 0,
                  atestado: 0,
                  maternidade: 0,
                  he_50: 0,
                  he_100: 0,
                  ferias_terco: 0,
                  ferias_integral: 0,
                  sal_sub_h: 0,
                  adicional_noturno: 0,
                  aulas_suplementares: 0,
                  plantao: 0,
                  sobreaviso: 0,
                  incentivo: 0,
                },
              },
              {
                profissional: {
                  id: "2",
                  matricula: "337",
                  nome: "DARLIENE DA SILVA SOARES",
                  cargo: "TEC. EM ENFERMAGEM",
                  setor: "ENFERMAGEM",
                  proj: 0,
                  h_p: 0,
                  c_h: 0,
                  jorn: 0,
                  situacao: "Licença sem Vencimento",
                },
                totais: {},
              },
              {
                profissional: {
                  id: "3",
                  matricula: "339",
                  nome: "DENNEY LEITE CUNHA",
                  cargo: "AUX. DE ENFERMAGEM",
                  setor: "ENFERMAGEM",
                  proj: 30,
                  h_p: 0,
                  c_h: 200,
                  jorn: 200,
                  situacao: "Ativo",
                },
                totais: {
                  dias_trabalhados: 0,
                  dias_falta: 0,
                  atestado: 0,
                  maternidade: 0,
                  he_50: 0,
                  he_100: 0,
                  ferias_terco: 0,
                  ferias_integral: 0,
                  sal_sub_h: 0,
                  adicional_noturno: 0,
                  aulas_suplementares: 0,
                  plantao: 0,
                  sobreaviso: 0,
                  incentivo: 0,
                },
              },
            ],
          },
        ],
      },
    ],
    emitidoPor: "Sistema de Teste",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
