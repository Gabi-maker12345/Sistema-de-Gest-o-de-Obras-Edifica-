<?php

namespace Database\Seeders;

use App\Enums\CategoriaDespesa;
use App\Enums\EstadoActividade;
use App\Enums\EstadoAprovacao;
use App\Enums\EstadoDecisao;
use App\Enums\EstadoGeralProjecto;
use App\Enums\EstadoPagamento;
use App\Enums\EstadoTarefa;
use App\Enums\ImpactoDecisao;
use App\Enums\PapelProjecto;
use App\Enums\PerfilUtilizador;
use App\Enums\PrioridadeTarefa;
use App\Enums\TipoDocumento;
use App\Enums\TipoEvento;
use App\Enums\TipoIndicador;
use App\Enums\TipoReuniao;
use App\Models\Actividade;
use App\Models\Area;
use App\Models\Decisao;
use App\Models\Despesa;
use App\Models\DiarioObra;
use App\Models\Documento;
use App\Models\Equipa;
use App\Models\EventoAgenda;
use App\Models\Fornecedor;
use App\Models\Fotografia;
use App\Models\Indicador;
use App\Models\Material;
use App\Models\Pagamento;
use App\Models\Projecto;
use App\Models\RequisicaoMaterial;
use App\Models\Reuniao;
use App\Models\Tarefa;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Dados de demonstração do SGO, transplantados do seed em memória do front
 * (resources/js/Data/seed.ts, spec §12) para a base de dados. É a única
 * fonte de dados de teste: as páginas leem tudo daqui via Inertia/controllers.
 *
 * As datas são relativas a hoje para que os atrasos sejam reais — o comando
 * `actividades:marcar-atrasadas` e os alertas do painel dependem disso.
 */
class SgoSeeder extends Seeder
{
    use WithoutModelEvents;

    /** @var array<string, Fornecedor>|null */
    private ?array $catalogo = null;

    /** @var array<string, Material>|null */
    private ?array $catalogoMateriais = null;

    public function run(): void
    {
        $este = $this->utilizadores();
        $areas = $this->areas($este);
        $fornecedores = $this->fornecedores();
        $materiais = $this->materiais();
        $edificios = $this->projectoEdificios($este, $areas);
        $pontes = $this->projectoPontes($este, $areas);
        $reabilitacao = $this->projectoReabilitacao($este, $areas);

        $this->acessos($este, [$edificios, $pontes, $reabilitacao]);
        $this->agendaDoGestor($este['helder'], $edificios, $pontes);
        $this->notificacoesDaIsabel($este['isabel'], $edificios, $pontes);

        // O observer financeiro acumula percentagens na casa dos centavos por
        // efeito das despesas partilhadas; arredonda-se ao valor de vitrine.
        foreach (Projecto::all() as $projecto) {
            DB::table('projectos')->where('id', $projecto->id)->update([
                'execucao_fisica_percentagem' => round((float) $projecto->execucao_fisica_percentagem),
                'execucao_financeira_percentagem' => min(100, round((float) $projecto->execucao_financeira_percentagem)),
            ]);
        }
    }

    /**
     * @return array<string, User>
     */
    private function utilizadores(): array
    {
        $criar = fn (string $nome, string $email, PerfilUtilizador $perfil, string $telefone) => User::create([
            'name' => $nome,
            'email' => $email,
            'telefone' => $telefone,
            'perfil' => $perfil,
            'ativo' => true,
            'password' => bcrypt('sgo-demo'),
            'email_verified_at' => now(),
        ]);

        return [
            'isabel' => $criar('Isabel Neto Correia', 'isabel.correia@sgo.ao', PerfilUtilizador::Proprietario, '+244 923 000 111'),
            'helder' => $criar('Hélder Manuel Baptista', 'helder.baptista@sgo.ao', PerfilUtilizador::Gestor, '+244 923 000 222'),
            'nuno' => $criar('Nuno Domingos Ferreira', 'nuno.ferreira@sgo.ao', PerfilUtilizador::Tecnico, '+244 923 000 333'),
            'tereza' => $criar('Tereza Kambanda', 'tereza.kambanda@sgo.ao', PerfilUtilizador::Encarregado, '+244 923 000 444'),
            'adilson' => $criar('Adilson Cabral', 'adilson.cabral@obracon.ao', PerfilUtilizador::Fiscal, '+244 923 000 555'),
            'jorge' => $criar('Jorge Matias', 'jorge.matias@sgo.ao', PerfilUtilizador::Fiscal, '+244 923 000 666'),
            'clara' => $criar('Clara Ferraz', 'clara.ferraz@sgo.ao', PerfilUtilizador::Admin, '+244 923 000 777'),
        ];
    }

