<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Translator;
use Illuminate\Http\Request;

class AIController extends Controller
{
    /**
     * Translates French text from an APAFiS import into English.
     */
    public function translate(Request $request, Translator $translator)
    {
        $request->validate(['text_to_translate' => ['required', 'string', 'max:20000']]);

        $translation = $translator->toEnglish($request->text_to_translate);

        return $translation === null
            ? response()->json(['translation' => null, 'message' => 'translation_failed'], 502)
            : response()->json(['translation' => $translation]);
    }
}
