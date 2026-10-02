import { Input } from '@/Components/ui/input';
import { Campo } from '@/Components/ui/field';
import { Calendario } from '@/Components/ui/calendario';

import { diaDe, horaDe, juntarDataHora } from '@/lib/agenda';

/**
 * Data e hora num campo só.
 *
 * `Calendario` devolve o dia em `YYYY-MM-DD` e não sabe de horas, e o produto
 * precisa das duas coisas — uma reunião de obra acaba a um tempo, não numa data.
 * Em vez de duplicar o calendário para cada módulo, aqui junta-se o dia que o
 * calendário escolhe com a hora que se escreve, e vive-se com um ISO só.
 *
 * São dois controlos porque o calendário é um mês e a hora não cabe num mês.
 */
export function CampoDataHora({
    id,
    rotulo,
    ajuda,
    erro,
    obrigatorio,
    valor,
    aoMudar,
}: {
    id: string;
    rotulo: string;
    ajuda?: string;
    erro?: string;
    obrigatorio?: boolean;
    /** `YYYY-MM-DDTHH:mm:ss` — o mesmo formato que o seed escreve. */
    valor: string | null;
    aoMudar: (iso: string) => void;
}) {
    const dia = valor ? diaDe(valor) : null;
    const hhmm = valor ? horaDe(valor) : '';

    return (
        <Campo rotulo={rotulo} htmlFor={id} ajuda={ajuda} erro={erro} obrigatorio={obrigatorio}>
            <div className="grid grid-cols-[1fr_auto] gap-2">
                <Calendario
                    id={id}
                    valor={dia}
                    aoEscolher={(escolhido) => aoMudar(juntarDataHora(escolhido, hhmm || '09:00'))}
                    vazio="Escolher dia"
                    className="w-full"
                />

                <Input
                    type="time"
                    aria-label={`Hora de ${rotulo.toLowerCase()}`}
                    value={hhmm}
                    onChange={(evento) => {
                        const escolhida = evento.target.value;

                        aoMudar(
                            juntarDataHora(
                                dia ?? new Date().toISOString().slice(0, 10),
                                escolhida || '09:00',
                            ),
                        );
                    }}
                    className="w-32"
                />
            </div>
        </Campo>
    );
}