    /**
     * @param  array<string, User>  $este
     * @return array<string, Area>
     */
    private function areas(array $este): array
    {
        $criar = fn (string $nome, ?User $responsavel, string $descricao) => Area::create([
            'nome' => $nome,
            'responsavel_id' => $responsavel?->id,
            'descricao' => $descricao,
        ]);

        return [
            'edificios' => $criar('Edifícios', $este['helder'], 'Obras verticais: condomínios, torres e equipamentos.'),
            'infra' => $criar('Infra-estruturas', $este['nuno'], 'Estradas, pontes, drenagens e redes.'),
            'reabilitacao' => $criar('Reabilitação', null, 'Recuperação e conservação de património edificado.'),
            'topografia' => $criar('Topografia', $este['nuno'], 'Levantamentos, mapas e modelos digitais do terreno.'),
        ];
    }

    /**
     * @return array<string, Fornecedor>
     */
    private function fornecedores(): array
    {
        if ($this->catalogo !== null) {
            return $this->catalogo;
        }

        $criar = fn (array $d) => Fornecedor::create($d);

        $lista = [
            'angonovo' => $criar([
                'nome' => 'Angonovo Materiais de Construção',
                'nif' => '5417003821',
                'morada' => 'Estrada de Catete, Km 12, Luanda',
                'contacto' => '+244 921 440 300',
                'especialidade' => 'materiais',
                'avaliacao' => 4,
            ]),
            'contmat' => $criar([
                'nome' => 'Contmat Angola',
                'nif' => '5400011223',
                'morada' => 'Zona Económica Especial, Viana',
                'contacto' => '+244 923 110 220',
                'especialidade' => 'betão pronto',
                'avaliacao' => 5,
            ]),
            'jgelec' => $criar([
                'nome' => 'JG Eletrificação',
                'nif' => '5499007712',
                'morada' => 'Rua Comandante Che Guevara, Luanda',
                'contacto' => '+244 926 771 004',
                'especialidade' => 'eletricidade',
                'avaliacao' => 3,
            ]),
            'movec' => $criar([
                'nome' => 'MoveCargas Transportes',
                'nif' => '5433009988',
                'morada' => 'Via Expresso, Km 4, Luanda',
                'contacto' => '+244 924 550 660',
                'especialidade' => 'transporte de carga',
                'avaliacao' => 4,
            ]),
        ];

        return $this->catalogo = $lista;
    }

    /**
     * @return array<string, Material>
     */
    private function materiais(): array
    {
        if ($this->catalogoMateriais !== null) {
            return $this->catalogoMateriais;
        }

        $criar = fn (array $d) => Material::create($d);

        $lista = [
            'cimento' => $criar(['nome' => 'Cimento Zette 50kg', 'categoria' => 'aglomerantes', 'unidade_medida' => 'saco', 'preco_referencia' => 6800]),
            'varinha' => $criar(['nome' => 'Varinha 12mm', 'categoria' => 'aço', 'unidade_medida' => 'barra', 'preco_referencia' => 9500]),
            'areia' => $criar(['nome' => 'Areia grossa', 'categoria' => 'agregados', 'unidade_medida' => 'm³', 'preco_referencia' => 45000]),
            'brita' => $criar(['nome' => 'Brita 19mm', 'categoria' => 'agregados', 'unidade_medida' => 'm³', 'preco_referencia' => 52000]),
            'betão' => $criar(['nome' => 'Betão C25/30 pronto', 'categoria' => 'betão', 'unidade_medida' => 'm³', 'preco_referencia' => 180000]),
            'tijolo' => $criar(['nome' => 'Tijolo betão 20x20', 'categoria' => 'alvenaria', 'unidade_medida' => 'unidade', 'preco_referencia' => 350]),
            'gasoleo' => $criar(['nome' => 'Gasóleo profissional', 'categoria' => 'combustível', 'unidade_medida' => 'litro', 'preco_referencia' => 750]),
        ];

        return $this->catalogoMateriais = $lista;
    }

