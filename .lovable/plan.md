# Correção do cabeçalho institucional dos PDFs de folha de frequência

## Problema confirmado no código

Os três geradores desenham logos e textos com coordenadas fixas que se cruzam:

- **Modelo Gestão-SMS (contratados, modelo CER)**: o brasão central é desenhado de y=6 a y=20,4 mm no centro da página, exatamente onde ficam os textos centralizados "ESTADO DO PARÁ" (y=12), "PREFEITURA MUNICIPAL DE ORIXIMINÁ" (y=16) e "SECRETARIA MUNICIPAL DE SAÚDE" (y=20). Daí a sobreposição visível.
- **PDF Oficial — Contratados**: o mesmo brasão central (y=9 a 23,4) colide com "ESTADO DO PARÁ" (y=23,5); a linha "SECRETARIA MUNICIPAL DE SAÚDE" está comentada e o texto de título/mês transborda a moldura de 22 mm.
- **PDF Oficial — Efetivos**: cabeçalho com uma única logo à esquerda e textos alinhados à esquerda, sem as três colunas, sem logo da Saúde e sem a linha de unidade/vínculo/competência.

## Correção proposta

Criar um único desenhador de cabeçalho institucional para folhas de frequência (novo helper em `src/lib/`), usado pelos três modelos, com layout em 3 colunas calculadas a partir da largura da página:

```text
+----------------------------------------------------------------------+
| [logo         |      ESTADO DO PARÁ                    |      logo ] |
|  prefeitura]  |  PREFEITURA MUNICIPAL DE ORIXIMINÁ     |     saúde ] |
|               |  SECRETARIA MUNICIPAL DE SAÚDE         |             |
|               | UNIDADE - FREQUÊNCIA DOS X - MÊS MM/AAAA|            |
+----------------------------------------------------------------------+
                          (12 mm de folga)
```

- Colunas laterais com largura fixa (18 mm) reservada às logos; a coluna central recebe apenas a faixa entre elas, então o texto nunca cruza as imagens.
- Brasão central removido do meio do texto: o brasão passa a ser usado apenas como fallback da logo da prefeitura (coluna esquerda) quando não houver logotipo configurado.
- Bloco de texto centralizado na coluna do meio, com line-height uniforme e ajuste automático de fonte/quebra quando o nome da unidade é longo.
- Altura do cabeçalho calculada pelo conteúdo e devolvida pela função; a moldura/linha divisória e a tabela começam a partir dela, com 12 mm de margem de segurança.
- Linha de identificação da folha padronizada: `[UNIDADE] - FREQUÊNCIA DOS EFETIVOS|PRESTADORES - MÊS MÊS/ANO`, incluindo o modelo de Efetivos, que hoje não a exibe.

## Rodapé e assinaturas

- Manter a reserva de rodapé existente e garantir que o bloco de assinaturas (via `finalizarPdf`/`pdf-assinaturas`) fique abaixo da última linha da tabela, sem colidir com "Data da emissão"/paginação.
- No modelo de Efetivos, revisar o rodapé para não repetir a data de emissão em duas linhas.

## Arquivos afetados

- novo: `src/lib/pdf-cabecalho-folha.ts` (cabeçalho em 3 colunas reutilizável)
- `src/lib/pdf-folha-contratados-modelo-cer.ts`
- `src/lib/pdf-folha-contratados-oficial.ts`
- `src/lib/pdf-folha-efetivos-oficial.ts`

Sem alterações de dados, permissões ou regras de negócio — apenas layout de exportação.

## Verificação

Gerar os três PDFs com uma unidade de nome longo, converter as páginas em imagem e inspecionar visualmente logo/texto/tabela e o bloco de assinaturas antes de concluir.
