# Correção da página de Auditoria

## O que está acontecendo

A página de Auditoria abre, mas nenhuma das abas mostra dados. O banco tem 16.483 registros de auditoria (de 10/07 a 04/09), então os dados existem — o que falta é a permissão de leitura.

Duas causas, ambas no banco:

1. A tabela de registros de auditoria não tem nenhuma permissão de leitura liberada para o aplicativo. Só existe regra de gravação.
2. Nenhum acesso de leitura/gravação foi concedido aos perfis usados pelo aplicativo, o que também faz falhar o registro de ações feitas pela tela (exportações, downloads).

Efeito prático: "Trilha de operações", "Downloads e extrações" e a linha do tempo ficam sempre vazias, e a exportação em CSV avisa "Nada para exportar".

## Correção proposta

1. Conceder ao aplicativo o acesso necessário à tabela de auditoria (leitura para usuários autenticados, gravação para o registro de ações).
2. Criar a regra de leitura: só enxerga a trilha quem for Administrador Master ou tiver a permissão "auditoria.visualizar". Ninguém mais.
3. Manter a gravação como está (qualquer usuário autenticado registra suas próprias ações), sem permitir alteração ou exclusão de registros — a trilha continua imutável.
4. Conferir na tela, depois da correção, que as abas listam registros e que a exportação em CSV funciona.

## Detalhes técnicos

- Migração em `supabase/migrations`: `GRANT SELECT, INSERT ON public.audit_log TO authenticated`, `GRANT ALL ... TO service_role`.
- Nova policy `audit_log_select` para `authenticated`: `public.is_master(auth.uid()) OR public.has_permission(auth.uid(), 'auditoria.visualizar', NULL, NULL)`.
- Sem `UPDATE`/`DELETE` policies nem grants — imutabilidade preservada.
- Nenhuma alteração de código de tela é necessária; a página já está corretamente escrita.