    /**
     * Obra principal: Condomínio Kilamba Akakios (spec §12).
     *
     * @param  array<string, User>  $este
     * @param  array<string, Area>  $areas
     */
    private function projectoEdificios(array $este, array $areas): Projecto
    {
        $projecto = Projecto::create([
            'area_id' => $areas['edificios']->id,
            'gestor_id' => $este['helder']->id,
            'nome' => 'Condomínio Kilamba Akakios',
            'cliente' => 'InGear Angola',
            'morada' => 'Kilamba Akakios, Luanda',
            'data_inicio' => now()->subDays(120)->toDateString(),
            'data_fim_prevista' => now()->addDays(75)->toDateString(),
            'valor_contratual' => 850000000,
            'orcamento_previsto' => 780000000,
            'estado_geral' => EstadoGeralProjecto::EmExecucao,
        ]);

        $blocoA = Actividade::create([
            'projecto_id' => $projecto->id,
            'nome' => 'Bloco A — Estrutura',
            'descricao' => 'Estrutura em betão armado, 8 pisos.',
            'data_inicio_prevista' => now()->subDays(100)->toDateString(),
            'data_fim_prevista' => now()->subDays(5)->toDateString(),
            'data_inicio_real' => now()->subDays(98)->toDateString(),
            'percentagem_conclusao' => 82,
            'estado' => EstadoActividade::EmCurso,
        ]);

        $blocoB = Actividade::create([
            'projecto_id' => $projecto->id,
            'nome' => 'Bloco B — Estrutura',
            'data_inicio_prevista' => now()->subDays(60)->toDateString(),
            'data_fim_prevista' => now()->addDays(40)->toDateString(),
            'data_inicio_real' => now()->subDays(58)->toDateString(),
            'percentagem_conclusao' => 45,
            'estado' => EstadoActividade::EmCurso,
        ]);

        Actividade::create([
            'projecto_id' => $projecto->id,
            'actividade_pai_id' => $blocoA->id,
            'nome' => 'Piso 04 — Lajes',
            'data_inicio_prevista' => now()->subDays(20)->toDateString(),
            'data_fim_prevista' => now()->subDays(2)->toDateString(),
            'data_inicio_real' => now()->subDays(19)->toDateString(),
            'percentagem_conclusao' => 60,
            'estado' => EstadoActividade::EmCurso,
        ]);

        Actividade::create([
            'projecto_id' => $projecto->id,
            'nome' => 'Alvenarias Bloco A',
            'data_inicio_prevista' => now()->addDays(10)->toDateString(),
            'data_fim_prevista' => now()->addDays(45)->toDateString(),
            'percentagem_conclusao' => 0,
            'estado' => EstadoActividade::NaoIniciada,
        ]);

        $equipaEstrutura = Equipa::create([
            'projecto_id' => $projecto->id,
            'encarregado_id' => $este['tereza']->id,
            'nome' => 'Equipa de Estruturas',
            'especialidade' => 'betão armado',
        ]);

        $equipaAlvenaria = Equipa::create([
            'projecto_id' => $projecto->id,
            'encarregado_id' => $este['nuno']->id,
            'nome' => 'Equipa de Alvenaria',
            'especialidade' => 'alvenaria',
        ]);

        $equipaEstrutura->membros()->attach([
            $este['tereza']->id => ['funcao' => 'Encarregado', 'data_entrada' => now()->subDays(100)],
            $este['nuno']->id => ['funcao' => 'Técnico', 'data_entrada' => now()->subDays(95)],
        ]);

        $equipaAlvenaria->membros()->attach($este['nuno']->id, ['funcao' => 'Encarregado', 'data_entrada' => now()->subDays(60)]);

        $tarefaLaje = Tarefa::create([
            'actividade_id' => $blocoA->id,
            'equipa_id' => $equipaEstrutura->id,
            'responsavel_id' => $este['tereza']->id,
            'titulo' => 'Preparar armadura da laje do Piso 04',
            'descricao' => 'Verificar cofragem e armação antes da betonagem marcada para amanhã.',
            'data_inicio' => now()->subDays(3)->toDateString(),
            'prazo' => now()->subDay()->toDateString(),
            'prioridade' => PrioridadeTarefa::Urgente,
            'estado' => EstadoTarefa::EmCurso,
            'percentagem_conclusao' => 70,
            'horas_estimadas' => 16,
            'horas_reais' => 12,
        ]);

        Tarefa::create([
            'actividade_id' => $blocoB->id,
            'equipa_id' => $equipaEstrutura->id,
            'responsavel_id' => $este['nuno']->id,
            'titulo' => 'Inspeccionar pilares do Piso 02 (Bloco B)',
            'data_inicio' => now()->subDays(2)->toDateString(),
            'prazo' => now()->addDays(2)->toDateString(),
            'prioridade' => PrioridadeTarefa::Alta,
            'estado' => EstadoTarefa::EmCurso,
            'percentagem_conclusao' => 40,
            'horas_estimadas' => 8,
        ]);

        Tarefa::create([
            'actividade_id' => null,
            'equipa_id' => null,
            'responsavel_id' => $este['helder']->id,
            'titulo' => 'Fechar auto de medição n.º 7',
            'descricao' => 'Consolidar medições do mês e enviar à InGear até sexta.',
            'data_inicio' => now()->subDays(5)->toDateString(),
            'prazo' => now()->addDays(1)->toDateString(),
            'prioridade' => PrioridadeTarefa::Alta,
            'estado' => EstadoTarefa::Pendente,
            'horas_estimadas' => 4,
        ]);

        Tarefa::create([
            'actividade_id' => $blocoA->id,
            'responsavel_id' => $este['tereza']->id,
            'titulo' => 'Substituir escoramentos danificados no Piso 03',
            'data_inicio' => now()->subDays(8)->toDateString(),
            'prazo' => now()->subDays(4)->toDateString(),
            'data_conclusao' => now()->subDays(3)->toDateString(),
            'prioridade' => PrioridadeTarefa::Media,
            'estado' => EstadoTarefa::Concluida,
            'percentagem_conclusao' => 100,
            'horas_estimadas' => 10,
            'horas_reais' => 11,
        ]);

        $diarioOntem = DiarioObra::create([
            'projecto_id' => $projecto->id,
            'data' => now()->subDay()->toDateString(),
            'condicoes_meteorologicas' => 'Sol, 28 °C, sem vento.',
            'efectivo_presente' => 42,
            'actividades_realizadas' => 'Betonagem parcial da laje do Piso 04; montagem de armação nos pilares P7 a P9.',
            'ocorrencias' => 'Rendição do betão atrasada duas horas por avaria na bomba da Contmat.',
            'registado_por' => $este['tereza']->id,
        ]);

        DiarioObra::create([
            'projecto_id' => $projecto->id,
            'data' => now()->subDays(2)->toDateString(),
            'condicoes_meteorologicas' => 'Nublado, chuva fraca ao fim da tarde.',
            'efectivo_presente' => 35,
            'actividades_realizadas' => 'Trabalhos de alvenaria no Bloco B, pisos 1 e 2.',
            'ocorrencias' => 'Trabalho interrompido às 16h30 por chuva.',
            'registado_por' => $este['nuno']->id,
        ]);

        Fotografia::create([
            'projecto_id' => $projecto->id,
            'diario_id' => $diarioOntem->id,
            'url' => 'https://picsum.photos/seed/kilamba-piso04/1200/800',
            'descricao' => 'Armadura da laje do Piso 04 antes da betonagem',
            'data_captura' => now()->subDay()->setHour(10)->format('Y-m-d H:i:s'),
            'latitude' => -8.9189,
            'longitude' => 13.2126,
            'localizacao' => 'Bloco A, Piso 04',
            'tirada_por' => $este['tereza']->id,
        ]);

        Fotografia::create([
            'projecto_id' => $projecto->id,
            'url' => 'https://picsum.photos/seed/kilamba-blocoB/1200/800',
            'descricao' => 'Vista geral do Bloco B em estrutura',
            'data_captura' => now()->subDays(3)->setHour(15)->format('Y-m-d H:i:s'),
            'localizacao' => 'canteiro central',
            'tirada_por' => $este['nuno']->id,
        ]);

        $documentoPlanta = Documento::create([
            'projecto_id' => $projecto->id,
            'documentavel_type' => Projecto::class,
            'documentavel_id' => $projecto->id,
            'nome_ficheiro' => 'planta-arquitectura-v3.pdf',
            'caminho' => 'projectos/kilamba/planta-arquitectura-v3.pdf',
            'tipo_documento' => TipoDocumento::Planta,
            'versao' => 3,
            'tamanho' => '8,4 MB',
            'upload_por' => $este['helder']->id,
        ]);

        Documento::create([
            'projecto_id' => $projecto->id,
            'nome_ficheiro' => 'contrato-ingear-assinado.pdf',
            'caminho' => 'projectos/kilamba/contrato-ingear-assinado.pdf',
            'tipo_documento' => TipoDocumento::Contrato,
            'versao' => 1,
            'tamanho' => '2,1 MB',
            'upload_por' => $este['isabel']->id,
        ]);

        $despesaCimento = Despesa::create([
            'projecto_id' => $projecto->id,
            'fornecedor_id' => $this->fornecedores()['angonovo']->id,
            'documento_id' => $documentoPlanta->id,
            'categoria' => CategoriaDespesa::Material,
            'descricao' => 'Aquisição de 400 sacos de cimento Zette',
            'valor' => 2720000,
            'data' => now()->subDays(6)->toDateString(),
            'estado_aprovacao' => EstadoAprovacao::Aprovada,
            'registado_por' => $este['tereza']->id,
        ]);

        Pagamento::create([
            'despesa_id' => $despesaCimento->id,
            'valor' => 2720000,
            'data_pagamento' => now()->subDays(4)->toDateString(),
            'metodo_pagamento' => 'transferência',
            'referencia' => 'TRF-2026-00841',
            'estado' => EstadoPagamento::Pago,
            'aprovado_por' => $este['isabel']->id,
        ]);

        $despesaBetonagem = Despesa::create([
            'projecto_id' => $projecto->id,
            'fornecedor_id' => $this->fornecedores()['contmat']->id,
            'categoria' => CategoriaDespesa::Subcontratacao,
            'descricao' => 'Betonagem laje Piso 04 — fornecimento C25/30',
            'valor' => 5400000,
            'data' => now()->subDay()->toDateString(),
            'estado_aprovacao' => EstadoAprovacao::Pendente,
            'registado_por' => $este['nuno']->id,
        ]);

        Pagamento::create([
            'despesa_id' => $despesaBetonagem->id,
            'valor' => 5400000,
            'metodo_pagamento' => 'transferência',
            'estado' => EstadoPagamento::Pendente,
        ]);

        Despesa::create([
            'projecto_id' => $projecto->id,
            'fornecedor_id' => $this->fornecedores()['jgelec']->id,
            'categoria' => CategoriaDespesa::MaoDeObra,
            'descricao' => 'Avanço de tesoura — eletricidade provisória do canteiro',
            'valor' => 1350000,
            'data' => now()->subDays(12)->toDateString(),
            'estado_aprovacao' => EstadoAprovacao::Rejeitada,
            'registado_por' => $este['tereza']->id,
        ]);

        RequisicaoMaterial::create([
            'projecto_id' => $projecto->id,
            'tarefa_id' => $tarefaLaje->id,
            'material_id' => $this->materiais()['betão']->id,
            'quantidade' => 12,
            'data' => now()->subDay()->toDateString(),
            'preco_unitario' => 180000,
        ]);

        RequisicaoMaterial::create([
            'projecto_id' => $projecto->id,
            'material_id' => $this->materiais()['varinha']->id,
            'quantidade' => 220,
            'data' => now()->subDays(3)->toDateString(),
            'preco_unitario' => 9500,
        ]);

        $reuniao = Reuniao::create([
            'projecto_id' => $projecto->id,
            'titulo' => 'Ponto de situação semanal com a InGear',
            'tipo' => TipoReuniao::Cliente,
            'data_hora' => now()->subDays(7)->setHour(10)->format('Y-m-d H:i:s'),
            'local' => 'Contentor de obra, sala 1',
            'convocado_por' => $este['helder']->id,
            'acta' => 'Atraso de 5 dias na estrutura do Bloco A assumido pelo empreiteiro; plano de recuperação apresentado.',
        ]);

        $reuniao->participantes()->attach([
            $este['helder']->id => ['presenca' => true, 'papel' => 'Convocante'],
            $este['isabel']->id => ['presenca' => true, 'papel' => 'Cliente'],
            $este['adilson']->id => ['presenca' => false, 'papel' => 'Fiscal'],
        ]);

        Decisao::create([
            'reuniao_id' => $reuniao->id,
            'projecto_id' => $projecto->id,
            'descricao' => 'Adotar turno da noite nas betonagens até recuperar o atraso do Bloco A',
            'responsavel_id' => $este['helder']->id,
            'estado' => EstadoDecisao::Pendente,
            'impacto' => ImpactoDecisao::Prazo,
            'prazo_implementacao' => now()->addDays(10)->toDateString(),
        ]);

        Decisao::create([
            'projecto_id' => $projecto->id,
            'descricao' => 'Trocar a bomba de betão fornecida pela Contmat',
            'responsavel_id' => $este['nuno']->id,
            'estado' => EstadoDecisao::Implementada,
            'impacto' => ImpactoDecisao::Custo,
            'prazo_implementacao' => now()->subDays(2)->toDateString(),
        ]);

        Indicador::create([
            'projecto_id' => $projecto->id,
            'nome_indicador' => 'Execução física',
            'valor' => 62,
            'unidade' => '%',
            'meta' => 100,
            'tipo' => TipoIndicador::Prazo,
            'data_referencia' => now()->toDateString(),
        ]);

        Indicador::create([
            'projecto_id' => $projecto->id,
            'nome_indicador' => 'Acidentes com afastamento',
            'valor' => 0,
            'unidade' => 'dias',
            'meta' => 0,
            'tipo' => TipoIndicador::Seguranca,
            'data_referencia' => now()->toDateString(),
        ]);

        return $projecto;
    }

