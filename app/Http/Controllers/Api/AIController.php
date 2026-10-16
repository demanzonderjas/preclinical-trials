<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
    /**
     * Translates French text from an APAFiS import into English.
     */
    public function translate(Request $request)
    {
        $request->validate(['text_to_translate' => ['required', 'string', 'max:20000']]);

        $response = Http::withToken(config('services.openai.key'))
            ->timeout(60)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model'),
                'temperature' => 0,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Translate the French text the user sends into English. Reply with the translation only.',
                    ],
                    ['role' => 'user', 'content' => $request->text_to_translate],
                ],
            ]);

        if ($response->failed()) {
            report($response->toException());

            return response()->json(['translation' => null, 'message' => 'translation_failed'], 502);
        }

        return response()->json(['translation' => $response->json('choices.0.message.content')]);
    }
}
