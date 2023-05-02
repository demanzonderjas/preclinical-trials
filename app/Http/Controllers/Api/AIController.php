<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Orhanerday\OpenAi\OpenAi;


class AIController extends Controller
{
    public function translate(Request $request) {

        $open_ai_key = env('OPENAI_API_KEY');
        $open_ai = new OpenAi($open_ai_key);

        $chat = $open_ai->chat([
        'model' => 'gpt-3.5-turbo',
        'messages' => [
            [
                "role" => "user",
                "content" => "Please translate the following quoted text from French into English: '" . $request->text_to_translate ."'. Show the translation only."
            ],
        ],
        'temperature' => 1.0,
        'frequency_penalty' => 0,
        'presence_penalty' => 0,
        ]);


        $d = json_decode($chat);

        // dd($d);

        // Get Content
        echo($d->choices[0]->message->content);
    }

}