    /**
     * Segunda obra: Requalificação da Ponte sobre o Rio Kwanza.
     *
     * @param  array<string, User>  $este
     * @param  array<string, Area>  $areas
     */
    private function projectoPontes(array $este, array $areas): Projecto
    {
        $projecto = Projecto::create([
            'area_id' => $areas['infra']->id,
            'gestor_id' => $este['nuno']->id,
            'nome' => 'Requalificação da Ponte sobre o Rio Kwanza',
            'cliente' => 'ENEA — Estradas Nacional',
            'morada' => 'EN 230, Km 420',
            'data_inicio' => now()->subDays(45)->toDateString(),
            'data_fim_prevista' => now()->addDays(120)->toDateString(),
            'valor_contratual' => 1200000000,
            'orcamento_previsto' => 1100000000,
            'estado_geral' => EstadoGeralProjecto::EmExecucao,
        ]);

        $reforcoTabuleiro = Actividade::create([
            'projecto_id' => $projecto->id,
            'nome' => 'Reforço do tabuleiro',
            'data_inicio_prevista' => now()->subDays(30)->toDateString(),
            'data_fim_prevista' => now()->subDays(8)->toDateString(),
            'data_inicio_real' => now()->subDays(28)->toDateString(),
            'percentagem_conclusao' => 55,
            'estado' => EstadoActividade::EmCurso,
        ]);

        Actividade::create([
            'projecto_id' => $projecto->id,
            'nome' => 'Estacas dos pilares P3 e P4',
            'data_inicio_prevista' => now()->subDays(40)->toDateString(),
            'data_fim_prevista' => now()->subDays(15)->toDateString(),
            'data_inicio_real' => now()->subDays(38)->toDateString(),
            'data_fim_real' => now()->subDays(12)->toDateString(),
            'percentagem_conclusao' => 100,
            'estado' => EstadoActividade::Concluida,
        ]);

        Actividade::create([
            'projecto_id' => $projecto->id,
            'nome' => 'Drenagem do acesso norte',
            'data_inicio_prevista' => now()->addDays(15)->toDateString(),
            'data_fim_prevista' => now()->addDays(50)->toDateString(),
            'percentagem_conclusao' => 0,
            'estado' => EstadoActividade::NaoIniciada,
        ]);

        $equipa = Equipa::create([
            'projecto_id' => $projecto->id,
            'encarregado_id' => $este['tereza']->id,
            'nome' => 'Equipas de Obras de Arte',
            'especialidade' => 'pontes',
        ]);

        $equipa->membros()->attach($este['tereza']->id, ['funcao' => 'Encarregado', 'data_entrada' => now()->subDays(45)]);

        Tarefa::create([
            'actividade_id' => $reforcoTabuleiro->id,
            'equipa_id' => $equipa->id,
            'responsavel_id' => $este['nuno']->id,
            'titulo' => 'Ensaiar betão projetado do tabuleiro',
            'prazo' => now()->subDays(1)->toDateString(),
            'prioridade' => PrioridadeTarefa::Alta,
            'estado' => EstadoTarefa::Atrasada,
            'percentagem_conclusao' => 30,
            'horas_estimadas' => 6,
        ]);

        $diario = DiarioObra::create([
            'projecto_id' => $projecto->id,
            'data' => now()->subDay()->toDateString(),
            'condicoes_meteorologicas' => 'Ventoso, 24 °C.',
            'efectivo_presente' => 18,
            'actividades_realizadas' => 'Apontamento lateral do tabuleiro, lado sul.',
            'ocorrencias' => null,
            'registado_por' => $este['nuno']->id,
        ]);

        Fotografia::create([
            'projecto_id' => $projecto->id,
            'diario_id' => $diario->id,
            'url' => 'https://picsum.photos/seed/ponte-kwanza-tabuleiro/1200/800',
            'descricao' => 'Tabuleiro durante o apontamento lateral',
            'data_captura' => now()->subDay()->setHour(11)->format('Y-m-d H:i:s'),
            'latitude' => -10.3456,
            'longitude' => 13.8765,
            'localizacao' => 'Pilar P2, margem sul',
            'tirada_por' => $este['nuno']->id,
        ]);

        Documento::create([
            'projecto_id' => $projecto->id,
            'nome_ficheiro' => 'licenca-ambiental-enea.pdf',
            'caminho' => 'projectos/ponte/licenca-ambiental-enea.pdf',
            'tipo_documento' => TipoDocumento::Licenca,
            'versao' => 1,
            'tamanho' => '1,3 MB',
            'upload_por' => $este['nuno']->id,
        ]);

        $despesa = Despesa::create([
            'projecto_id' => $projecto->id,
            'fornecedor_id' => $this->fornecedores()['movec']->id,
            'categoria' => CategoriaDespesa::Equipamento,
            'descricao' => 'Aluguer de grua 100 t — 10 dias',
            'valor' => 3800000,
            'data' => now()->subDays(3)->toDateString(),
            'estado_aprovacao' => EstadoAprovacao::Pendente,
            'registado_por' => $este['nuno']->id,
        ]);

        Pagamento::create([
            'despesa_id' => $despesa->id,
            'valor' => 3800000,
            'metodo_pagamento' => 'transferência',
            'estado' => EstadoPagamento::Atrasado,
        ]);

        $reuniao = Reuniao::create([
            'projecto_id' => $projecto->id,
            'titulo' => 'Vistoria técnica trimestral',
            'tipo' => TipoReuniao::Obra,
            'data_hora' => now()->addDays(4)->setHour(9)->format('Y-m-d H:i:s'),
            'local' => 'Ponte, canteiro norte',
            'convocado_por' => $este['adilson']->id,
            'acta' => null,
        ]);

        $reuniao->participantes()->attach([
            $este['adilson']->id => ['presenca' => true, 'papel' => 'Fiscal'],
            $este['nuno']->id => ['presenca' => true, 'papel' => 'Empreiteiro'],
        ]);

        Decisao::create([
            'reuniao_id' => $reuniao->id,
            'projecto_id' => $projecto->id,
            'descricao' => 'Condicionar o tráfego pesado ao tabuleiro sul durante o reforço',
            'responsavel_id' => $este['nuno']->id,
            'estado' => EstadoDecisao::Pendente,
            'impacto' => ImpactoDecisao::Ambito,
            'prazo_implementacao' => now()->addDays(7)->toDateString(),
        ]);

        Indicador::create([
            'projecto_id' => $projecto->id,
            'nome_indicador' => 'Custo acumulado — curva S',
            'valor' => 31,
            'unidade' => '%',
            'meta' => 100,
            'tipo' => TipoIndicador::Custo,
            'data_referencia' => now()->toDateString(),
        ]);

        return $projecto;
    }

