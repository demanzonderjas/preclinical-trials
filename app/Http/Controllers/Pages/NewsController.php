<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\NewsItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    public function index(Request $request): Response
    {
        $items = $this->published();
        $category = array_key_exists((string) $request->query('category'), NewsItem::CATEGORIES) ? $request->query('category') : null;
        $oldestFirst = $request->query('sort') === 'oldest';

        $shown = $category ? $items->where('category', $category)->values() : $items;
        $featured = $shown->first();
        $archive = $shown->slice(1);
        if ($oldestFirst) {
            $archive = $archive->reverse();
        }

        return Inertia::render('news/index', [
            'categories' => collect(NewsItem::CATEGORIES)->map(fn ($label, $value) => [
                'value' => $value,
                'label' => $label,
                'count' => $items->where('category', $value)->count(),
            ])->values(),
            'total' => $items->count(),
            'category' => $category,
            'sort' => $oldestFirst ? 'oldest' : 'newest',
            'featured' => $featured,
            'years' => $archive->groupBy('year')->map(fn (Collection $group, $year) => ['year' => $year, 'items' => $group->values()])->values(),
        ]);
    }

    public function show(int $id): Response
    {
        $item = $this->published()->firstWhere('id', $id);
        abort_unless($item, 404);

        return Inertia::render('news/show', [
            'item' => $item,
            'related' => $this->published()->where('id', '!=', $id)->take(3)->values(),
        ]);
    }

    /**
     * Published news, newest first by the date shown on the item (publish date, else the last
     * update, as on the legacy site).
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function published(): Collection
    {
        return NewsItem::where('status', '!=', 'draft')->get()
            ->map(function (NewsItem $item) {
                $date = Carbon::parse($item->publish_date ?: $item->updated_at);

                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'summary' => trim(strip_tags(html_entity_decode((string) $item->summary))),
                    // Rich text written by admins in the CMS.
                    'content' => (string) $item->content,
                    'image' => $item->image ? "/images/news/{$item->image}" : null,
                    'category' => $item->category,
                    'category_label' => NewsItem::CATEGORIES[$item->category] ?? null,
                    'date' => $date->format('j M Y'),
                    'date_long' => $date->format('j F Y'),
                    'sort_date' => $date->toDateString(),
                    'year' => $date->year,
                ];
            })
            ->sortByDesc('sort_date')
            ->values();
    }
}
