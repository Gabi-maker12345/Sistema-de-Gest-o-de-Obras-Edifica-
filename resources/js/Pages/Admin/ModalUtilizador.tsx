import { useCallback, useEffect } from 'react';

import { Campo } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';
import { ModalForma } from '@/Components/ui/modal-forma';
import {
    Seletor,
    SeletorConteudo,
    SeletorDisparador,
    SeletorGrupo,
    SeletorGrupoRotulo,
    SeletorItem,
    SeletorValor,
} from '@/Components/ui/select';
import { Interruptor } from '@/Components/ui/switch';
import { useSgo } from '@/Data/SgoContext';
import type { PerfilUtilizador, Utilizador } from '@/Data/types';
import { ROTULOS } from '@/lib/rotulos';
import { cn } from '@/lib/utils';

import { REGRAS, novoId, useFicha } from './formulario-local';
import type { Erros } from './formulario-local';

/**
 * A ficha do utilizador.
 *
 * O perfil é global — vale para todo o produto — e o acesso a um projecto
 * concreto é o papel, que se atribui na aba Acessos do projecto. São coisas
 * diferentes e a ficha diz isso: um perfil de consulta continua a poder ser
 * gestor de um projecto, e nenhum campo desta janela promete o contrário.
 *
 * A senha só existe na criação. Não entra na correcção porque não se muda a
 * senha de alguém — muda-se a senha de quem se lembra dela, e isso é um gesto
 * diferente, com o dono da conta à frente do ecrã.
 *
 * O e-mail é único porque é o que identifica a pessoa; o telefone é livre
 * porque há quem não o tenha, e o produto não inventa um.
 */
type DadosUtilizador = {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    cargo: string;
    perfil: PerfilUtilizador;
    activo: boolean;
    senha: string;
    confirmarSenha: string;
};

const VAZIO: DadosUtilizador = {
    id: '',
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    perfil: 'colaborador_tecnico',
    activo: true,
    senha: '',
    confirmarSenha: '',
};

function de(utilizador: Utilizador): DadosUtilizador {
    return {
        id: utilizador.id,
        nome: utilizador.nome,
        email: utilizador.email,
        telefone: utilizador.telefone,
        cargo: utilizador.cargo ?? '',
        perfil: utilizador.perfil,
        activo: utilizador.activo,
        senha: '',
        confirmarSenha: '',
    };
}