    /**
     * Terceira obra (planeamento/consulta): Reabilitação do Mercado do Kikolo.
     *
     * @param  array<string, User>  $este
     * @param  array<string, Area>  $areas
     */
    private function projectoReabilitacao(array $este, array $areas): Projecto
    {
        $projecto = Projecto::create([
            'area_id' => $areas['reabilitacao']->id,
            'gestor_id' => $este['helder']->id,
            'nome' => 'Reabilitação do Mercado do Kikolo',
            'cliente' => 'Administração Municipal de Luanda',
            'morada' => 'Kikolo, Luanda',
            'data_inicio' => now()->addDays(20)->toDateString(),
            'data_fim_prevista' => now()->addDays(200)->toDateString(),
            'valor_contratual' => 320000000,
            'orcamento_previsto' => 300000000,
            'estado_geral' => EstadoGeralProjecto::Planeamento,
        ]);

        Actividade::create([
            'projecto_id' => $projecto->id,
            'nome' => 'Levantamento do estado actual',
            'data_inicio_prevista' => now()->addDays(20)->toDateString(),
            'data_fim_prevista' => now()->addDays(35)->toDateString(),
            'percentagem_conclusao' => 0,
            'estado' => EstadoActividade::NaoIniciada,
        ]);

        Actividade::create([
            'projecto_id' => $projecto->id,
            'nome' => 'Remoção de coberturas em amianto',
            'data_inicio_prevista' => now()->addDays(36)->toDateString(),
            'data_fim_prevista' => now()->addDays(60)->toDateString(),
            'percentagem_conclusao' => 0,
            'estado' => EstadoActividade::NaoIniciada,
        ]);

        return $projecto;
    }

