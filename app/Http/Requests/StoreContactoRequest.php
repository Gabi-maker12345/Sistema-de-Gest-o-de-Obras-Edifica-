<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactoRequest extends FormRequest
{
    /**
     * @return array<string, list<string>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'min:3', 'max:120'],
            'email' => ['required', 'string', 'email:rfc', 'max:180'],
            'assunto' => ['required', 'string', 'min:5', 'max:160'],
            'mensagem' => ['required', 'string', 'min:20', 'max:2000'],
        ];
    }

    /**
     * As traduções do sistema ainda não estão em português (D1, sem dependências
     * novas): a folha de contacto é a única que valida texto longo do
     * utilizador, por isso as mensagens vivem aqui, em português de Portugal.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'Indique o seu nome.',
            'nome.min' => 'O nome deve ter pelo menos 3 caracteres.',
            'nome.max' => 'O nome não pode ter mais de 120 caracteres.',

            'email.required' => 'Indique o seu e-mail.',
            'email.email' => 'O e-mail indicado não é válido.',
            'email.max' => 'O e-mail não pode ter mais de 180 caracteres.',

            'assunto.required' => 'Indique o assunto.',
            'assunto.min' => 'O assunto deve ter pelo menos 5 caracteres.',
            'assunto.max' => 'O assunto não pode ter mais de 160 caracteres.',

            'mensagem.required' => 'Escreva a sua mensagem.',
            'mensagem.min' => 'A mensagem deve ter pelo menos 20 caracteres.',
            'mensagem.max' => 'A mensagem não pode ter mais de 2000 caracteres.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'nome' => 'nome',
            'email' => 'e-mail',
            'assunto' => 'assunto',
            'mensagem' => 'mensagem',
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
