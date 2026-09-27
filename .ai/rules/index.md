# Índice de regras

Mapa de globs → ficheiros de regras. Antes de planear ou de criar/editar ficheiros, lê as regras cujo glob cobre os caminhos em questão.

## Ler sempre (qualquer trabalho de front-end neste projecto)

| Ficheiro | Aplica-se a | Conteúdo |
| --- | --- | --- |
| [sgo-spec.md](sgo-spec.md) | `resources/**`, `routes/**`, qualquer ecrã novo | Especificação integral do SGO: posicionamento, âmbito, site público, menu, todos os módulos, modais de criação, auditoria, offline, dados de exemplo e ordem de execução. Fonte única de verdade do produto. |
| [direccao-visual.md](direccao-visual.md) | `resources/**`, qualquer ecrã novo | Contrato de direcção **THE ROLL**: paleta exacta e o papel de cada cor, tipografia, quatro codificações de estado, superfícies, registo de linguagem, proibições e checklist de revisão. Não decidir estética sem o ler. |

## Como usar

- O ficheiro `sgo-spec.md` é uma **spec de produto**, não um guia de estilo: não o reescrevas para "arrumar", apenas actualiza quando o utilizador pedir.
- Implementa pela **ordem de execução** da secção 9 da spec, uma secção de cada vez.
- Não inventes ecrãs, campos, rotas ou regras que não estejam na spec. Se a spec é ambígua numa decisão concreta, pergunta antes de codificar.
- Ao terminar cada secção da ordem de execução, confirma a checklist de consistência da secção 10 da spec.
- Antes de dar um ecrã por pronto, passa-o pela checklist de revisão de `direccao-visual.md`.