    /**
     * Aba Acessos: papéis na pivot projecto_user (ponto 4 da análise — um
     * papel único por linha; escrita/financeiro derivam dele no servidor).
     *
     * @param  array<string, User>  $este
     * @param  array<int, Projecto>  $projectos
     */
    private function acessos(array $este, array $projectos): void
    {
        [$kilamba, $ponte, $mercado] = $projectos;

        $atribuir = function (Projecto $projecto, string $chave, PapelProjecto $papel) use ($este): void {
            $projecto->utilizadores()->attach($este[$chave]->id, ['papel' => $papel->value]);
        };

        // Isabel (proprietária) e Clara (admin) têm acesso total via perfil,
        // mas ficam registadas como gestoras para a aba ter linhas reais.
        $atribuir($kilamba, 'isabel', PapelProjecto::Gestor);
        $atribuir($kilamba, 'helder', PapelProjecto::Gestor);
        $atribuir($kilamba, 'tereza', PapelProjecto::Colaborador);
        $atribuir($kilamba, 'adilson', PapelProjecto::Fiscal);
        $atribuir($kilamba, 'jorge', PapelProjecto::Consulta);

        $atribuir($ponte, 'nuno', PapelProjecto::Gestor);
        $atribuir($ponte, 'tereza', PapelProjecto::Colaborador);
        $atribuir($ponte, 'adilson', PapelProjecto::Fiscal);

        $atribuir($mercado, 'helder', PapelProjecto::Gestor);
        $atribuir($mercado, 'jorge', PapelProjecto::Consulta);
    }

