<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

/** Translates French text from APAFiS imports into English with OpenAI. */
class Translator
{
    /** The translation, or null when the service is not configured or fails. */
    public function toEnglish(string $text): ?string
    {
        if (! config('services.openai.key')) {
            return null;
        }

        $response = Http::withToken(config('services.openai.key'))
            ->timeout(60)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model'),
                'temperature' => 0,
                'messages' => [
                    ['role' => 'system', 'content' => 'Translate the French text the user sends into English. Reply with the translation only.'],
                    ['role' => 'user', 'content' => $text],
                ],
            ]);

        if ($response->failed()) {
            report($response->toException());

            return null;
        }

        return $response->json('choices.0.message.content');
    }
}
