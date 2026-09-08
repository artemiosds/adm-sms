# Painel de Gestão das Aprovações

Evoluir a página atual `Aprovações institucionais` para um painel administrativo organizado por competência, sem alterar banco, permissões, fluxos de aprovação/rejeição, anexos, trilha ou o modal de linhas.

## O que muda na tela

### 1. Cabeçalho com a competência em destaque
- Título e subtítulo mantidos.
- Bloco de destaque com seletor de competência (mês/ano por extenso, ordem decrescente) e, ao lado de cada opção, a quantidade de envios daquela competência.
- Ao abrir a página, a competência ativa vem pré-selecionada; se não houver, a mais recente com envios.
- Indicador de situação da competência: processada / em análise / com pendências / com rejeições / sem frequências enviadas, calculado dos dados reais.

### 2. Cards de resumo (dados reais da competência selecionada)
Total enviadas, Em análise, Aprovadas, Rejeitadas, Com pendências, Total de profissionais (soma de `total_profissionais`), Total de unidades distintas.
Clicar em um card aplica o filtro de status correspondente.

### 3. Filtros
- Busca rápida por unidade/setor (texto).
- Unidade (apenas unidades com registros na competência), Tipo (efetivos/contratados), Status (com contadores por opção), período de envio (data inicial/final).
- Botão "Limpar filtros"; todos os filtros combinam entre si e ficam refletidos na URL, para o link ser compartilhável.
- Filtro inicial passa a ser "Todas" (nunca mais tela vazia por causa de "Pendentes"). Quando um filtro não retorna nada, mensagem clara + botão "Ver todas as frequências".

### 4. Tabela
- Colunas: Unidade (com setor e indicador de anexos), Competência, Tipo, Profissionais, Status, Enviada em, Ações.
- Ação principal "Abrir" (mesmos destinos de hoje) e as demais — Anexos, Trilha, Linhas — recolhidas em um menu "⋮ Mais ações".
- Ações de decisão (Analisar, Aprovar, Retornar, Rejeitar) continuam visíveis conforme permissão e status, como hoje.
- Cabeçalho fixo durante a rolagem e paginação de 20 em 20 com o contador "1–20 de N".

### 5. Visualização agrupada por unidade
Alternador "Tabela | Agrupada por unidade". No modo agrupado, cada unidade vira um bloco recolhível com nº de envios, nº de profissionais e a situação predominante; ao expandir, aparecem as frequências (tipo, setor, profissionais, status) com as mesmas ações.

### 6. Responsividade e visual
- Desktop/notebook usam a largura toda; em tablet e celular a tabela vira cards.
- Mantida a identidade visual atual: fundo claro, cards discretos, bordas suaves, badges de status já padronizados no sistema (sem cores novas fora do padrão).

### 7. Trilha de auditoria
Mesma consulta e mesma lógica; apresentação reorganizada em linha do tempo legível — quem enviou/analisou/aprovou/rejeitou, quando, e o motivo registrado.

## Detalhes técnicos
- Arquivo principal: `src/routes/_authenticated/aprovacoes.tsx`; a tela grande é quebrada em componentes sob `src/components/aprovacoes/` (resumo, filtros, tabela, agrupamento).
- A consulta atual de `frequencias` passa a filtrar por `competencia_unidades.competencia_id` no servidor (evita misturar meses e reduz volume); os contadores por status saem de uma consulta agregada leve da mesma competência. Escopo por unidade do usuário e RLS permanecem intocados.
- Lista de competências vem de `competencias` + contagem de envios por competência.
- Filtros persistidos em search params validados com Zod (`competencia`, `status`, `unidade`, `tipo`, `q`, `de`, `ate`, `pagina`, `visao`).
- Nenhuma migração, nenhuma alteração em server functions, nenhum ajuste em permissões.

## Fora do escopo
Busca por nome de profissional não é aplicada nesta etapa na listagem principal: as frequências são por unidade/setor e os nomes ficam nas linhas da folha; incluir isso exigiria consulta adicional às linhas. A busca cobre unidade e setor. Posso incluir a busca por profissional depois, como passo separado.
