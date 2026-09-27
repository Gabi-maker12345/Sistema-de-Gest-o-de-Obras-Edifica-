<?php

namespace App\Console\Commands;

use App\Enums\EstadoActividade;
use App\Enums\EstadoTarefa;
use App\Models\Actividade;
use App\Models\Projecto;
use App\Models\Tarefa;
use Illuminate\Console\Command;

class MarcarAtrasadas extends Command
{
    /**
     * @var string
     */
    protected $signature = 'actividades:marcar-atrasadas';

    /**
     * @var string
     */
    protected $description = 'Marca como atrasadas as actividades e tarefas cujo prazo expirou sem conclusão, e recalcula a execução física dos projectos.';

    public function handle(): int
    {
        $hoje = now()->startOfDay();

        $actividades = Actividade::query()
            ->whereDate('data_fim_prevista', '<', $hoje)
            ->whereNotIn('estado', [EstadoActividade::Concluida, EstadoActividade::Atrasada])
            ->update(['estado' => EstadoActividade::Atrasada->value]);

        $tarefas = Tarefa::query()
            ->whereDate('prazo', '<', $hoje)
            ->whereNotIn('estado', [EstadoTarefa::Concluida, EstadoTarefa::Atrasada])
            ->update(['estado' => EstadoTarefa::Atrasada->value]);

        $this->components->info("Actividades marcadas como atrasadas: {$actividades}");
        $this->components->info("Tarefas marcadas como atrasadas: {$tarefas}");

        $projectos = $this->recalcularExecucaoFisica();

        $this->components->info("Projectos com execução física recalculada: {$projectos}");

        return self::SUCCESS;
    }

    /**
     * Recalcula a execução física dos projectos com actividades em atraso.
     */
    protected function recalcularExecucaoFisica(): int
    {
        $ids = Actividade::query()
            ->where('estado', EstadoActividade::Atrasada)
            ->distinct()
            ->pluck('projecto_id')
            ->filter()
            ->all();

        if ($ids === []) {
            return 0;
        }

        $total = 0;

        Projecto::whereIn('id', $ids)->each(function (Projecto $projecto) use (&$total): void {
            $projecto->recalcularExecucaoFisica();
            $total++;
        });

        return $total;
    }
}
