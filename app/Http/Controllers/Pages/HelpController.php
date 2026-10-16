<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\FaqCategory;
use App\Models\FaqItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class HelpController extends Controller
{
    public const POPULAR = ['Embargo', 'Amendment', 'PRIS', 'Time stamp', 'Re-submit'];

    public function index(Request $request): Response
    {
        // In the order the PCT team set: categories first, then the questions within them.
        $items = FaqItem::with('faqCategory')->where('status', '!=', 'draft')->get()
            ->sortBy([fn ($a, $b) => ($a->faqCategory?->order ?? 0) <=> ($b->faqCategory?->order ?? 0), fn ($a, $b) => $a->faq_category_id <=> $b->faq_category_id, fn ($a, $b) => $a->order <=> $b->order, fn ($a, $b) => $a->id <=> $b->id])
            ->values();
        $audience = array_key_exists((string) $request->query('for'), FaqItem::AUDIENCES) ? $request->query('for') : 'researcher';
        $query = trim(Str::limit((string) $request->query('q', ''), 100, ''));

        $present = fn (FaqItem $item) => [
            'id' => $item->id,
            'title' => $item->title,
            // Answers are written by admins in the CMS.
            'content' => $item->content,
            'category' => $item->faqCategory?->name ?? 'Other',
            'category_order' => $item->faqCategory?->order ?? 999,
            'audiences' => $item->audience_list,
        ];

        $results = null;
        if ($query !== '') {
            $words = preg_split('/\s+/', mb_strtolower($query));
            $results = $items->filter(function (FaqItem $item) use ($words) {
                $text = mb_strtolower($item->title.' '.strip_tags($item->content));

                return collect($words)->every(fn ($word) => str_contains($text, $word));
            })->map($present)->values();
        }

        return Inertia::render('help', [
            'audiences' => collect(FaqItem::AUDIENCES)->map(fn ($info, $key) => [
                'value' => $key,
                'label' => $info[0],
                'description' => $info[1],
                'count' => $items->filter(fn (FaqItem $item) => in_array($key, $item->audience_list, true))->count(),
            ])->values(),
            'audience' => $audience,
            'items' => $items->filter(fn (FaqItem $item) => in_array($audience, $item->audience_list, true))
                ->map($present)
                ->values(),
            'total' => $items->count(),
            'query' => $query,
            'results' => $results,
            'popular' => self::POPULAR,
            'voted' => $request->session()->get('faq_votes', []),
            'updatedOn' => optional($items->max('updated_at'))->format('F Y'),
        ]);
    }

    /**
     * "Was this helpful?" One vote per question per session.
     */
    public function feedback(Request $request, int $id): RedirectResponse
    {
        $data = $request->validate(['helpful' => ['required', 'boolean']]);
        $item = FaqItem::where('status', '!=', 'draft')->findOrFail($id);
        $votes = $request->session()->get('faq_votes', []);

        if (! array_key_exists($item->id, $votes)) {
            $item->increment($data['helpful'] ? 'helpful_count' : 'not_helpful_count');
            $votes[$item->id] = (bool) $data['helpful'];
            $request->session()->put('faq_votes', $votes);
        }

        return back();
    }
}
