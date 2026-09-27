<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Mensagens de validação
    |--------------------------------------------------------------------------
    |
    | Subconjunto em português de Portugal (pré-AO) das regras que o SGO usa.
    | O que faltar aqui cai no ficheiro `en` do framework — daí a lista ser
    | curta e explícita em vez de uma cópia parcial do original.
    |
    */

    'accepted' => 'O campo :attribute tem de ser aceite.',
    'after' => 'O campo :attribute tem de ser uma data posterior a :date.',
    'array' => 'O campo :attribute tem de ser uma lista.',
    'before' => 'O campo :attribute tem de ser uma data anterior a :date.',
    'boolean' => 'O campo :attribute tem de ser verdadeiro ou falso.',
    'date' => 'O campo :attribute não é uma data válida.',
    'date_format' => 'O campo :attribute não corresponde ao formato :format.',
    'decimal' => 'O campo :attribute tem de ter :decimal casas decimais.',
    'different' => 'O campo :attribute e o campo :other têm de ser diferentes.',
    'email' => 'O campo :attribute tem de ser um endereço de e-mail válido.',
    'exists' => 'O valor seleccionado para o campo :attribute é inválido.',
    'gt' => [
        'array' => 'O campo :attribute tem de ter mais de :value itens.',
        'file' => 'O campo :attribute tem de ser maior que :value kilobytes.',
        'numeric' => 'O campo :attribute tem de ser maior que :value.',
        'string' => 'O campo :attribute tem de ter mais de :value caracteres.',
    ],
    'gte' => [
        'array' => 'O campo :attribute tem de ter :value ou mais itens.',
        'file' => 'O campo :attribute tem de ser maior ou igual a :value kilobytes.',
        'numeric' => 'O campo :attribute tem de ser maior ou igual a :value.',
        'string' => 'O campo :attribute tem de ter :value ou mais caracteres.',
    ],
    'in' => 'O valor seleccionado para o campo :attribute é inválido.',
    'integer' => 'O campo :attribute tem de ser um número inteiro.',
    'lt' => [
        'array' => 'O campo :attribute tem de ter menos de :value itens.',
        'file' => 'O campo :attribute tem de ser menor que :value kilobytes.',
        'numeric' => 'O campo :attribute tem de ser menor que :value.',
        'string' => 'O campo :attribute tem de ter menos de :value caracteres.',
    ],
    'lte' => [
        'array' => 'O campo :attribute não pode ter mais de :value itens.',
        'file' => 'O campo :attribute tem de ser menor ou igual a :value kilobytes.',
        'numeric' => 'O campo :attribute tem de ser menor ou igual a :value.',
        'string' => 'O campo :attribute não pode ter mais de :value caracteres.',
    ],
    'max' => [
        'array' => 'O campo :attribute não pode ter mais de :max itens.',
        'file' => 'O campo :attribute não pode ter mais de :max kilobytes.',
        'numeric' => 'O campo :attribute não pode ser maior que :max.',
        'string' => 'O campo :attribute não pode ter mais de :max caracteres.',
    ],
    'min' => [
        'array' => 'O campo :attribute tem de ter pelo menos :min itens.',
        'file' => 'O campo :attribute tem de ter pelo menos :min kilobytes.',
        'numeric' => 'O campo :attribute tem de ser pelo menos :min.',
        'string' => 'O campo :attribute tem de ter pelo menos :min caracteres.',
    ],
    'not_in' => 'O valor seleccionado para o campo :attribute é inválido.',
    'numeric' => 'O campo :attribute tem de ser um número.',
    'present' => 'O campo :attribute tem de estar presente.',
    'prohibited' => 'O campo :attribute não é permitido.',
    'prohibited_if' => 'O campo :attribute não é permitido quando :other é :value.',
    'regex' => 'O formato do campo :attribute é inválido.',
    'required' => 'O campo :attribute é obrigatório.',
    'required_if' => 'O campo :attribute é obrigatório quando :other é :value.',
    'required_with' => 'O campo :attribute é obrigatório quando :values está presente.',
    'same' => 'Os campos :attribute e :other têm de ser iguais.',
    'string' => 'O campo :attribute tem de ser texto.',
    'timezone' => 'O campo :attribute tem de ser um fuso horário válido.',
    'unique' => 'Já existe um registo com este :attribute.',
    'uploaded' => 'Não foi possível carregar o ficheiro :attribute.',
    'url' => 'O campo :attribute tem de ser um endereço válido.',

    /*
    |--------------------------------------------------------------------------
    | Nomes dos campos
    |--------------------------------------------------------------------------
    */

    'attributes' => [
        'email' => 'e-mail',
        'password' => 'palavra-passe',
        'password_confirmation' => 'confirmação da palavra-passe',
        'current_password' => 'palavra-passe actual',
        'name' => 'nome',
        'nome' => 'nome',
        'telefone' => 'telefone',
        'morada' => 'morada',
        'nif' => 'NIF',
        'assunto' => 'assunto',
        'mensagem' => 'mensagem',
    ],

];