    /**
     * Eventos de agenda do gestor (folha Agenda + sino de lembretes).
     *
     * @param  array<string, User>  $este
     */
    private function agendaDoGestor(User $helder, Projecto $kilamba, Projecto $ponte): void
    {
        EventoAgenda::create([
            'user_id' => $helder->id,
            'projecto_id' => $kilamba->id,
            'titulo' => 'Betonagem da laje do Piso 04',
            'descricao' => 'Confirmar bombas da Contmat às 06h00.',
            'tipo' => TipoEvento::Obra,
            'data_hora_inicio' => now()->addDay()->setHour(7)->format('Y-m-d H:i:s'),
            'data_hora_fim' => now()->addDay()->setHour(12)->format('Y-m-d H:i:s'),
            'local' => 'Bloco A, Kilamba Akakios',
            'lembrete_minutos_antes' => 60,
        ]);

        EventoAgenda::create([
            'user_id' => $helder->id,
            'projecto_id' => $ponte->id,
            'titulo' => 'Videochamada com a ENEA',
            'tipo' => TipoEvento::Profissional,
            'data_hora_inicio' => now()->addDays(2)->setHour(15)->format('Y-m-d H:i:s'),
            'data_hora_fim' => now()->addDays(2)->setHour(16)->format('Y-m-d H:i:s'),
            'lembrete_minutos_antes' => 15,
        ]);

        EventoAgenda::create([
            'user_id' => $helder->id,
            'projecto_id' => $kilamba->id,
            'titulo' => 'Assinatura do aditamento n.º 2',
            'tipo' => TipoEvento::Profissional,
            'data_hora_inicio' => now()->subDays(1)->setHour(11)->format('Y-m-d H:i:s'),
            'data_hora_fim' => now()->subDays(1)->setHour(12)->format('Y-m-d H:i:s'),
            'local' => 'Escritório InGear, Talatona',
        ]);

        EventoAgenda::create([
            'user_id' => $helder->id,
            'titulo' => 'Aniversário da filha',
            'tipo' => TipoEvento::Pessoal,
            'data_hora_inicio' => now()->addDays(6)->setHour(16)->format('Y-m-d H:i:s'),
            'data_hora_fim' => now()->addDays(6)->setHour(19)->format('Y-m-d H:i:s'),
            'local' => 'Ilha de Luanda',
        ]);
    }

