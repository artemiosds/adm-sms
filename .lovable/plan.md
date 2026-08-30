# Storage centralizado no Cloudflare R2 (com leitura retrocompatível)

Objetivo: todo upload NOVO passa a ir para o Cloudflare R2; todo arquivo ANTIGO continua
sendo aberto normalmente do Supabase Storage, sem migração de dados e sem mudança visual
para o usuário.

## Como fica o fluxo

Hoje o navegador envia o arquivo direto para o bucket do Supabase e o banco guarda apenas
o caminho. As chaves do R2 são secretas e não podem ir para o navegador, então o envio
passa a ter um passo intermediário no servidor:

```text
Botão "Anexar"  ->  server function pede URL de upload assinada ao R2
                ->  navegador envia o arquivo direto para o R2 (barra de progresso igual)
                ->  server function grava metadados no banco (prefixo r2:)
```

Na leitura, um único helper decide a origem:
- caminho salvo começa com `r2:` (ou é URL do domínio público R2) -> resolve no R2
- qualquer outro caminho / URL `supabase.co/storage` -> resolve no Supabase (comportamento atual)

## Variáveis a cadastrar (secrets do projeto)

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL` (opcional — se vazio, o sistema usa sempre URL assinada de 5 min)

Todas server-only. Nenhuma delas é exposta ao frontend.

## Escopo dos uploads migrados

1. Tramitação de folha — modal de envio para análise (Efetivos e Contratados), anexos de submissão.
2. Ocorrências / frequência individual — atestados, licenças, afastamentos e justificativas por servidor.
3. Painel de aprovações — modal de anexo e visualização dos documentos da validação.
4. Cadastros / perfis — foto do profissional e documentos comprobatórios.

Assinaturas institucionais e PDFs gerados internamente ficam de fora nesta etapa (podem
entrar depois, sem mudança de arquitetura).

## Detalhes técnicos

**Dependência:** `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (compatíveis com o
runtime de servidor usado no projeto).

**`src/lib/storage-r2.server.ts`** (server-only, nunca importado por componente):
- cliente S3 criado dentro dos handlers, endpoint `https://<account>.r2.cloudflarestorage.com`, região `auto`
- `uploadArquivo(bytes, folder, customFileName?)` — envio direto do servidor (uso interno/PDFs)
- `criarUrlUpload(folder, fileName, mime)` — presigned PUT para envio pelo navegador
- `criarUrlLeitura(key)` — presigned GET (5 min) ou URL pública quando `R2_PUBLIC_URL` existir
- `removerArquivo(key)`

**`src/lib/storage-r2.functions.ts`** (server functions autenticadas, `requireSupabaseAuth`):
- `solicitarUploadR2` — valida MIME/tamanho e devolve `{ url, key }`
- `resolverUrlDocumento` — recebe caminho salvo e devolve URL final

**`src/lib/storage-universal.ts`** (client-safe):
- `obterUrlVisualizacao(urlOuPath)` — decide Supabase (signed URL atual) x R2 (chama a server fn)
- `isR2(path)` / `isLegadoSupabase(path)`
- reaproveita as validações já existentes em `anexos-linha.ts` (PDF/JPG/PNG/WEBP, 10 MB) e
  `foto-profissional.ts` (5 MB, imagens)

**Convenção de chave no banco:** `r2:{secretaria}/{unidade}/{pasta}/{entidade}/{uuid}.{ext}`,
mantendo o mesmo particionamento hoje usado no bucket `documentos`. A coluna `storage_path`
não muda de tipo; só passa a aceitar o prefixo.

**Pontos de código alterados:**
- `src/components/frequencias/anexos-entidade.tsx` — troca o `supabase.storage.upload` pelo fluxo presigned; `registrarAnexoLinha` continua gravando os metadados
- `src/lib/frequencias.functions.ts` (`listarAnexosLinha`, removidos, exclusão) e `src/lib/listar-anexos.functions.ts` — geração de URL passa pelo helper universal
- `src/components/aprovacoes/UploadAnexoModal.tsx` — mesmo fluxo de upload
- `src/lib/foto-profissional.ts` — upload da foto no R2; `useFotoAssinada` passa a usar `obterUrlVisualizacao` (mantém suporte a `http(s)://` e a caminhos antigos do bucket `avatars`)
- `src/lib/anexos-linha.ts` — `montarCaminhoAnexo` ganha o prefixo `r2:`
- rota de purga (`api/public/hooks/purgar-documentos.ts`) — apaga no R2 ou no Supabase conforme o prefixo

**Sem migração de dados.** Nenhum arquivo antigo é movido; os registros existentes seguem
apontando para o Supabase e continuam abrindo.

## Validação

- Anexar documento em folha de Efetivos e Contratados, conferir que abre pelo botão "Ver"
- Abrir um anexo antigo (pré-mudança) e confirmar que continua abrindo
- Anexo pelo painel de Aprovações e foto de profissional
- Lixeira/restauração e purga continuam funcionando nos dois tipos de caminho
