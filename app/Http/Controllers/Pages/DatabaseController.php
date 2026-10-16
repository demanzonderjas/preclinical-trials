<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Services\PublicRegister;
use App\Services\RegisterSearch;
use App\Support\Csv;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DatabaseController extends Controller
{
    /** Shown under the search box; a curated list until search statistics exist. */
    public const POPULAR = ['Neonatal resuscitation', 'Myocardial infarction', 'Ischemia-reperfusion', 'Stroke', 'Antimicrobials'];

    public function index(Request $request, PublicRegister $register): Response
    {
        $search = new RegisterSearch($register, $request);
        $figures = $register->figures();

        return Inertia::render('database/index', [
            'filters' => $search->filters,
            'results' => $search->paginate(max(1, (int) $request->query('page', 1))),
            'facets' => $search->facets(),
            'years' => $search->years(),
            'beforeStartCount' => $search->beforeStartCount(),
            'publicTotal' => $figures['public'],
            'underEmbargo' => $figures['under_embargo'],
            'popular' => self::POPULAR,
        ]);
    }

    /**
     * The matching protocols as CSV, for logged-in users (as the Excel export was).
     */
    public function export(Request $request, PublicRegister $register): StreamedResponse
    {
        $results = (new RegisterSearch($register, $request))->results();

        $columns = [
            'PCT ID' => 'pct_id',
            'Title' => 'title',
            'Date of registration' => fn ($row) => $row['registered_at'] ? substr($row['registered_at'], 0, 10) : '',
            'Registered before study start' => fn ($row) => $row['registered_before_start'] ? 'yes' : 'no',
            'Study status' => 'study_status_label',
            'Study stage' => 'study_stage_label',
            'Species' => 'species_label',
            'Research field' => 'research_field',
            'Study centre' => 'centre_name',
            'City' => 'centre_city',
            'Country' => 'country_name',
            'Start date' => 'start_date',
            'Expected end date' => 'end_date',
            'Hypothesis' => 'summary',
            'Link' => fn ($row) => url("/database/view-protocol/{$row['id']}"),
        ];

        return Csv::download('preclinicaltrials-protocols-'.now()->format('Y-m-d').'.csv', $columns, $results);
    }
}
