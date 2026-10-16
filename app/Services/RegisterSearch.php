<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Search, filters, facet counts and sorting for the public database page, applied to the
 * cached summaries of App\Services\PublicRegister.
 */
class RegisterSearch
{
    public const SEARCH_FIELDS = ['all', 'title', 'hypothesis', 'research_field', 'centre', 'pct_id'];

    public const SORTS = ['newest', 'oldest', 'start', 'relevance', 'pct_id'];

    public const PER_PAGE = [10, 20, 50];

    /** Facet name => summary key; list facets match any of the chosen values. */
    public const FACETS = [
        'stage' => 'study_stage',
        'status' => 'study_status',
        'species' => 'species',
        'country' => 'country',
        'sex' => 'sex',
        'support' => 'financial_support',
        'intervention' => 'intervention_type',
    ];

    /** @var array<string, mixed> */
    public array $filters;

    public function __construct(private PublicRegister $register, Request $request)
    {
        $this->filters = self::normalise($request->query());
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    public static function normalise(array $query): array
    {
        $list = fn ($value) => array_values(array_unique(array_filter(array_map('strval', (array) ($value ?? [])), fn ($item) => $item !== '')));
        $month = fn ($value) => is_string($value) && preg_match('/^\d{4}-\d{2}$/', $value) ? $value : null;

        $filters = [
            'q' => trim(Str::limit((string) ($query['q'] ?? ''), 200, '')),
            'in' => in_array($query['in'] ?? 'all', self::SEARCH_FIELDS, true) ? ($query['in'] ?? 'all') : 'all',
            'before_start' => filter_var($query['before_start'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'from' => $month($query['from'] ?? null),
            'to' => $month($query['to'] ?? null),
            'sort' => in_array($query['sort'] ?? null, self::SORTS, true) ? $query['sort'] : null,
            'per_page' => in_array((int) ($query['per_page'] ?? 10), self::PER_PAGE, true) ? (int) ($query['per_page'] ?? 10) : 10,
        ];
        foreach (array_keys(self::FACETS) as $facet) {
            $filters[$facet] = $list($query[$facet] ?? []);
        }
        // Relevance only means something with a search term.
        $filters['sort'] ??= $filters['q'] !== '' ? 'relevance' : 'newest';

        return $filters;
    }

    /**
     * Everything matching all filters.
     */
    public function results(): Collection
    {
        return $this->sort($this->apply($this->register->summaries()));
    }

    public function paginate(int $page): LengthAwarePaginator
    {
        $results = $this->results();

        return (new LengthAwarePaginator(
            $results->forPage($page, $this->filters['per_page'])->map(fn (array $summary) => PublicRegister::forClient($summary))->values(),
            $results->count(),
            $this->filters['per_page'],
            $page,
            ['path' => '/database']
        ))->withQueryString()->onEachSide(1);
    }

    /**
     * Counts per facet value, each computed with every filter except the facet itself, so
     * the numbers say what you would get by ticking that box.
     *
     * @return array<string, array<int, array{value: string, label: string, count: int}>>
     */
    public function facets(): array
    {
        $all = $this->register->summaries();
        $facets = [];

        foreach (self::FACETS as $facet => $key) {
            $pool = $this->apply($all, except: $facet);
            $counts = [];
            foreach ($pool as $summary) {
                foreach ((array) ($summary[$key] ?? []) as $value) {
                    if ($value !== null && $value !== '') {
                        $counts[$value] = ($counts[$value] ?? 0) + 1;
                    }
                }
            }
            // Keep chosen values visible even when nothing matches them any more.
            foreach ($this->filters[$facet] as $chosen) {
                $counts[$chosen] ??= 0;
            }
            arsort($counts);

            $facets[$facet] = collect($counts)->map(fn (int $count, string $value) => [
                'value' => $value,
                'label' => self::label($facet, $value),
                'count' => $count,
            ])->values()->all();
        }

        return $facets;
    }

    /**
     * Registrations per year within the current filters (ignoring the date range itself).
     *
     * @return array<int, array{year: int, count: int}>
     */
    public function years(): array
    {
        $counts = $this->apply($this->register->summaries(), except: 'date')
            ->whereNotNull('registered_year')
            ->countBy('registered_year');
        if ($counts->isEmpty()) {
            return [];
        }

        return collect(range($counts->keys()->min(), max($counts->keys()->max(), now()->year)))
            ->map(fn (int $year) => ['year' => $year, 'count' => $counts->get($year, 0)])
            ->all();
    }

    public function beforeStartCount(): int
    {
        return $this->apply($this->register->summaries(), except: 'before_start')->where('registered_before_start', true)->count();
    }

    public static function label(string $facet, string $value): string
    {
        return match ($facet) {
            'stage' => __("pct.study_stage.$value"),
            'status' => __("pct.study_status.$value"),
            'species' => __("pct.species.$value"),
            'country' => config("pct.countries.$value") ?? $value,
            'sex' => __("pct.sex.$value"),
            'support' => __("pct.financial_support.$value"),
            'intervention' => __("pct.intervention_type.$value"),
            default => $value,
        };
    }

    private function apply(Collection $summaries, ?string $except = null): Collection
    {
        $filters = $this->filters;
        $terms = $filters['q'] === '' ? [] : preg_split('/\s+/', mb_strtolower($filters['q']));

        return $summaries->filter(function (array $summary) use ($filters, $terms, $except) {
            if ($terms && ! $this->matches($summary, $terms, $filters['in'])) {
                return false;
            }
            if ($except !== 'before_start' && $filters['before_start'] && ! $summary['registered_before_start']) {
                return false;
            }
            if ($except !== 'date' && ($filters['from'] || $filters['to'])) {
                $month = $summary['registered_at'] ? Carbon::parse($summary['registered_at'])->format('Y-m') : null;
                if (! $month || ($filters['from'] && $month < $filters['from']) || ($filters['to'] && $month > $filters['to'])) {
                    return false;
                }
            }
            foreach (self::FACETS as $facet => $key) {
                if ($facet === $except || ! $filters[$facet]) {
                    continue;
                }
                if (! array_intersect((array) ($summary[$key] ?? []), $filters[$facet])) {
                    return false;
                }
            }

            return true;
        })->values();
    }

    /**
     * Every search word must appear in the chosen field (or in any field).
     *
     * @param  array<int, string>  $terms
     */
    private function matches(array $summary, array $terms, string $in): bool
    {
        $haystack = mb_strtolower($in === 'all' ? implode(' ', $summary['search']) : ($summary['search'][$in] ?? ''));

        foreach ($terms as $term) {
            if (! str_contains($haystack, $term)) {
                return false;
            }
        }

        return true;
    }

    private function sort(Collection $results): Collection
    {
        return match ($this->filters['sort']) {
            'oldest' => $results->sortBy('registered_at')->values(),
            'start' => $results->sortByDesc('start_date')->values(),
            'pct_id' => $results->sortBy('id')->values(),
            'relevance' => $results->sortByDesc(fn (array $summary) => $this->relevance($summary))->values(),
            default => $results->sortByDesc('registered_at')->values(),
        };
    }

    /** Title hits weigh most, then hypothesis, then anything else. */
    private function relevance(array $summary): int
    {
        $score = 0;
        foreach (preg_split('/\s+/', mb_strtolower($this->filters['q'])) ?: [] as $term) {
            $score += substr_count(mb_strtolower($summary['search']['title']), $term) * 5;
            $score += substr_count(mb_strtolower($summary['search']['hypothesis']), $term) * 2;
            $score += substr_count(mb_strtolower(implode(' ', $summary['search'])), $term);
        }

        return $score;
    }
}