/** A força da senha: o que o indicador diz é só comprimento e variedade. */
function forcaSenha(senha: string): { nivel: 0 | 1 | 2 | 3; rotulo: string } {
    if (senha.length === 0) {
        return { nivel: 0, rotulo: 'Por escrever' };
    }

    let pontos = 0;

    if (senha.length >= 8) {
        pontos += 1;
    }

    if (/[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(senha) && /[a-záàâãéêíóôõúç]/.test(senha)) {
        pontos += 1;
    }

    if (/\d/.test(senha) || /[^\p{L}\d]/u.test(senha)) {
        pontos += 1;
    }

    if (pontos <= 1) {
        return { nivel: 1, rotulo: 'Fraca' };
    }

    return pontos === 2 ? { nivel: 2, rotulo: 'Razoável' } : { nivel: 3, rotulo: 'Forte' };
}

export function ModalUtilizador({
    aberto,
    utilizador,
    aoFechar,
}: {
    aberto: boolean;
    /** `null` é abrir uma ficha nova: o que a folha cria. */
    utilizador: Utilizador | null;
    aoFechar: () => void;
}) {
    const { estado, criar, actualizar, utilizadorEfectivo } = useSgo();

    const guardar = useCallback(
        (dados: DadosUtilizador) => {
            const registo: Utilizador = {
                id: dados.id || novoId('u'),
                nome: dados.nome.trim(),
                email: dados.email.trim().toLowerCase(),
                telefone: dados.telefone.trim(),
                perfil: dados.perfil,
                activo: dados.activo,
                cargo: dados.cargo.trim() || undefined,
            };

            if (dados.id) {
                actualizar('utilizadores', dados.id, registo);
            } else {
                criar('utilizadores', registo);
            }
        },
        [actualizar, criar],
    );

    const ficha = useFicha<DadosUtilizador>({
        vazio: VAZIO,
        validar: (dados) => {
            // A senha é um campo da criação e só da criação: quem corrige não
            // escreve senhas, e a folha não finge que aceita.
            const emEdicao = dados.id !== '';

            return REGRAS.juntar(
                ['nome', REGRAS.obrigatorio(dados.nome, 'O nome')],
                ['email', REGRAS.obrigatorio(dados.email, 'O e-mail')],
                ['email', REGRAS.email(dados.email)],
                ['email', duplicado(dados.email, dados.id)],
                ['telefone', REGRAS.telefone(dados.telefone)],
                ['senha', emEdicao ? null : REGRAS.obrigatorio(dados.senha, 'A senha')],
                ['senha', emEdicao ? null : curta(dados.senha)],
                ['confirmarSenha', emEdicao ? null : REGRAS.obrigatorio(dados.confirmarSenha, 'A confirmação')],
                [
                    'confirmarSenha',
                    !emEdicao && dados.confirmarSenha.length > 0 && dados.senha !== dados.confirmarSenha
                        ? 'As senhas não coincidem.'
                        : null,
                ],
            );
        },
        aoGuardar: guardar,
        aoFechar,
        mensagem: (dados) =>
            dados.id ? `Utilizador actualizado: ${dados.nome}.` : `Utilizador registado: ${dados.nome}.`,
    });

    useEffect(() => {
        if (aberto) {
            ficha.preparar(utilizador ? de(utilizador) : undefined);
        }
    }, [aberto, utilizador]);

    const { dados, erros, definir, guardar: submeter, pendente, sujo } = ficha;
    const emEdicao = dados.id !== '';

    /**
     * Não se desliga a pessoa com quem se está a ver: o selector «Ver como» cairia
     * para o primeiro utilizador da lista e a folha mudaria de mãos sem o
     * utilizador ter feito nada. Desligar-se a si próprio é sempre possível
     * noutro momento.
     */
    const euProprio = dados.id === utilizadorEfectivo.id;
    const outrosTêmAcesso = estado.acessos.some((acesso) => acesso.utilizadorId === dados.id);

    function duplicado(email: string, id: string): string | null {
        const alvo = email.trim().toLowerCase();

        if (alvo.length === 0) {
            return null;
        }

        const jaExiste = estado.utilizadores.some(
            (outro) => outro.id !== id && outro.email.toLowerCase() === alvo,
        );

        return jaExiste ? 'Já existe um utilizador com este e-mail.' : null;
    }

    return (
        <ModalForma
            aberto={aberto}
            aoFechar={aoFechar}
            titulo={emEdicao ? 'Corrigir utilizador' : 'Novo utilizador'}
            descricao={
                emEdicao
                    ? 'O perfil é global. O acesso a cada projecto é o papel, e vive na aba Acessos.'
                    : 'A pessoa entra no selector «Ver como» assim que fica registada.'
            }
            notaCabecalho={`Utilizador · ${emEdicao ? 'correcção' : 'abertura'}`}
            sujo={sujo}
            pendente={pendente}
            accao={emEdicao ? 'Guardar correcção' : 'Registar utilizador'}
            rodapeNota={
                euProprio
                    ? 'É a pessoa com quem está a ver: o perfil e o nome continuam a poder mudar.'
                    : outrosTêmAcesso
                      ? 'Tem projectos atribuídos. Desligar esconde-o da lista de acessos, não apaga o histórico.'
                      : undefined
            }
            aoGuardar={submeter}
        >
            <Campo rotulo="Nome" htmlFor="utilizador-nome" obrigatorio erro={erros.nome}>
                <Input
                    id="utilizador-nome"
                    value={dados.nome}
                    onChange={(evento) => definir('nome', evento.target.value)}
                    aria-invalid={Boolean(erros.nome)}
                    autoComplete="name"
                    placeholder="Isabel Neto Correia"
                    autoFocus
                />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo="E-mail" htmlFor="utilizador-email" obrigatorio erro={erros.email}>
                    <Input
                        id="utilizador-email"
                        type="email"
                        value={dados.email}
                        onChange={(evento) => definir('email', evento.target.value)}
                        aria-invalid={Boolean(erros.email)}
                        autoComplete="email"
                        placeholder="isabel.correia@sgo.ao"
                    />
                </Campo>

                <Campo
                    rotulo="Telefone"
                    htmlFor="utilizador-telefone"
                    ajuda="Opcional."
                    erro={erros.telefone}
                >
                    <Input
                        id="utilizador-telefone"
                        type="tel"
                        value={dados.telefone}
                        onChange={(evento) => definir('telefone', evento.target.value)}
                        aria-invalid={Boolean(erros.telefone)}
                        autoComplete="tel"
                        placeholder="+244 9XX XXX XXX"
                    />
                </Campo>
            </div>

            {!emEdicao && (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Campo
                            rotulo="Senha"
                            htmlFor="utilizador-senha"
                            obrigatorio
                            erro={erros.senha}
                        >
                            <Input
                                id="utilizador-senha"
                                type="password"
                                value={dados.senha}
                                onChange={(evento) => definir('senha', evento.target.value)}
                                aria-invalid={Boolean(erros.senha)}
                                autoComplete="new-password"
                            />
                        </Campo>

                        <Campo
                            rotulo="Confirmar senha"
                            htmlFor="utilizador-confirmar"
                            obrigatorio
                            erro={erros.confirmarSenha}
                        >
                            <Input
                                id="utilizador-confirmar"
                                type="password"
                                value={dados.confirmarSenha}
                                onChange={(evento) => definir('confirmarSenha', evento.target.value)}
                                aria-invalid={Boolean(erros.confirmarSenha)}
                                autoComplete="new-password"
                            />
                        </Campo>
                    </div>

                    <IndicadorForca senha={dados.senha} />
                </>
            )}

            <Campo
                rotulo="Perfil"
                htmlFor="utilizador-perfil"
                ajuda="Vale em todo o produto. Quem chega a um projecto é o papel, não o perfil."
            >
                <Seletor
                    value={dados.perfil}
                    onValueChange={(valor) => definir('perfil', valor as PerfilUtilizador)}
                >
                    <SeletorDisparador id="utilizador-perfil">
                        <SeletorValor />
                    </SeletorDisparador>
                    <SeletorConteudo>
                        <SeletorGrupo>
                            <SeletorGrupoRotulo>Perfil global</SeletorGrupoRotulo>
                            {Object.entries(ROTULOS.perfil).map(([valor, rotulo]) => (
                                <SeletorItem key={valor} value={valor}>
                                    {rotulo}
                                </SeletorItem>
                            ))}
                        </SeletorGrupo>
                    </SeletorConteudo>
                </Seletor>
            </Campo>

            <div className="flex items-start gap-3 border border-graphite-32 bg-paper-sunken px-3 py-2.5">
                <Interruptor
                    id="utilizador-activo"
                    checked={dados.activo}
                    disabled={euProprio}
                    onCheckedChange={(ligado: boolean) => definir('activo', ligado)}
                />
                <div className="min-w-0">
                    <label
                        htmlFor="utilizador-activo"
                        className="block text-sm font-medium text-graphite"
                    >
                        Utilizador activo
                    </label>
                    <p className="anotacao normal-case">
                        {euProprio
                            ? 'Não se desliga a pessoa com quem se está a ver: o selector «Ver como» cairia para outra pessoa sem aviso.'
                            : 'Um utilizador inactivo mantém o histórico e sai das listas de escolha.'}
                    </p>
                </div>
            </div>
        </ModalForma>
    );
}

/**
 * O indicador de força: quatro traços de gabarito que se preenchem a grafite.
 * Não é uma barra de cor — o âmbar é acção e escrever a senha não é uma acção
 * que o utilizadorováníu. O rótulo é que diz, em palavra.
 */
function IndicadorForca({ senha }: { senha: string }) {
    const { nivel, rotulo } = forcaSenha(senha);

    return (
        <div className="flex items-center gap-3">
            <div aria-hidden className="flex gap-1">
                {[1, 2, 3].map((n) => (
                    <span
                        key={n}
                        className={cn(
                            'h-1 w-8 border-b-2 transition-colors',
                            nivel >= n ? 'border-graphite' : 'border-graphite-20',
                        )}
                    />
                ))}
            </div>
            <p className="cota" role="status">
                Senha: {rotulo}
            </p>
        </div>
    );
}

/** O mínimo honesto: oito caracteres. */
function curta(senha: string): string | null {
    return senha.length > 0 && senha.length < 8 ? 'A senha precisa de pelo menos 8 caracteres.' : null;
}