    /**
     * Notificações da proprietária: uma pendência de aprovação (com ligação
     * real a /admin/despesas) e uma atividade atrasada detectada pelo comando.
     *
     * @param  array<string, User>  $este
     */
    private function notificacoesDaIsabel(User $isabel, Projecto $kilamba, Projecto $ponte): void
    {
        $enviar = fn (string $tipo, string $titulo, string $corpo, ?string $link) => DB::table('notifications')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => $tipo,
            'notifiable_type' => User::class,
            'notifiable_id' => $isabel->id,
            'data' => json_encode([
                'title' => $titulo,
                'body' => $corpo,
                'link' => $link,
                'projecto_id' => $kilamba->id,
            ], JSON_UNESCAPED_UNICODE),
            'read_at' => null,
            'created_at' => now()->subHours(3),
            'updated_at' => now()->subHours(3),
        ]);

        $enviar(
            'App\\Notifications\\DespesaPendenteNotificacao',
            'Despesa aguarda aprovação',
            'Betonagem da laje do Piso 04 (5.400.000 Kz) no '.$kilamba->nome.' está pendente da sua aprovação.',
            '/admin/despesas',
        );

        DB::table('notifications')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'App\\Notifications\\ActividadeAtrasadaNotificacao',
            'notifiable_type' => User::class,
            'notifiable_id' => $isabel->id,
            'data' => json_encode([
                'title' => 'Actividade atrasada',
                'body' => '«Bloco A — Estrutura» ultrapassou o prazo previsto no '.$kilamba->nome.', com 82% de execução física.',
                'link' => '/admin/projectos/'.$kilamba->id,
                'projecto_id' => $kilamba->id,
            ], JSON_UNESCAPED_UNICODE),
            'read_at' => now()->subHours(30),
            'created_at' => now()->subHours(30),
            'updated_at' => now()->subHours(30),
        ]);
    }
}
